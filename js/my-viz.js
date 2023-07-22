// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 70, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const timeseriesContainer = d3
  .select("#timeseries")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

const timeseriesSVG = timeseriesContainer
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const covidDeathsSVG = timeseriesContainer
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + (margin.top + height / 2) + ")");

const timeseriesPath = timeseriesSVG.append("path")

const covidDeathsPath = covidDeathsSVG.append("path")

const timeseriesAnnotations = timeseriesSVG
  .append("g")
  .attr("class", "annotation-group")

const mouseG = timeseriesSVG
  .append('g')
  .classed('mouse', true)
  .style('display', 'none')

mouseG
  .append('rect')
  .attr('width', 2)
  .attr('x',-1)
  .attr('height', height)
  .attr('fill', 'lightgray');

mouseG
  .append('circle')
  .attr('id', "covid-cases-circle")
  .attr('r', 3)
  .attr("stroke", "steelblue")

mouseG
  .append('circle')
  .attr('id', "covid-deaths-circle")
  .attr('r', 3)
  .attr("stroke", "steelblue")

const dateText = mouseG
  .append('text')
  .attr('dy', '0em')
const covidCasesText = mouseG
  .append('text')
  .attr('dy', '1em')
const covidDeathsText = mouseG
  .append('text')
  .attr('dy', '2em')

timeseriesContainer
  .on("mouseover", function(mouse) {
    const [x_cord, y_cord] = d3.pointer(mouse)
    if (x_cord < 100) {
      return
    }

    mouseG.style('display', 'block')
  })


// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height / 2, 0]);
var y2 = d3.scaleLinear().range([height / 2, 0]);

var minDate = null
var maxDate = null
let currentMaxDate = null

let covidCasesData = null
let covidDeathsData = null
let stateCasesData = null
let stateDeathsData = null

timeseriesContainer
  .on("mousemove", function(mouse) {
    const [x_cord, y_cord] = d3.pointer(mouse);
    if (x_cord < 100) {
      return
    }

    if (covidCasesData == null) {
      return
    }
    const bisect = d3.bisector(d => d.date)
    const current_date = covidCasesData[bisect.left(covidCasesData, x.invert(x_cord - 100))].date

    if (current_date > currentMaxDate) {
      mouseG.style('display', 'none')
      return
    } else {
      mouseG.style('display', 'block')
    }

    // const current_date = minDate + Math.round(ratio * (maxDate - minDate));
    const cnt = covidCasesData.find(d => d.date === current_date).covid_cases;
    const deaths = covidDeathsData.find(d => d.date === current_date).covid_deaths;
    mouseG.attr('transform', `translate(${x(current_date)},${0})`);
    dateText
      .text(`week ending: ${current_date.toLocaleDateString('en-US')}`)
      .attr('text-anchor', x_cord < width / 2 ? "start" : "end")
    covidCasesText
      .text(`new covid cases: ${cnt}`)
      .attr('text-anchor', x_cord < width / 2 ? "start" : "end")
    covidDeathsText
      .text(`new covid deaths: ${deaths}`)
      .attr('text-anchor', x_cord < width / 2 ? "start" : "end")
    mouseG.select('#covid-cases-circle').attr('cy', y(cnt));
    mouseG.select('#covid-deaths-circle').attr('cy', y2(deaths) + 410 / 2);
  })
  .on("mouseout", function(mouse) {
    mouseG.style('display', 'none');
  })

// define the line
var casesValueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.covid_cases); });

var deathsValueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y2(d.covid_deaths); });

// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%d");

const annotations = [
  {
    note: {
      label: "Longer text to show text wrapping",
      bgPadding: 20,
      title: "Annotations :)"
    },
    connector: {
      end: "arrow"
    },
    dy: -100,
    // dx: -142,
    // subject: { y:"bottom" },
    data: { date: "2020-04-30", covid_cases: 1000 },
    className: "show-bg"
  },
  {
    note: {
      label: "Some other thing",
      bgPadding: 20,
      title: "Annotations :)"
    },
    connector: {
      end: "arrow"
    },
    dy: -150,
    dx: -200,
    // dx: -142,
    // subject: { y:"bottom" },
    data: { date: "2021-05-12", covid_cases: 50000 },
    className: "show-bg"
  },
]

const getMapJSONPromise = d3.json("d3/states-10m.json")
const getDataPromise = d3.csv("data/covid_weekly_data.csv")

// Get the data
const setupTimeSeriesChartPromise = getDataPromise.then(function(data) {
  data.forEach(function(d) {
      d.date = parseTime(d.date)
      d.covid_cases = +d.covid_cases
      d.covid_deaths = +d.covid_deaths
  })

  covidCasesData = d3.rollup(
    data,
    function(v) { return d3.sum(v, function(d) { return d.covid_cases })},
    function(d) { return d.date }
  )

  covidDeathsData = d3.rollup(
    data,
    function(v) { return d3.sum(v, function(d) { return d.covid_deaths })},
    function(d) { return d.date }
  )

  covidCasesData = Array.from(covidCasesData, function(item) {
    return {date: item[0], covid_cases: item[1]}
  })
  covidDeathsData = Array.from(covidDeathsData, function(item) {
    return {date: item[0], covid_deaths: item[1]}
  })
  const extent = d3.extent(data, d=>d.date)
  minDate = extent[0]
  maxDate = extent[1]

  x.domain(d3.extent(covidDeathsData, function(d) { return d.date; }))
  y.domain([0, d3.max(covidCasesData, function(d) { return d.covid_cases; })])
  y2.domain([0, d3.max(covidDeathsData, function(d) { return d.covid_deaths; })])

  // Add the X Axis
  covidDeathsSVG
    .append("g")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("fill", "black")
    .text("week")
    .style("font-size", "15px")
    .attr("transform", "translate(" + width / 2 + "," + 35 + ")")

  // Add the Y Axis
  timeseriesSVG
    .append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "black")
    .text("new covid cases")
    .style("font-size", "15px")
    .attr("transform", "translate(-70, 30) rotate(-90)")

  covidDeathsSVG
    .append("g")
    .call(d3.axisLeft(y2))
    .append("text")
    .attr("fill", "black")
    .text("new covid deahts")
    .style("font-size", "15px")
    .attr("transform", "translate(-70, 30) rotate(-90)")

  return {
    covidCasesData: covidCasesData,
    covidDeathsData: covidDeathsData,
    rawData: data
  }
});


let mapMargin = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};
let mapWidth = 800 - mapMargin.left - mapMargin.right;
let mapHeight = 600 - mapMargin.top - mapMargin.bottom;

// Creates sources <svg> element and inner g (for margins)
const casesSVG = d3
  .select("#cases-map")
  .append("svg")
  .attr("width", mapWidth + mapMargin.left + mapMargin.right)
  .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
  .append("g")
  .attr("transform", `translate(${mapMargin.left}, ${mapMargin.top})`)

const casesProjection = d3.geoAlbersUsa()
const casesPath = d3.geoPath(casesProjection)
const casesColor = d3.scaleSequential(d3.interpolateBlues)

const deathsSVG = d3
  .select("#deaths-map")
  .append("svg")
  .attr("width", mapWidth + mapMargin.left + mapMargin.right)
  .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
  .append("g")
  .attr("transform", `translate(${mapMargin.left}, ${mapMargin.top})`)

const deathsProjection = d3.geoAlbersUsa()
const deathsPath = d3.geoPath(casesProjection)
const deathsColor = d3.scaleSequential(d3.interpolateReds)

const mapTooltip = d3.select("#map-tooltip")

const setupMapsPromise = getMapJSONPromise
  .then((us) => {
    const states = topojson.feature(us, us.objects.states).features;
    const nation = topojson.feature(us, us.objects.nation).features[0];

    // scale to fit bounds
    casesProjection.fitSize([mapWidth, mapHeight], nation)
    deathsProjection.fitSize([mapWidth, mapHeight], nation)
    const emptyGeoData = states.map((feature) => ({
      feature: feature,
      name: feature.properties.name,
      value: 0
    }));

    casesSVG
      .selectAll("path")
      .data(emptyGeoData)
      .enter()
      .append("path")
      .attr("d", (d) => casesPath(d.feature))
      .style("fill", (d) => casesColor(d.value))
      .on("mouseover", function(e, d) {
        mapTooltip
          .style("position", "absolute")
          .style("opacity", 0.8)
          .html(d.name + ": " + d3.format(",.2r")(stateCasesData.get(d.name)) + " total cases")
          .style("left", (e.pageX) + "px")
          .style("top", (e.pageY - 28) + "px");
      })
      .on("mouseleave", function(e, d) {
        mapTooltip
          .style("opacity", 0)
      })

    deathsSVG
      .selectAll("path")
      .data(emptyGeoData)
      .enter()
      .append("path")
      .attr("d", (d) => deathsPath(d.feature))
      .style("fill", (d) => deathsColor(d.value))
      .on("mouseover", function(e, d) {
        mapTooltip
          .style("position", "absolute")
          .style("opacity", 0.8)
          .html(d.name + ": " + d3.format(",.2r")(stateDeathsData.get(d.name)) + " total deaths")
          .style("left", (e.pageX) + "px")
          .style("top", (e.pageY - 28) + "px");
      })
      .on("mouseleave", function(e, d) {
        mapTooltip
          .style("opacity", 0)
      })

    return states
  })

function changeSlide(maxDate) {
  Promise.all([setupTimeSeriesChartPromise, setupMapsPromise])
  .then((values) => {
    const data = values[0]
    const statesMap = values[1]
    currentMaxDate = new Date(maxDate)
    const filteredCasesData = data.covidCasesData.filter(function(x) {return x.date <= currentMaxDate})
    const filteredDeathData = data.covidDeathsData.filter(function(x) {return x.date <= currentMaxDate})
    const filteredRawData = data.rawData.filter((x) => x.date <= currentMaxDate)
    const filteredAnnotations = annotations.filter(function(x) {return new Date(x.data.date) <= currentMaxDate})

    timeseriesPath
      .data([filteredCasesData])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("d", casesValueline);

    covidDeathsPath
      .data([filteredDeathData])
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("d", deathsValueline);

    const makeAnnotations = d3.annotation()
      .notePadding(15)
      .type(d3.annotationCalloutCircle)
      .accessors({
        x: d => x(parseTime(d.date)),
        y: d => y(d.covid_cases)
      })
      .annotations(filteredAnnotations)

    timeseriesAnnotations.call(makeAnnotations)

    stateCasesData = d3.rollup(
      filteredRawData,
      function(v) { return d3.sum(v, function(d) { return d.covid_cases })},
      function(d) { return d.state }
    )
    const maxStateCovidCases = Math.max(...stateCasesData.values())
    const geoCasesData = statesMap.map((feature) => ({
      feature: feature,
      name: feature.properties.name,
      value: stateCasesData.get(feature.properties.name) / maxStateCovidCases
    }))
    casesSVG
      .selectAll("path")
      .data(geoCasesData)
      .style("fill", (d) => casesColor(d.value))

    stateDeathsData = d3.rollup(
      filteredRawData,
      function(v) { return d3.sum(v, function(d) { return d.covid_deaths })},
      function(d) { return d.state }
    )
    const maxStateCovidDeaths = Math.max(...stateDeathsData.values())
    const geoDeathsData = statesMap.map((feature) => ({
      feature: feature,
      name: feature.properties.name,
      value: stateDeathsData.get(feature.properties.name) / maxStateCovidDeaths
    }))
    deathsSVG
      .selectAll("path")
      .data(geoDeathsData)
      .style("fill", (d) => deathsColor(d.value))
  })
}

changeSlide("2020-12-31")

