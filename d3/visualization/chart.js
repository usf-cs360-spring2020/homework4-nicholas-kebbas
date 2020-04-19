/* Referenced the following scatterplot resources:

https://observablehq.com/@d3/scatterplot-matrix
https://bl.ocks.org/Fil/6d9de24b31cb870fed2e6178a120b17d

*/
var width = 960,
    size = 230,
    padding = 40,
    marginLeft = 20;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(3);

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(3);

var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv("filtered_data.csv").then(function(data) {

// remove what we don't want to chart
  var domainByTrait = {},
      measurements = d3.keys(data[0]).filter(function(d) { return d !== "name" && d !== "tier" && d !== "state"; }),
      n = measurements.length;

  measurements.forEach(function(measurement) {
    domainByTrait[measurement] = d3.extent(data, function(d) {
      return +d[measurement];
    });
  });

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);


  var svg = d3.select("body").append("svg").attr("id", "vis-container")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");
      // placing the y axis
  svg.selectAll(".x.axis")
      .data(measurements)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); })

      // placing the y axis
  svg.selectAll(".y.axis")
      .data(measurements)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(measurements, measurements))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".1em")
      .text(function(d) {
        if (d.x == "par_median") {
          return "Median Income"
        }
        if (d.x == "par_q1") {
          return "Q1 Income"
        }
        if (d.x == "par_q2") {
          return "Q2 Income"
        }
        if (d.x == "par_top1pc") {
          return "Top 1% Income"
        }
        console.log(d.x);
        return d.x;
      });


  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

        var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// placing points and adding coloring here
    cell.selectAll("dot")
        .data(data)
      .enter().append("circle")
      .attr("class", "dot")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .on("mouseover", function(d) {
              div.transition()
                  .duration(100)
                  .style("opacity", .9);
              div	.html(d.name)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
              .transition()
                .duration(200) // ms
                .style("opacity", .9) // started as 0!
        })
        .on("mouseout", function(d) {
          div.transition()
              .duration(100) // ms
              .style("opacity", 0); // don't care about position!
        })
        .style("fill", function(d) { return color(d); })


        var tooltip = d3.select("#vis-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  }});

function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}
