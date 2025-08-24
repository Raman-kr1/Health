import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';

function HealthChart({ data, trends }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = containerRef.current;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates and filter valid data
    const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");
    const validData = data
      .filter(d => d.heart_rate)
      .map(d => ({
        ...d,
        date: parseTime(d.timestamp.split('.')[0])
      }))
      .sort((a, b) => a.date - b.date);

    if (validData.length === 0) return;

    // Set up scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(validData, d => d.date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(validData, d => d.heart_rate) - 10,
        d3.max(validData, d => d.heart_rate) + 10
      ])
      .range([height, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.heart_rate))
      .curve(d3.curveMonotoneX);

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d")))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Date");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Heart Rate (bpm)");

    // Add the line
    g.append("path")
      .datum(validData)
      .attr("fill", "none")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots for data points
    g.selectAll(".dot")
      .data(validData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.heart_rate))
      .attr("r", 4)
      .attr("fill", "#ff6b6b")
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
        //   .style("opacity", 0);
        
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          
          tooltip.html(`
            <strong>Date:</strong> ${format(d.date, 'MMM dd, yyyy')}<br/>
            <strong>Heart Rate:</strong> ${d.heart_rate} bpm<br/>
            ${d.blood_pressure_systolic ? `<strong>BP:</strong> ${d.blood_pressure_systolic}/${d.blood_pressure_diastolic}<br/>` : ''}
            ${d.temperature ? `<strong>Temp:</strong> ${d.temperature}°F<br/>` : ''}
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.selectAll(".tooltip").remove();
        });
  
      // Add trend line if available
      if (trends && trends.heart_rate) {
        const trendInfo = trends.heart_rate;
        g.append("text")
          .attr("x", width - 100)
          .attr("y", 20)
          .attr("text-anchor", "end")
          .style("font-size", "12px")
          .style("fill", trendInfo.current_trend === 'increasing' ? "#ff6b6b" : "#51cf66")
          .text(`Trend: ${trendInfo.current_trend}`);
      }
  
    }, [data, trends]);
  
    return (
      <div className="health-chart" ref={containerRef}>
        <h3>Heart Rate Trends</h3>
        <svg ref={svgRef}></svg>
        {trends && (
          <div className="trend-summary">
            <h4>Predictions</h4>
            {Object.entries(trends).map(([metric, info]) => (
              <div key={metric} className="trend-item">
                <span>{metric.replace('_', ' ').toUpperCase()}:</span>
                <span className={`trend-${info.current_trend}`}>
                  {info.current_trend}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  export default HealthChart;
            