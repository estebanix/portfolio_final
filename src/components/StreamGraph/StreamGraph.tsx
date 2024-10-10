import { useMemo, useState } from "react";
import * as d3 from "d3";
import { curveCatmullRom } from "d3";
import styles from "./StreamGraph.module.scss";

const MARGIN = { top: 30, right: 50, bottom: 30, left: 50 };

type StreamGraphProps = {
  width: number;
  height: number;
  data: { [key: string]: number }[];
  title?: string;
};

export const StreamGraph = ({ width, height, data, title = "Hover over!" }: StreamGraphProps) => {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const groups = ["school", "work", "bodybuilding", "programming", "freetime"];

  const groupDisplayNames: { [key: string]: string } = {
    school: "School - just focus and it soon will be over",
    work: "Work - great reasearch and liters of coffee",
    bodybuilding: "Bodybuilding, but I also train for triatlon",
    programming: "Programming, just go with the flow",
    freetime: "Free Time, ouu I don't have much of that...",
  };

  const stackSeries = d3
    .stack()
    .keys(groups)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetSilhouette);
  const series = stackSeries(data);

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([-100, 100]).range([boundsHeight, 0]);
  }, [boundsHeight]);

  const [xMin, xMax] = d3.extent(data, (d) => d.year);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin || 0, xMax || 0])
      .range([0, boundsWidth]);
  }, [boundsWidth, xMax, xMin]);

  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(groups)
    .range(["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"]);

  const areaBuilder = d3
    .area<any>()
    .x((d) => xScale(d.data.year))
    .y1((d) => yScale(d[1]))
    .y0((d) => yScale(d[0]))
    .curve(curveCatmullRom);

  const allPath = series.map((serie, i) => {
    const path = areaBuilder(serie) || "";
    return (
      <path
        key={i}
        className={styles.shape}
        d={path}
        opacity={1}
        stroke="grey"
        fill={colorScale(serie.key)}
        fillOpacity={0.8}
        onMouseEnter={() => setHoveredGroup(serie.key)}
        onMouseLeave={() => setHoveredGroup(null)}
      />
    );
  });

  const grid = xScale.ticks(5).map((value, i) => (
    <g key={i}>
      <line
        x1={xScale(value)}
        x2={xScale(value)}
        y1={0}
        y2={boundsHeight}
        stroke="#808080"
        opacity={0.2}
      />
      <text
        x={xScale(value)}
        y={boundsHeight + 10}
        textAnchor="middle"
        alignmentBaseline="central"
        fontSize={9}
        stroke="#808080"
        opacity={0.8}
      >
        {value}
      </text>
    </g>
  ));

  return (
    <div className={styles.streamGraph}>
      <div className={styles.hoverText}>
        {hoveredGroup ? groupDisplayNames[hoveredGroup] : title}
      </div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {grid}
          <g className={styles.container}>{allPath}</g>
        </g>
      </svg>
    </div>
  );
};
