import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Empire, HistoricalEvent, HistoricalData } from '../types';

interface WorldMapProps {
  data: HistoricalData | null;
  onSelectEmpire: (empire: Empire | null) => void;
  onSelectEvent: (event: HistoricalEvent | null) => void;
  isLoading: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, onSelectEmpire, onSelectEvent, isLoading }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldTopology, setWorldTopology] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load world topology once on mount
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setWorldTopology(countries);
      })
      .catch(err => console.error("Failed to load map topology", err));
  }, []);

  // D3 Rendering Logic
  useEffect(() => {
    if (!svgRef.current || !worldTopology || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Projection setup
    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.5]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Main group for map content
    const g = svg.append("g");

    // 1. Draw Oceans/Background
    g.append("rect")
      .attr("width", width * 10)
      .attr("height", height * 10)
      .attr("x", -width * 4)
      .attr("y", -height * 4)
      .attr("fill", "#1e293b"); // Slate-800 ocean

    // 2. Draw Land Masses
    g.selectAll("path.country")
      .data(worldTopology.features)
      .enter().append("path")
      .attr("d", pathGenerator as any)
      .attr("class", "country")
      .attr("fill", "#334155") // Slate-700 land
      .attr("stroke", "#475569")
      .attr("stroke-width", 0.5);

    if (data && !isLoading) {
      // 3. Draw Empires (Circles of Influence)
      // Note: d3.geoCircle generates a polygon approximating a circle on the sphere
      data.empires.forEach((empire) => {
        // Convert radiusKm to degrees roughly (1 deg approx 111km)
        const radiusDeg = empire.radiusKm / 111;

        const circleGenerator = d3.geoCircle()
          .center([empire.longitude, empire.latitude])
          .radius(radiusDeg);
        
        const circleData = circleGenerator();

        g.append("path")
          .datum(circleData)
          .attr("d", pathGenerator as any)
          .attr("fill", empire.color)
          .attr("fill-opacity", 0.3)
          .attr("stroke", empire.color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,2") // Dashed border for "influence"
          .style("cursor", "pointer")
          .on("click", (e) => {
             e.stopPropagation();
             onSelectEmpire(empire);
             onSelectEvent(null);
          })
          .on("mouseover", function() {
            d3.select(this).attr("fill-opacity", 0.5).attr("stroke-width", 2);
          })
          .on("mouseout", function() {
            d3.select(this).attr("fill-opacity", 0.3).attr("stroke-width", 1);
          });
        
        // Empire Label
        const projectedCenter = projection([empire.longitude, empire.latitude]);
        if (projectedCenter) {
          g.append("text")
            .attr("x", projectedCenter[0])
            .attr("y", projectedCenter[1])
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("font-size", "10px") // Slightly larger for Chinese characters
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .style("pointer-events", "none")
            .style("text-shadow", "0px 0px 3px black")
            .text(empire.name);
        }
      });

      // 4. Draw Events (Pins)
      data.events.forEach((event) => {
        const coords = projection([event.longitude, event.latitude]);
        if (coords) {
          const [x, y] = coords;
          
          // Pin Group
          const pinGroup = g.append("g")
            .attr("transform", `translate(${x}, ${y})`)
            .style("cursor", "pointer")
            .on("click", (e) => {
              e.stopPropagation();
              onSelectEvent(event);
              onSelectEmpire(null);
            });

          // Pin Circle
          pinGroup.append("circle")
            .attr("r", 4)
            .attr("fill", "#fbbf24") // Amber
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .classed("animate-pulse", true); // Custom handling for pulse if needed, but D3 controls DOM

          // Interaction area (larger invisible circle)
          pinGroup.append("circle")
            .attr("r", 10)
            .attr("fill", "transparent");
        }
      });
    }

    // Background click to deselect
    svg.on("click", () => {
      onSelectEmpire(null);
      onSelectEvent(null);
    });

  }, [worldTopology, data, isLoading, onSelectEmpire, onSelectEvent]);

  return (
    <div ref={wrapperRef} className="w-full h-full relative bg-slate-950 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full block" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm pointer-events-none z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-200 font-mono text-sm">AI 正在查阅历史档案...</span>
          </div>
        </div>
      )}
      {!worldTopology && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          正在加载地图测绘数据...
        </div>
      )}
    </div>
  );
};

export default WorldMap;