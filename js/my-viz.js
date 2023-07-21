// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
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

const timeseriesPath = timeseriesSVG.append("path")

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
  .attr('r', 3)
  .attr("stroke", "steelblue")

const dateText = mouseG
  .append('text')
  .attr('dy', '0em')
const covidCasesText = mouseG
  .append('text')
  .attr('dy', '1em')

timeseriesContainer
  .on("mouseover", function(mouse) {
    mouseG.style('display', 'block')
  })


// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height / 2, 0]);

var minDate = null
var maxDate = null

var lineChartData = null

timeseriesContainer
  .on("mousemove", function(mouse) {
    if (lineChartData == null) {
      return
    }

    const [x_cord, y_cord] = d3.pointer(mouse);
    const ratio = x_cord / width;
    const bisect = d3.bisector(d => d.date)
    const current_date = lineChartData[bisect.left(lineChartData, x.invert(x_cord))].date
    // const current_date = minDate + Math.round(ratio * (maxDate - minDate));
    console.log(current_date)
    const cnt = lineChartData.find(d => d.date === current_date).covid_cases;
    mouseG.attr('transform', `translate(${x(current_date)},${0})`);
    dateText
      .text(`week ending: ${current_date.toLocaleDateString('en-US')}`)
      .attr('text-anchor', x_cord < width / 2 ? "start" : "end")
    covidCasesText
      .text(`new covid cases: ${cnt}`)
      .attr('text-anchor', x_cord < width / 2 ? "start" : "end")
    mouseG.select('circle').attr('cy', y(cnt));
  })
  .on("mouseout", function(mouse) {
    mouseG.style('display', 'none');
  })

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.covid_cases); });

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

function changeSlide(maxDate) {
  var maxDateObj = new Date(maxDate)
  var filteredData = lineChartData.filter(function(x) {return x.date <= maxDateObj})
  var filteredAnnotations = annotations.filter(function(x) {return new Date(x.data.date) <= maxDateObj})

  timeseriesPath
    .data([filteredData])
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("d", valueline);

  const makeAnnotations = d3.annotation()
    .notePadding(15)
    .type(d3.annotationCalloutCircle)
    .accessors({
      x: d => x(parseTime(d.date)),
      y: d => y(d.covid_cases)
    })
    .annotations(filteredAnnotations)

  timeseriesAnnotations.call(makeAnnotations)
}

const getDataPromise = d3.csv("data/covid_weekly_data.csv")

// Get the data
getDataPromise.then(function(data) {
  lineChartData = data

  // format the data
  lineChartData.forEach(function(d) {
      d.date = parseTime(d.date)
      d.covid_cases = +d.covid_cases
  })

  lineChartData = d3.rollup(
    lineChartData,
    function(v) { return d3.sum(v, function(d) { return d.covid_cases })},
    function(d) { return d.date }
  )

  lineChartData = Array.from(lineChartData, function(item) {
    return {date: item[0], covid_cases: item[1]}
  })
  const extent = d3.extent(lineChartData, d=>d.date);
  minDate = extent[0]
  maxDate = extent[1]

  // Scale the range of the data
  x.domain(d3.extent(lineChartData, function(d) { return d.date; }));
  y.domain([0, d3.max(lineChartData, function(d) { return d.covid_cases; })]);

  // Add the X Axis
  timeseriesSVG
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  timeseriesSVG
    .append("g")
    .call(d3.axisLeft(y));

  changeSlide("2020-12-31")
});


var margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  };
  var width = 800 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;

  // Creates sources <svg> element and inner g (for margins)
  var svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  /////////////////////////
  var projection = d3.geoAlbersUsa();
  var path = d3.geoPath(projection);
  var color = d3.scaleSequential(d3.interpolateBlues);

  const mapTooltip = d3.select("#map-tooltip")

  Promise.all([getDataPromise, d3.json("d3/states-10m.json")])
    .then((values) => {
      const data = values[0]
      const us = values[1]
      const states = topojson.feature(us, us.objects.states).features;
      const nation = topojson.feature(us, us.objects.nation).features[0];

      // scale to fit bounds
      projection.fitSize([width, height], nation);

      const stateData = d3.rollup(
        data,
        function(v) { return d3.sum(v, function(d) { return d.covid_cases })},
        function(d) { return d.state }
      )
      const maxCovidCases = Math.max(...stateData.values())
      const geoData = states.map((feature) => ({
        feature: feature,
        name: feature.properties.name,
        value: stateData.get(feature.properties.name) / maxCovidCases
      }));

      const paths = svg
        .selectAll("path")
        .data(geoData)
        .enter()
        .append("path")
        // .join((enter) => {
        //   const p = enter.append("path");
        //   p.on("mouseover", function () {
        //     console.log(this.feature)
        //     mapTooltip
        //       .style("opacity", 0.8)
        //       .html(d.id + ": " + d3.format(",.2r")(d.value))
        //       .style("left", (d3.event.pageX) + "px")
        //       .style("top", (d3.event.pageY - 28) + "px");
        //   })
        //   return p
        // })
        .attr("d", (d) => path(d.feature))
        .style("fill", (d) => color(d.value))
        .on("mouseover", function(e, d) {
          console.log(d)
          mapTooltip
            .style("position", "absolute")
            .style("opacity", 0.8)
            .html(d.name + ": " + d3.format(",.2r")(stateData.get(d.name)))
            .style("left", (e.pageX) + "px")
            .style("top", (e.pageY - 28) + "px");
        })
        .on("mouseleave", function(e, d) {
          mapTooltip
            .style("opacity", 0)
        })
      // paths.select("title").text((d) => d.name);
    })
