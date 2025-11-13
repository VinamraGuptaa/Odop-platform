import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MapPin, Package, TrendingUp, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const IndiaMapD3 = ({ products = [], onStateClick }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [hoveredState, setHoveredState] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

    // Group products by state and get statistics
    const stateData = useMemo(() => {
        const grouped = {};
        products.forEach(product => {
            const state = product?.state;
            if (state) {
                if (!grouped[state]) {
                    grouped[state] = {
                        name: state,
                        products: [],
                        count: 0
                    };
                }
                grouped[state].products.push(product);
                grouped[state].count++;
            }
        });
        return grouped;
    }, [products]);

    // Simplified India GeoJSON - state boundaries
    const indiaGeoJSON = {
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature", "properties": {"ST_NM": "Jammu and Kashmir"}, "geometry": {"type": "Polygon", "coordinates": [[[74.5, 34.5], [75.8, 35.5], [77.8, 35.0], [78.5, 34.0], [77.0, 32.8], [75.5, 32.5], [74.0, 33.0], [73.5, 34.0], [74.5, 34.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Ladakh"}, "geometry": {"type": "Polygon", "coordinates": [[[77.5, 35.5], [79.5, 36.0], [79.0, 34.0], [78.0, 33.5], [77.5, 35.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Himachal Pradesh"}, "geometry": {"type": "Polygon", "coordinates": [[[75.5, 32.5], [77.0, 32.8], [78.5, 32.2], [78.0, 30.8], [76.8, 30.5], [76.0, 31.5], [75.5, 32.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Punjab"}, "geometry": {"type": "Polygon", "coordinates": [[[74.0, 32.0], [76.0, 31.5], [76.8, 30.5], [76.0, 29.5], [74.5, 30.0], [74.0, 32.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Chandigarh"}, "geometry": {"type": "Polygon", "coordinates": [[[76.7, 30.8], [76.9, 30.8], [76.9, 30.6], [76.7, 30.6], [76.7, 30.8]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Haryana"}, "geometry": {"type": "Polygon", "coordinates": [[[74.5, 30.0], [77.5, 29.5], [77.8, 28.5], [77.0, 27.8], [75.5, 28.0], [74.5, 29.0], [74.5, 30.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Delhi"}, "geometry": {"type": "Polygon", "coordinates": [[[76.8, 28.9], [77.3, 28.9], [77.3, 28.4], [76.8, 28.4], [76.8, 28.9]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Uttarakhand"}, "geometry": {"type": "Polygon", "coordinates": [[[77.5, 31.5], [80.0, 31.0], [80.8, 29.5], [79.5, 28.8], [78.0, 29.5], [77.5, 30.5], [77.5, 31.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Uttar Pradesh"}, "geometry": {"type": "Polygon", "coordinates": [[[77.0, 27.8], [77.8, 28.5], [78.0, 29.5], [80.8, 29.5], [83.5, 27.0], [84.0, 26.5], [84.0, 25.2], [82.5, 24.5], [81.0, 25.0], [78.5, 26.0], [77.5, 26.5], [77.0, 27.8]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Rajasthan"}, "geometry": {"type": "Polygon", "coordinates": [[[69.5, 27.0], [70.5, 29.5], [72.5, 30.5], [74.5, 30.0], [76.0, 29.5], [77.0, 27.8], [76.5, 26.5], [75.5, 25.0], [74.0, 24.0], [72.0, 24.0], [70.0, 25.0], [69.5, 27.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Gujarat"}, "geometry": {"type": "Polygon", "coordinates": [[[68.5, 23.5], [69.0, 24.5], [70.0, 25.0], [72.0, 24.0], [74.0, 24.0], [74.5, 22.5], [73.0, 21.0], [72.5, 20.0], [72.0, 21.0], [70.0, 21.5], [69.0, 22.5], [68.5, 23.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Daman & Diu (UT)"}, "geometry": {"type": "Polygon", "coordinates": [[[72.8, 20.4], [73.0, 20.4], [73.0, 20.3], [72.8, 20.3], [72.8, 20.4]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Dadra & Nagar Haveli (UT)"}, "geometry": {"type": "Polygon", "coordinates": [[[73.0, 20.3], [73.2, 20.3], [73.2, 20.1], [73.0, 20.1], [73.0, 20.3]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Madhya Pradesh"}, "geometry": {"type": "Polygon", "coordinates": [[[74.0, 24.0], [75.5, 25.0], [76.5, 26.5], [78.5, 26.0], [81.0, 25.0], [82.5, 24.5], [82.0, 23.0], [81.5, 21.5], [80.0, 21.0], [78.0, 21.5], [77.0, 22.0], [75.5, 22.5], [74.5, 22.5], [74.0, 24.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Chhattisgarh"}, "geometry": {"type": "Polygon", "coordinates": [[[80.0, 21.0], [81.5, 21.5], [82.5, 24.5], [84.0, 24.0], [84.0, 22.0], [83.0, 20.5], [82.0, 19.0], [81.0, 19.5], [80.0, 21.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Maharashtra"}, "geometry": {"type": "Polygon", "coordinates": [[[72.5, 20.0], [73.0, 21.0], [74.5, 22.5], [75.5, 22.5], [77.0, 22.0], [78.0, 21.5], [80.0, 21.0], [80.5, 19.5], [79.5, 18.0], [77.5, 16.5], [76.0, 16.0], [74.0, 16.5], [73.0, 18.0], [72.5, 20.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Goa"}, "geometry": {"type": "Polygon", "coordinates": [[[73.7, 15.8], [74.3, 15.8], [74.3, 14.9], [73.7, 14.9], [73.7, 15.8]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Bihar"}, "geometry": {"type": "Polygon", "coordinates": [[[83.5, 27.0], [84.0, 26.5], [87.5, 26.8], [88.0, 26.0], [87.5, 25.0], [86.5, 24.5], [85.0, 25.0], [84.0, 25.2], [83.5, 27.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Jharkhand"}, "geometry": {"type": "Polygon", "coordinates": [[[84.0, 22.0], [84.0, 24.0], [84.0, 25.2], [85.0, 25.0], [86.5, 24.5], [87.0, 23.5], [86.5, 22.0], [85.5, 21.5], [84.0, 22.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "West Bengal"}, "geometry": {"type": "Polygon", "coordinates": [[[85.8, 27.3], [88.0, 27.5], [89.0, 26.8], [89.8, 26.0], [88.5, 24.5], [88.0, 23.0], [87.5, 22.0], [86.5, 22.0], [87.0, 23.5], [86.5, 24.5], [87.5, 25.0], [88.0, 26.0], [87.5, 26.8], [85.8, 27.3]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Odisha"}, "geometry": {"type": "Polygon", "coordinates": [[[81.0, 19.5], [82.0, 19.0], [83.0, 20.5], [84.0, 22.0], [85.5, 21.5], [87.0, 21.0], [87.0, 19.5], [86.0, 18.5], [84.5, 18.0], [83.0, 18.5], [82.0, 19.0], [81.0, 19.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Sikkim"}, "geometry": {"type": "Polygon", "coordinates": [[[88.0, 28.3], [88.9, 28.3], [88.9, 27.0], [88.0, 27.0], [88.0, 28.3]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Assam"}, "geometry": {"type": "Polygon", "coordinates": [[[89.8, 26.0], [90.5, 26.8], [92.0, 26.8], [94.0, 27.5], [96.0, 27.0], [95.5, 25.5], [94.5, 24.5], [93.0, 24.0], [91.5, 24.5], [90.5, 25.5], [89.8, 26.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Arunachal Pradesh"}, "geometry": {"type": "Polygon", "coordinates": [[[92.0, 28.5], [93.5, 29.0], [95.0, 29.0], [97.0, 28.5], [97.0, 27.0], [96.0, 27.0], [94.0, 27.5], [92.0, 26.8], [92.0, 28.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Nagaland"}, "geometry": {"type": "Polygon", "coordinates": [[[93.5, 27.0], [94.8, 27.0], [95.2, 26.0], [94.8, 25.5], [94.0, 25.5], [93.5, 26.0], [93.5, 27.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Manipur"}, "geometry": {"type": "Polygon", "coordinates": [[[93.5, 25.5], [94.8, 25.5], [94.8, 23.8], [93.5, 23.8], [93.5, 25.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Mizoram"}, "geometry": {"type": "Polygon", "coordinates": [[[92.2, 24.5], [93.5, 24.5], [93.5, 21.9], [92.8, 21.9], [92.2, 22.5], [92.2, 24.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Tripura"}, "geometry": {"type": "Polygon", "coordinates": [[[91.0, 24.5], [92.5, 24.5], [92.5, 22.9], [91.0, 22.9], [91.0, 24.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Meghalaya"}, "geometry": {"type": "Polygon", "coordinates": [[[89.8, 26.0], [90.5, 26.0], [92.5, 26.0], [92.5, 25.0], [91.0, 25.0], [89.8, 25.5], [89.8, 26.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Telangana"}, "geometry": {"type": "Polygon", "coordinates": [[[77.2, 19.5], [79.5, 19.5], [80.5, 19.5], [80.5, 17.0], [79.0, 16.0], [78.0, 16.5], [77.2, 17.5], [77.2, 19.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Andhra Pradesh"}, "geometry": {"type": "Polygon", "coordinates": [[[77.5, 16.5], [79.0, 16.0], [80.5, 17.0], [80.5, 19.5], [84.5, 19.0], [84.5, 18.0], [83.0, 16.0], [81.5, 15.0], [80.0, 13.5], [79.0, 14.0], [78.0, 15.5], [77.5, 16.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Karnataka"}, "geometry": {"type": "Polygon", "coordinates": [[[74.0, 16.5], [76.0, 16.0], [77.5, 16.5], [78.0, 15.5], [77.5, 13.5], [76.5, 12.0], [75.0, 11.5], [74.0, 12.5], [73.5, 14.5], [74.0, 16.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Kerala"}, "geometry": {"type": "Polygon", "coordinates": [[[75.0, 12.8], [76.5, 12.0], [77.5, 11.0], [77.0, 9.5], [76.5, 8.2], [75.5, 8.5], [75.0, 10.0], [75.0, 12.8]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Tamil Nadu"}, "geometry": {"type": "Polygon", "coordinates": [[[76.5, 12.0], [77.5, 13.5], [79.0, 14.0], [80.0, 13.5], [80.3, 10.5], [79.8, 9.0], [78.5, 8.5], [77.5, 8.0], [77.0, 9.5], [77.5, 11.0], [76.5, 12.0]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Puducherry"}, "geometry": {"type": "Polygon", "coordinates": [[[79.8, 11.95], [79.9, 11.95], [79.9, 11.85], [79.8, 11.85], [79.8, 11.95]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Andaman and Nicobar Islands"}, "geometry": {"type": "Polygon", "coordinates": [[[92.5, 13.5], [93.0, 13.5], [93.0, 6.7], [92.5, 6.7], [92.5, 13.5]]]}},
            {"type": "Feature", "properties": {"ST_NM": "Lakshadweep"}, "geometry": {"type": "Polygon", "coordinates": [[[72.6, 11.0], [73.0, 11.0], [73.0, 10.5], [72.6, 10.5], [72.6, 11.0]]]}}
        ]
    };

    // Get color based on product count
    const getColor = (count) => {
        if (!count || count === 0) return '#E5E7EB'; // Gray for no data
        if (count > 100) return '#EA580C'; // Orange 600
        if (count > 50) return '#F97316'; // Orange 500
        if (count > 25) return '#FB923C'; // Orange 400
        if (count > 10) return '#FDBA74'; // Orange 300
        if (count > 5) return '#FED7AA'; // Orange 200
        return '#FFEDD5'; // Orange 100
    };

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || products.length === 0) return;

        // Clear existing SVG content
        d3.select(svgRef.current).selectAll('*').remove();

        const width = dimensions.width;
        const height = dimensions.height;

        console.log('Rendering D3 map with', products.length, 'products');

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Create projection - use geoMercator with better settings for India
        const projection = d3.geoMercator()
            .center([78.9629, 20.5937]) // Center of India (more accurate)
            .scale(width * 1.2) // Scale based on width
            .translate([width / 2, height / 2]);

        // Create path generator
        const pathGenerator = d3.geoPath().projection(projection);

        // Create group for map
        const g = svg.append('g');

        // Draw states
        g.selectAll('path')
            .data(indiaGeoJSON.features)
            .enter()
            .append('path')
            .attr('d', pathGenerator)
            .attr('class', 'state-path')
            .attr('fill', d => {
                const stateName = d.properties.ST_NM;
                const count = stateData[stateName]?.count || 0;
                return getColor(count);
            })
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5)
            .style('cursor', d => stateData[d.properties.ST_NM] ? 'pointer' : 'default')
            .style('opacity', d => stateData[d.properties.ST_NM] ? 1 : 0.5)
            .on('mouseenter', function(event, d) {
                const stateName = d.properties.ST_NM;
                if (stateData[stateName]) {
                    d3.select(this)
                        .attr('stroke', '#EA580C')
                        .attr('stroke-width', 3)
                        .style('filter', 'drop-shadow(0 4px 8px rgba(234, 88, 12, 0.4))');

                    setHoveredState(stateName);
                    setTooltipPosition({ x: event.pageX, y: event.pageY });
                }
            })
            .on('mousemove', function(event, d) {
                const stateName = d.properties.ST_NM;
                if (stateData[stateName]) {
                    setTooltipPosition({ x: event.pageX, y: event.pageY });
                }
            })
            .on('mouseleave', function(event, d) {
                d3.select(this)
                    .attr('stroke', '#ffffff')
                    .attr('stroke-width', 1.5)
                    .style('filter', 'none');

                setHoveredState(null);
            })
            .on('click', (event, d) => {
                const stateName = d.properties.ST_NM;
                if (stateData[stateName]) {
                    onStateClick?.(stateName);
                }
            });

        // Add state labels (product counts)
        g.selectAll('text')
            .data(indiaGeoJSON.features.filter(d => stateData[d.properties.ST_NM]))
            .enter()
            .append('text')
            .attr('x', d => {
                const centroid = pathGenerator.centroid(d);
                return centroid[0];
            })
            .attr('y', d => {
                const centroid = pathGenerator.centroid(d);
                return centroid[1];
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'state-label')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#1F2937')
            .attr('pointer-events', 'none')
            .text(d => stateData[d.properties.ST_NM]?.count || '');

    }, [dimensions, stateData, indiaGeoJSON]);

    const TooltipContent = ({ state }) => {
        const stateInfo = stateData[state];
        if (!stateInfo) return null;

        const topProducts = stateInfo.products.slice(0, 3);

        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-orange-300 dark:border-orange-600 p-4 min-w-[320px] max-w-[400px] pointer-events-none">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            {state}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Package className="w-4 h-4" />
                            {stateInfo.count} products available
                        </p>
                    </div>
                </div>

                <div className="space-y-2 mb-3">
                    {topProducts.map((product, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-800"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {product?.product?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                    {product?.product}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {product?.category}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Click to view all products
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                    Explore India's Treasures
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Click on states to discover authentic regional products
                </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFEDD5' }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">1-5</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FED7AA' }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">6-10</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FDBA74' }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">11-25</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FB923C' }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">26-50</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F97316' }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">51-100</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EA580C' }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">100+</span>
                </div>
            </div>

            {/* Map */}
            <div className="relative flex justify-center items-center bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-inner">
                <svg ref={svgRef} className="w-full h-auto" style={{ maxHeight: '600px' }} />
            </div>

            {/* Tooltip */}
            {hoveredState && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: `${tooltipPosition.x + 20}px`,
                        top: `${tooltipPosition.y - 20}px`,
                    }}
                >
                    <TooltipContent state={hoveredState} />
                </div>
            )}

            {/* Stats Footer */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-gray-200 dark:border-slate-700">
                    <div className="text-3xl font-black text-orange-500">
                        {Object.keys(stateData).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">States Covered</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-gray-200 dark:border-slate-700">
                    <div className="text-3xl font-black text-pink-500">
                        {products.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Total Products</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-gray-200 dark:border-slate-700">
                    <div className="text-3xl font-black text-purple-500">
                        {[...new Set(products.map(p => p?.category).filter(Boolean))].length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Categories</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-gray-200 dark:border-slate-700">
                    <div className="text-3xl font-black text-blue-500">
                        {[...new Set(products.map(p => p?.district).filter(Boolean))].length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Districts</div>
                </div>
            </div>
        </div>
    );
};

export default IndiaMapD3;
