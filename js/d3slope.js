
d3.custom = {};



d3.custom.slopegraph = function() {

    var chartOpts = {
        width: 700,
        height: 500,
        margin: {top: 50, right: 50, bottom: 50, left: 50},
        labelLength: 90
    };

    var chartHeight = chartOpts.height - chartOpts.margin.top - chartOpts.margin.bottom;
    var chartWidth = chartOpts.width - chartOpts.margin.right - chartOpts.margin.left;
    

    //select body
    var parent = d3.select("#chartCanvas");

    //create svg cancas, assign a class, height, and width
    var svg = parent.selectAll("svg").data([0]);
    svg.enter().append("svg").attr("class", "chart-root")
            .append('g').attr('class', 'chart-group');
    svg.attr({width: chartOpts.width, height: chartOpts.height});
    //svg.exit().remove();

    //create inner svg for the chart 
    var chartSvg = svg.select('.chart-group').attr("transform", "translate(" + 0 + ",0)");

    var yScale = d3.scale.linear().domain([-100,100]).range([chartHeight, 0]);
    var yAxis = d3.svg.axis().scale(yScale).orient("right").ticks(4).innerTickSize(-2).outerTickSize(-3).tickFormat(function(d) { return d + "%"; });

    svg.append("g").attr("class", "yAxis"). attr("transform", "translate(" + (chartOpts.width - chartOpts.margin.right) + "," + (chartOpts.margin.top)  + ")").call(yAxis);




    svg.append("text")
        .attr("class", "topLabel")
        .attr("id", "percentChange")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", 10)        
        .text("Percent Change from _____ to _____");

    function exports(selection) {
        selection.each(function (dataset) {

            //take two arrays (before and after) and link them as a series of before/after pair arrays
            var data = d3.transpose(dataset.data);
            
            var zipCodes = [$("#zip1").val(),$("#zip2").val()];
            console.log(zipCodes);
            var oldTitle = document.getElementById('percentChange').textContent;
            var newTitle = "Percent Change from " + zipCodes[0] + " to " + zipCodes[1];
            document.getElementById('percentChange').textContent = newTitle;

            // var xScale = d3.scale.ordinal().domain(zipCodes).range([0,chartWidth]);
            // var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // svg.append("g")
    //     .attr("class", "xAxis")
    //     .attr("transform", "translate(" + chartOpts.margin.left + "," + (chartOpts.height - (chartOpts.margin.bottom) + 10)+ ")")
    //     .call(xAxis);
            //define the scale 
            var scale = d3.scale.linear().domain([-100,100]).range([chartHeight, 0]).clamp(true);

            //create slope lines
            var lines = chartSvg.selectAll('line.slope-line')
                .data(data);
            lines.enter().append("line");



            //define location for each line. y1/y2 defines before/after slope
            lines.attr({
                    id: function(d) { return d[2]; },
                    class: function(d) { return (d[3] + ' slope-line'); },
                    x1: chartOpts.margin.left,
                    y1: function(d) { return chartOpts.margin.top + scale(0); },
                    x2: chartOpts.margin.left,
                    y2: function(d) { return chartOpts.margin.top + scale(0); }});
            lines.exit().remove();


            lines
              .transition()
              .delay(function(d, i) {
                    return i * 100;   // <-- Where the magic happens
                })
                .duration(500)
                .ease("quad")
                .attr({
                    x2: chartOpts.width - (chartOpts.margin.right) ,
                    y2: function(d) { return chartOpts.margin.top + scale(d[1]); }});

            //add labels
            var rightLabels = chartSvg.selectAll('text.right-labels')
                .data(data);
            rightLabels.enter().append('text');
            rightLabels.attr({
                    id: function(d) { return d[2]; },
                    class: 'right-labels slope-label',
                    x: function(d,i) { return ( ((chartOpts.margin.left) + (chartOpts.width - (chartOpts.margin.right * 2) )) / 2 ); },
                    y: function(d,i) { return ( ((chartOpts.margin.top + scale(0)) + (chartOpts.margin.top + scale(d[1])) ) / 2 ) - 10; },
                    dy: '.35em'})
                .text(function(d,i) { return Math.round(dataset.data[1][i]) + "%"; })
                ;
                ;
            rightLabels.exit().remove();
        });
    }

    //assign chartOpts to exports
    exports.chartOpts = chartOpts;
    createAccessors(exports);

    return exports;
};

createAccessors = function(visExport) {
    for (var n in visExport.chartOpts) {
        if (!visExport.chartOpts.hasOwnProperty(n)) continue;
        visExport[n] = (function(n) {
            return function(v) {
                return arguments.length ? (visExport.chartOpts[n] = v, this) : visExport.chartOpts[n];
            };
        })(n);
    }
};