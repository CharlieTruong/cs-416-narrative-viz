const timeSeriesMargin = {top: 20, right: 20, bottom: 70, left: 100}
const timeSeriesWidth = 800 - timeSeriesMargin.left - timeSeriesMargin.right
const timeSeriesHeight = 600 - timeSeriesMargin.top - timeSeriesMargin.bottom

const timeseriesContainer = d3
  .select("#timeseries")
  .append("svg")
  .attr("width", timeSeriesWidth + timeSeriesMargin.left + timeSeriesMargin.right)
  .attr("height", timeSeriesHeight + timeSeriesMargin.top + timeSeriesMargin.bottom)

const covidCasesSVG = timeseriesContainer
  .append("g")
  .attr("transform", "translate(" + timeSeriesMargin.left + "," + timeSeriesMargin.top + ")");

const covidDeathsSVG = timeseriesContainer
  .append("g")
  .attr("transform", "translate(" + timeSeriesMargin.left + "," + (timeSeriesMargin.top + timeSeriesHeight / 3) + ")");

const covidVaxSVG = timeseriesContainer
  .append("g")
  .attr("transform", "translate(" + timeSeriesMargin.left + "," + (timeSeriesMargin.top + timeSeriesHeight / 3 * 2) + ")");

const covidCasesPath = covidCasesSVG.append("path")
const covidDeathsPath = covidDeathsSVG.append("path")
const covidVaxPath = covidVaxSVG.append("path")

const casesAnnotations = covidCasesSVG
  .append("g")
  .style("font-size", "14px")
const deathsAnnotations = covidDeathsSVG
  .append("g")
  .style("font-size", "14px")
const vaxAnnotations = covidVaxSVG
  .append("g")
  .style("font-size", "14px")

const timeseriesTooltipGroup = covidCasesSVG
  .append("g")
  .style("display", "none")

timeseriesTooltipGroup
  .append("rect")
  .attr("width", 2)
  .attr("x", -1)
  .attr("height", timeSeriesHeight)
  .attr("fill", "lightgray");

timeseriesTooltipGroup
  .append("circle")
  .attr("id", "covid-cases-circle")
  .attr("r", 3)
  .attr("stroke", "orange")

timeseriesTooltipGroup
  .append("circle")
  .attr("id", "covid-deaths-circle")
  .attr("r", 3)
  .attr("stroke", "red")

timeseriesTooltipGroup
  .append("circle")
  .attr("id", "covid-vax-circle")
  .attr("r", 3)
  .attr("stroke", "steelblue")

const dateText = timeseriesTooltipGroup
  .append("text")
  .attr("dy", "0em")
const covidCasesText = timeseriesTooltipGroup
  .append("text")
  .attr("dy", "1em")
const covidDeathsText = timeseriesTooltipGroup
  .append("text")
  .attr("dy", "2em")
const covidVaxText = timeseriesTooltipGroup
  .append("text")
  .attr("dy", "3em")

timeseriesContainer
  .on("mouseover", function(mouse) {
    const [x_cord, y_cord] = d3.pointer(mouse)
    if (x_cord < timeSeriesMargin.left) {
      return
    }

    timeseriesTooltipGroup.style('display', 'block')
  })


// set the ranges
const x = d3.scaleTime().range([0, timeSeriesWidth]);
const y = d3.scaleLinear().range([timeSeriesHeight / 3, 0])
const y2 = d3.scaleLinear().range([timeSeriesHeight / 3, 0])
const y3 = d3.scaleLinear().range([timeSeriesHeight / 3, 0])

let minDate = null
let maxDate = null
let currentMaxDate = null

let covidCasesData = null
let covidDeathsData = null
let covidVaxData = null
let stateCasesData = null
let stateDeathsData = null

timeseriesContainer
  .on("mousemove", function(mouse) {
    const [x_cord, y_cord] = d3.pointer(mouse);
    if (x_cord < timeSeriesMargin.left) {
      return
    }

    if (covidCasesData == null) {
      return
    }
    const bisect = d3.bisector(d => d.date)
    const current_date = covidCasesData[bisect.left(covidCasesData, x.invert(x_cord - 100))].date

    if (current_date > currentMaxDate) {
      timeseriesTooltipGroup.style('display', 'none')
      return
    } else {
      timeseriesTooltipGroup.style('display', 'block')
    }

    const cases = covidCasesData.find(d => d.date === current_date).covid_cases;
    const deaths = covidDeathsData.find(d => d.date === current_date).covid_deaths;
    const vaxes = covidVaxData.find(d => d.date === current_date).cum_one_vax_dose;
    timeseriesTooltipGroup.attr('transform', `translate(${x(current_date)},${0})`);
    dateText
      .text(`week ending: ${current_date.toLocaleDateString('en-US')}`)
      .attr("text-anchor", x_cord < timeSeriesWidth / 2 ? "start" : "end")
    covidCasesText
      .text(`new covid cases: ${cases}`)
      .attr("text-anchor", x_cord < timeSeriesWidth / 2 ? "start" : "end")
    covidDeathsText
      .text(`new covid deaths: ${deaths}`)
      .attr("text-anchor", x_cord < timeSeriesWidth / 2 ? "start" : "end")
    covidVaxText
      .text(`cum. at least one vax dose: ${vaxes}`)
      .attr("text-anchor", x_cord < timeSeriesWidth / 2 ? "start" : "end")
    timeseriesTooltipGroup.select("#covid-cases-circle").attr("cy", y(cases))
    timeseriesTooltipGroup.select("#covid-deaths-circle").attr("cy", y2(deaths) + timeSeriesHeight / 3)
    timeseriesTooltipGroup.select("#covid-vax-circle").attr("cy", y3(vaxes) + timeSeriesHeight / 3 * 2)
  })
  .on("mouseout", function(mouse) {
    timeseriesTooltipGroup.style("display", "none")
  })

const casesValueline = d3.line()
  .x(function(d) { return x(d.date)})
  .y(function(d) { return y(d.covid_cases)})

const deathsValueline = d3.line()
  .x(function(d) { return x(d.date)})
  .y(function(d) { return y2(d.covid_deaths)})

const vaxValueline = d3.line()
  .x(function(d) { return x(d.date)})
  .y(function(d) { return y3(d.cum_one_vax_dose)})

const parseTime = d3.timeParse("%Y-%m-%d");

const slides = [
  {
    date: parseTime("2020-04-19"),
    annotationContainer: covidDeathsSVG,
    accessors: {
      x: d => x(parseTime(d.date)),
      y: d => y2(d.covid_deaths)
    },
    annotation: {
      note: {
        label: "Initial peak in covid deaths during pandemic",
        title: "Apr 19, 2020"
      },
      connector: {
        end: "arrow"
      },
      dx: 10,
      dy: -50,
      data: { date: "2020-04-19", covid_deaths: 15307 },
    }
  },
  {
    date: parseTime("2021-01-17"),
    annotationContainer: covidDeathsSVG,
    accessors: {
      x: d => x(parseTime(d.date)),
      y: d => y2(d.covid_deaths)
    },
    annotation: {
      note: {
        label: "New peak in covid deaths as vaccinations start in Dec 2020",
        title: "Jan 17, 2021"
      },
      connector: {
        end: "arrow"
      },
      dx: 10,
      dy: -50,
      data: { date: "2021-01-17", covid_deaths: 23321 },
    }
  },
  {
    date: parseTime("2022-01-16"),
    annotationContainer: covidCasesSVG,
    accessors: {
      x: d => x(parseTime(d.date)),
      y: d => y(d.covid_cases)
    },
    annotation: {
      note: {
        label: "Covid cases surge but deaths are not similarly surging as more are vaccinated",
        title: "Jan 16, 2022"
      },
      connector: {
        end: "arrow"
      },
      dx: 10,
      dy: 100,
      data: { date: "2022-01-16", covid_cases: 5641443 },
    }
  },
  {
    date: parseTime("2023-03-12"),
    annotationContainer: covidDeathsSVG,
    accessors: {
      x: d => x(parseTime(d.date)),
      y: d => y2(d.covid_deaths)
    },
    annotation: {
      note: {
        label: "Covid cases and deaths have stabilized",
        title: "Mar 12, 2023"
      },
      connector: {
        end: "arrow"
      },
      dx: -50,
      dy: -100,
      data: { date: "2023-03-12", covid_deaths: 1702 },
    }
  }
]

// Fetch map and covid weekly data
const getMapJSONPromise = d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
const getDataPromise = d3.csv("data/covid_weekly_data.csv")

// Setup the timeseries chart
const setupTimeSeriesChartPromise = getDataPromise.then(function(data) {
  data.forEach(function(d) {
      d.date = parseTime(d.date)
      d.covid_cases = +d.covid_cases
      d.covid_deaths = +d.covid_deaths
      d.cum_one_vax_dose = +d.cum_one_vax_dose
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

  covidVaxData = d3.rollup(
    data,
    function(v) { return d3.sum(v, function(d) { return d.cum_one_vax_dose })},
    function(d) { return d.date }
  )

  covidCasesData = Array.from(covidCasesData, function(item) {
    return {date: item[0], covid_cases: item[1]}
  })
  covidDeathsData = Array.from(covidDeathsData, function(item) {
    return {date: item[0], covid_deaths: item[1]}
  })
  covidVaxData = Array.from(covidVaxData, function(item) {
    return {date: item[0], cum_one_vax_dose: item[1]}
  })
  const extent = d3.extent(data, d=>d.date)
  minDate = extent[0]
  maxDate = extent[1]

  x.domain(d3.extent(covidDeathsData, function(d) { return d.date; }))
  y.domain([0, d3.max(covidCasesData, function(d) { return d.covid_cases; })])
  y2.domain([0, d3.max(covidDeathsData, function(d) { return d.covid_deaths; }) * 2])
  y3.domain([0, d3.max(covidVaxData, function(d) { return d.cum_one_vax_dose; })])

  covidVaxSVG
    .append("g")
    .attr("transform", "translate(0," + timeSeriesHeight / 3 + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("fill", "black")
    .text("week")
    .style("font-size", "15px")
    .attr("transform", "translate(" + timeSeriesWidth / 2 + "," + 35 + ")")

  covidCasesSVG
    .append("g")
    .attr("id", "cases-y-axis")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "black")
    .text("new covid cases")
    .style("font-size", "15px")
    .attr("transform", "translate(-70, 30) rotate(-90)")

  covidDeathsSVG
    .append("g")
    .attr("id", "deaths-y-axis")
    .call(d3.axisLeft(y2))
    .append("text")
    .attr("fill", "black")
    .text("new covid deaths")
    .style("font-size", "15px")
    .attr("transform", "translate(-70, 30) rotate(-90)")

  covidVaxSVG
    .append("g")
    .attr("id", "vax-y-axis")
    .call(d3.axisLeft(y3))
    .append("text")
    .attr("fill", "black")
    .text("cum. at least one vax dose")
    .style("font-size", "15px")
    .attr("transform", "translate(-70, 0) rotate(-90)")

  return {
    covidCasesData: covidCasesData,
    covidDeathsData: covidDeathsData,
    covidVaxData: covidVaxData,
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
let mapHeight = 400 - mapMargin.top - mapMargin.bottom;

const deathsSVG = d3
  .select("#deaths-map")
  .append("svg")
  .attr("width", mapWidth + mapMargin.left + mapMargin.right)
  .attr("height", mapHeight + mapMargin.top + mapMargin.bottom)
  .append("g")
  .attr("transform", `translate(${mapMargin.left}, ${mapMargin.top})`)

const deathsProjection = d3.geoAlbersUsa()
const deathsPath = d3.geoPath(deathsProjection)
const deathsColor = d3.scaleSequential(d3.interpolateReds)

const mapTooltip = d3.select("#map-tooltip")

const setupMapsPromise = getMapJSONPromise
  .then((us) => {
    const states = topojson.feature(us, us.objects.states).features;
    const nation = topojson.feature(us, us.objects.nation).features[0];
    deathsProjection.fitSize([mapWidth, mapHeight], nation)
    const emptyGeoData = states.map((feature) => ({
      feature: feature,
      name: feature.properties.name,
      value: 0
    }));

    deathsSVG
      .selectAll("path")
      .data(emptyGeoData)
      .enter()
      .append("path")
      .attr("d", (d) => deathsPath(d.feature))
      .style("fill", (d) => deathsColor(d.value))
      .style("stroke", "black")
      .on("mouseover", function(e, d) {
        let text = d.name
        if (stateDeathsData.get(d.name)) {
          text = d.name + ": " + d3.format(",.2r")(stateDeathsData.get(d.name)) + " total deaths"
        }
        mapTooltip
          .style("position", "absolute")
          .style("opacity", 0.8)
          .html(text)
          .style("left", (e.pageX) + "px")
          .style("top", (e.pageY - 28) + "px");
      })
      .on("mouseleave", function(e, d) {
        mapTooltip
          .style("opacity", 0)
      })
      .on("click", function(e, d) {
        changeSlide(3, d.name)
      })

    return states
  })

function changeSlide(slideNumber, state) {
  d3.selectAll(".scene-button").style("opacity", "0.25")
  d3.select(`.scene-button:nth-child(${slideNumber + 1})`).style("opacity", "1")
  Promise.all([setupTimeSeriesChartPromise, setupMapsPromise])
  .then((values) => {
    const data = values[0]
    const statesMap = values[1]
    currentMaxDate = slides[slideNumber].date
    let filteredRawData = data.rawData
    if (state) {
      filteredRawData = filteredRawData.filter((x) => x.state == state)
      d3.select("#timeseries-chart-title").text(`${state}: New Cases, New Deaths, and Cum. Vaccinations by Week`)
      d3.select("#remove-state-filter").style("display", "inline-block")
    } else {
      d3.select("#timeseries-chart-title").text("New Cases, New Deaths, and Cum. Vaccinations by Week")
      d3.select("#remove-state-filter").style("display", "none")
    }

    covidCasesData = d3.rollup(
      filteredRawData,
      function(v) { return d3.sum(v, function(d) { return d.covid_cases })},
      function(d) { return d.date }
    )

    covidDeathsData = d3.rollup(
      filteredRawData,
      function(v) { return d3.sum(v, function(d) { return d.covid_deaths })},
      function(d) { return d.date }
    )

    covidVaxData = d3.rollup(
      filteredRawData,
      function(v) { return d3.sum(v, function(d) { return d.cum_one_vax_dose })},
      function(d) { return d.date }
    )

    covidCasesData = Array.from(covidCasesData, function(item) {
      return {date: item[0], covid_cases: item[1]}
    })
    covidDeathsData = Array.from(covidDeathsData, function(item) {
      return {date: item[0], covid_deaths: item[1]}
    })
    covidVaxData = Array.from(covidVaxData, function(item) {
      return {date: item[0], cum_one_vax_dose: item[1]}
    })

    x.domain(d3.extent(covidDeathsData, function(d) { return d.date; }))
    y.domain([0, d3.max(covidCasesData, function(d) { return d.covid_cases; })])
    y2.domain([0, d3.max(covidDeathsData, function(d) { return d.covid_deaths; }) * 2])
    y3.domain([0, d3.max(covidVaxData, function(d) { return d.cum_one_vax_dose; })])
    d3.select("#cases-y-axis").call(d3.axisLeft(y))
    d3.select("#deaths-y-axis").call(d3.axisLeft(y2))
    d3.select("#vax-y-axis").call(d3.axisLeft(y3))
    const filteredCasesData = covidCasesData.filter((x) => x.date <= currentMaxDate)
    const filteredDeathData = covidDeathsData.filter((x) => x.date <= currentMaxDate)
    const filteredVaxData = covidVaxData.filter((x) => x.date <= currentMaxDate)
    filteredRawData = filteredRawData.filter((x) => x.date <= currentMaxDate)

    covidCasesPath
      .data([filteredCasesData])
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("d", casesValueline);

    covidDeathsPath
      .data([filteredDeathData])
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("d", deathsValueline);

    covidVaxPath
      .data([filteredVaxData])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("d", vaxValueline);

    d3.selectAll(".annotation-group").remove()
    if (!state) {
      slides[slideNumber].annotationContainer
      .append("g")
      .attr("class", "annotation-group")
      .call(
        d3.annotation()
          .accessors(slides[slideNumber].accessors)
          .annotations([
            slides[slideNumber].annotation
          ])
      )
    }

    if (slideNumber < (slides.length - 1)) {
      d3.select("#deaths-map").style("display", "none")
    } else {
      d3.select("#deaths-map").style("display", "block")
      stateDeathsData = d3.rollup(
        filteredRawData,
        function(v) { return d3.sum(v, function(d) { return d.covid_deaths })},
        function(d) { return d.state }
      )
      const maxStateCovidDeaths = Math.max(...stateDeathsData.values())
      const geoDeathsData = statesMap.map((feature) => {
        let value = 0
        if (!state || state == feature.properties.name) {
          value = stateDeathsData.get(feature.properties.name) / maxStateCovidDeaths
        }

        return {
          feature: feature,
          name: feature.properties.name,
          value: value
        }
      })
      deathsSVG
        .selectAll("path")
        .data(geoDeathsData)
        .style("fill", (d) => deathsColor(d.value))
    }
  })
}

changeSlide(0)
