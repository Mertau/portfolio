"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface MetricPoint {
  timestamp: string;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
}

interface MetricsChartProps {
  data: MetricPoint[];
}

const COLORS = {
  cpu: "#3b82f6",
  memory: "#8b5cf6",
  disk: "#10b981",
};

export function MetricsChart({ data }: MetricsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length < 2) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.timestamp))
      .range([0, w]);

    const yScale = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((_, i) => i % 10 === 0)))
      .selectAll("text")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px");

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat((v) => `${v}%`))
      .selectAll("text")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px");

    g.append("g")
      .selectAll("line")
      .data(yScale.ticks(5))
      .join("line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#1f2937")
      .attr("stroke-dasharray", "4 4");

    const line = (key: keyof MetricPoint) =>
      d3
        .line<MetricPoint>()
        .x((d) => xScale(d.timestamp) ?? 0)
        .y((d) => yScale(d[key] as number))
        .curve(d3.curveMonotoneX);

    (["cpu_percent", "memory_percent", "disk_percent"] as const).forEach((key, idx) => {
      const colorKey = (["cpu", "memory", "disk"] as const)[idx];
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", COLORS[colorKey])
        .attr("stroke-width", 2)
        .attr("d", line(key));
    });

    const legendData = [
      { label: "CPU", color: COLORS.cpu },
      { label: "Memory", color: COLORS.memory },
      { label: "Disk", color: COLORS.disk },
    ];

    const legend = g.append("g").attr("transform", `translate(${w - 80}, 0)`);
    legendData.forEach((item, i) => {
      legend.append("rect").attr("x", 0).attr("y", i * 20).attr("width", 12).attr("height", 4).attr("fill", item.color).attr("rx", 2);
      legend.append("text").attr("x", 16).attr("y", i * 20 + 4).attr("fill", "#6b7280").attr("font-size", "11px").text(item.label);
    });
  }, [data]);

  const latest = data[data.length - 1];

  return (
    <div className="space-y-4">
      {latest && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "CPU", value: latest.cpu_percent, color: "text-blue-500" },
            { label: "Memory", value: latest.memory_percent, color: "text-purple-500" },
            { label: "Disk", value: latest.disk_percent, color: "text-green-500" },
          ].map((m) => (
            <div key={m.label} className="bento-card text-center">
              <p className={`text-3xl font-bold ${m.color}`}>{m.value.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bento-card">
        <h3 className="font-semibold text-foreground mb-4">System Metrics (Last 60s)</h3>
        {data.length < 2 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Waiting for data stream...
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-64" />
        )}
      </div>
    </div>
  );
}
