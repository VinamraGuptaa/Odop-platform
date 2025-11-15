import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { AnimatedMapPin, AnimatedPackage, AnimatedClose, AnimatedSparkles } from './ui/AnimatedIcons';

const IndiaMapD3Fixed = ({ products = [], onStateClick, onProductClick }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // Hover tooltip state (lightweight preview)
    const [hoveredState, setHoveredState] = useState(null);
    const [hoveredDistrict, setHoveredDistrict] = useState(null);
    const [hoverTooltipPosition, setHoverTooltipPosition] = useState({ x: 0, y: 0 });

    // Click tooltip state (locked, stays visible)
    const [clickedDistrict, setClickedDistrict] = useState(null);
    const [clickedState, setClickedState] = useState(null);
    const [clickTooltipPosition, setClickTooltipPosition] = useState({ x: 0, y: 0 });

    const [mapData, setMapData] = useState(null);
    const [showDistricts, setShowDistricts] = useState(false);
    const [districtData, setDistrictData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const hoverTimeoutRef = useRef(null);

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

    // Group products by district and get statistics
    const districtData_products = useMemo(() => {
        const grouped = {};
        products.forEach(product => {
            const district = product?.district;
            if (district) {
                if (!grouped[district]) {
                    grouped[district] = {
                        name: district,
                        state: product?.state,
                        products: [],
                        count: 0
                    };
                }
                grouped[district].products.push(product);
                grouped[district].count++;
            }
        });
        return grouped;
    }, [products]);

    // Load state GeoJSON data
    useEffect(() => {
        d3.json('/india-states-full.json')
            .then(statesData => {
                console.log('Loaded India states data');
                setMapData(statesData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading India map data:', error);
                setLoading(false);
            });
    }, []);

    // Load district data separately when toggled (GADM data)
    useEffect(() => {
        if (showDistricts && !districtData) {
            setLoadingDistricts(true);
            console.log('Loading GADM district boundaries...');
            d3.json('/india-gadm.json')
                .then(districtsData => {
                    console.log('Loaded', districtsData.features.length, 'district features from GADM');
                    setDistrictData(districtsData);
                    setLoadingDistricts(false);
                })
                .catch(error => {
                    console.error('Error loading district data:', error);
                    setLoadingDistricts(false);
                });
        }
    }, [showDistricts, districtData]);

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

    // Match state names between GeoJSON and database
    const matchStateName = (geoName) => {
        // Map GeoJSON state names to database state names
        const nameMapping = {
            'Jammu & Kashmir': 'Jammu and Kashmir',
            'NCT of Delhi': 'Delhi',
            'Dadara & Nagar Havelli': 'Dadra & Nagar Haveli (UT)',
            'Daman & Diu': 'Daman & Diu (UT)',
            'Andaman & Nicobar Island': 'Andaman and Nicobar Islands',
            'Orissa': 'Odisha',  // Old name → New name
            'Uttaranchal': 'Uttarakhand',  // Old name → New name
            // Add more mappings as needed
        };

        return nameMapping[geoName] || geoName;
    };

    // Normalize district name for fuzzy matching
    const normalizeDistrictName = (name) => {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/\s+/g, '')  // Remove spaces
            .replace(/[()&-\.]/g, '');  // Remove special characters
    };

    // Match GADM district names (NAME_2) with database using fuzzy matching
    const matchDistrictName = useCallback((gadmDistrictName) => {
        if (!gadmDistrictName) return '';

        // Static mappings for known variations (GADM → Database)
        const staticMapping = {
            'NorthandMiddleAndaman': 'North and Middle Andaman',
            'SouthAndaman': 'South Andamans',
            'Anantapur': 'Anantapuram (Anantapur)',
            'NicobarIslands': 'Nicobars',
        };

        // Check static mapping
        if (staticMapping[gadmDistrictName]) {
            return staticMapping[gadmDistrictName];
        }

        // Fuzzy matching
        const gadmNormalized = normalizeDistrictName(gadmDistrictName);
        const dbDistricts = Object.keys(districtData_products);

        // Exact match after normalization
        for (const dbDistrict of dbDistricts) {
            if (gadmNormalized === normalizeDistrictName(dbDistrict)) {
                return dbDistrict;
            }
        }

        // Partial match (contains)
        for (const dbDistrict of dbDistricts) {
            const dbNormalized = normalizeDistrictName(dbDistrict);
            if (gadmNormalized.includes(dbNormalized) || dbNormalized.includes(gadmNormalized)) {
                return dbDistrict;
            }
        }

        return '';  // No match
    }, [districtData_products]);

    // Update hover tooltip position
    const updateHoverTooltip = (x, y) => {
        setHoverTooltipPosition({ x, y });
    };

    // Close clicked tooltip
    const closeClickedTooltip = useCallback(() => {
        setClickedDistrict(null);
        setClickedState(null);
    }, []);

    // Render D3 map
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !mapData || products.length === 0) return;

        // Clear existing content
        d3.select(svgRef.current).selectAll('*').remove();

        const containerWidth = containerRef.current.clientWidth;
        const width = Math.min(containerWidth, 1000);
        const height = 700;

        console.log('Rendering India map with D3...');

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Create projection for India
        const projection = d3.geoMercator()
            .center([78.9629, 22.5937])
            .scale(width * 1.3)
            .translate([width / 2, height / 2]);

        const pathGenerator = d3.geoPath().projection(projection);

        // Create groups for districts and states
        const g = svg.append('g');

        // Draw district boundaries WITH FILL (so they're visible) - only if showDistricts is true
        if (showDistricts && districtData) {
            console.log('Drawing', districtData.features.length, 'districts');
            console.log('Districts with products:', Object.keys(districtData_products).length);
            console.log('Sample district data:', Object.keys(districtData_products).slice(0, 5));

            g.append('g')
                .attr('class', 'districts')
                .selectAll('path')
                .data(districtData.features)
                .enter()
                .append('path')
                .attr('d', pathGenerator)
                .attr('fill', d => {
                    // GADM uses NAME_2 for districts
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    const districtInfo = districtData_products[dbDistrictName];
                    const count = districtInfo?.count || 0;
                    return getColor(count);
                })
                .attr('fill-opacity', 0.8)
                .attr('stroke', '#475569')  // Dark slate color for borders
                .attr('stroke-width', 1)   // Thick visible line
                .attr('opacity', 1)
                .style('pointer-events', 'all')  // Enable pointer events on all districts
                .style('cursor', d => {
                    // GADM uses NAME_2 for districts
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    return districtData_products[dbDistrictName] ? 'pointer' : 'default';
                })
                .on('mouseenter', function(event, d) {
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    const districtInfo = districtData_products[dbDistrictName];

                    if (districtInfo && !clickedDistrict) {
                        // Simple hover - show preview tooltip
                        const element = this;

                        // Clear any pending timeout
                        if (hoverTimeoutRef.current) {
                            clearTimeout(hoverTimeoutRef.current);
                            hoverTimeoutRef.current = null;
                        }

                        // Highlight district
                        d3.select(element)
                            .attr('stroke', '#3B82F6')
                            .attr('stroke-width', 2);

                        d3.select(element).raise();

                        // Show hover tooltip
                        setHoveredDistrict(dbDistrictName);
                        setHoveredState(null);
                        updateHoverTooltip(event.pageX, event.pageY);
                    }
                })
                .on('mousemove', function(event, d) {
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    const districtInfo = districtData_products[dbDistrictName];

                    if (districtInfo && hoveredDistrict === dbDistrictName && !clickedDistrict) {
                        updateHoverTooltip(event.pageX, event.pageY);
                    }
                })
                .on('mouseleave', function(event, d) {
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    const districtInfo = districtData_products[dbDistrictName];

                    if (districtInfo && !clickedDistrict) {
                        const element = this;

                        // Remove highlight
                        d3.select(element)
                            .attr('stroke', '#475569')
                            .attr('stroke-width', 1);

                        // Hide hover tooltip after brief delay
                        hoverTimeoutRef.current = setTimeout(() => {
                            setHoveredDistrict(null);
                        }, 200);
                    }
                })
                .on('click', function(event, d) {
                    event.stopPropagation();
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    const districtInfo = districtData_products[dbDistrictName];

                    if (districtInfo) {
                        // Lock tooltip on click
                        const element = this;

                        // Clear hover tooltip
                        setHoveredDistrict(null);
                        setHoveredState(null);

                        // Highlight clicked district
                        d3.selectAll('.districts path')
                            .attr('stroke', '#475569')
                            .attr('stroke-width', 1);

                        d3.select(element)
                            .attr('stroke', '#EA580C')
                            .attr('stroke-width', 3);

                        d3.select(element).raise();

                        // Show locked tooltip
                        setClickedDistrict(dbDistrictName);
                        setClickedState(null);
                        setClickTooltipPosition({ x: event.pageX, y: event.pageY });
                    }
                });

            // Add district labels with product counts
            g.selectAll('.district-label')
                .data(districtData.features.filter(d => {
                    // GADM uses NAME_2 for districts
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    return districtData_products[dbDistrictName];
                }))
                .enter()
                .append('text')
                .attr('class', 'district-label')
                .attr('x', d => pathGenerator.centroid(d)[0])
                .attr('y', d => pathGenerator.centroid(d)[1])
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '9px')
                .attr('font-weight', 'bold')
                .attr('fill', '#1F2937')
                .attr('pointer-events', 'none')
                .text(d => {
                    // GADM uses NAME_2 for districts
                    const gadmDistrictName = d.properties.NAME_2;
                    const dbDistrictName = matchDistrictName(gadmDistrictName);
                    return districtData_products[dbDistrictName]?.count || '';
                });
        } else {
            console.log('District data not loaded');
        }

        // Draw states on top
        g.append('g')
            .attr('class', 'states')
            .selectAll('path')
            .data(mapData.features)
            .enter()
            .append('path')
            .attr('d', pathGenerator)
            .attr('class', 'state-path')
            .attr('fill', d => {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);
                const count = stateData[dbStateName]?.count || 0;
                // If districts are shown, make states transparent, otherwise use color
                return showDistricts ? 'none' : getColor(count);
            })
            .attr('stroke', '#ffffff')
            .attr('stroke-width', showDistricts ? 2 : 1)  // Thicker borders when showing districts
            .style('pointer-events', showDistricts ? 'none' : 'all')  // Disable pointer events on states when showing districts
            .style('cursor', d => {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);
                return stateData[dbStateName] ? 'pointer' : 'default';
            })
            .style('opacity', d => {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);
                return stateData[dbStateName] ? 1 : 0.5;
            })
            .on('mouseenter', function(event, d) {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);

                if (stateData[dbStateName] && !clickedState && !clickedDistrict) {
                    const element = this;

                    if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                    }

                    d3.select(element)
                        .attr('stroke', '#3B82F6')
                        .attr('stroke-width', 2);

                    d3.select(element).raise();

                    setHoveredState(dbStateName);
                    setHoveredDistrict(null);
                    updateHoverTooltip(event.pageX, event.pageY);
                }
            })
            .on('mousemove', function(event, d) {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);

                if (stateData[dbStateName] && hoveredState === dbStateName && !clickedState && !clickedDistrict) {
                    updateHoverTooltip(event.pageX, event.pageY);
                }
            })
            .on('mouseleave', function(event, d) {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);

                if (stateData[dbStateName] && !clickedState && !clickedDistrict) {
                    const element = this;

                    d3.select(element)
                        .attr('stroke', '#ffffff')
                        .attr('stroke-width', 1);

                    hoverTimeoutRef.current = setTimeout(() => {
                        setHoveredState(null);
                    }, 200);
                }
            })
            .on('click', function(event, d) {
                event.stopPropagation();
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);

                if (stateData[dbStateName]) {
                    const element = this;

                    // Clear hover tooltips
                    setHoveredState(null);
                    setHoveredDistrict(null);

                    // Highlight clicked state
                    d3.selectAll('.states path')
                        .attr('stroke', '#ffffff')
                        .attr('stroke-width', 1);

                    d3.select(element)
                        .attr('stroke', '#EA580C')
                        .attr('stroke-width', 3);

                    d3.select(element).raise();

                    // Show locked tooltip
                    setClickedState(dbStateName);
                    setClickedDistrict(null);
                    setClickTooltipPosition({ x: event.pageX, y: event.pageY });
                }
            });

        // Add state labels with product counts
        g.selectAll('text')
            .data(mapData.features.filter(d => {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);
                return stateData[dbStateName];
            }))
            .enter()
            .append('text')
            .attr('x', d => pathGenerator.centroid(d)[0])
            .attr('y', d => pathGenerator.centroid(d)[1])
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('fill', '#1F2937')
            .attr('pointer-events', 'none')
            .text(d => {
                const geoStateName = d.properties.NAME_1 || d.properties.st_nm || d.properties.ST_NM;
                const dbStateName = matchStateName(geoStateName);
                return stateData[dbStateName]?.count || '';
            });

    }, [mapData, stateData, products.length, districtData, matchDistrictName, districtData_products, showDistricts]);

    // Hover preview tooltip (lightweight, auto-hides) - Aceternity UI Style
    const HoverDistrictTooltip = ({ district }) => {
        const districtInfo = districtData_products[district];
        if (!districtInfo) return null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80",
                    "rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50",
                    "p-4 min-w-[260px] pointer-events-none overflow-hidden"
                )}
            >
                {/* Ambient gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

                {/* Sparkle effect */}
                <div className="absolute top-2 right-2 opacity-60">
                    <AnimatedSparkles className="w-4 h-4 text-blue-400 dark:text-blue-300" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <AnimatedMapPin className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            {district}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 ml-7">{districtInfo.state}</p>
                    <div className="flex items-center gap-2 ml-7">
                        <div className="p-1 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <AnimatedPackage className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {districtInfo.count} products
                        </p>
                    </div>
                    <p className="text-xs text-center mt-3 font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Click to explore →
                    </p>
                </div>
            </motion.div>
        );
    };

    // Clicked locked tooltip (full details, stays visible) - Aceternity UI Style
    const ClickedDistrictTooltip = ({ district, onClose }) => {
        const districtInfo = districtData_products[district];
        if (!districtInfo) return null;

        const topProducts = districtInfo.products.slice(0, 3);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={cn(
                    "relative backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90",
                    "rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/50",
                    "p-6 min-w-[340px] max-w-[420px] pointer-events-auto overflow-hidden"
                )}
            >
                {/* Ambient animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-30" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 shadow-lg">
                                    <AnimatedMapPin className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black text-xl bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 dark:from-orange-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {district}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 ml-14 mb-2">
                                {districtInfo.state}
                            </p>
                            <div className="flex items-center gap-2 ml-14">
                                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-300/30 dark:border-purple-600/30">
                                    <div className="flex items-center gap-1.5">
                                        <AnimatedPackage className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                            {districtInfo.count} products
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm transition-all"
                        >
                            <AnimatedClose className="w-5 h-5 text-gray-600 dark:text-gray-300" onClick={onClose} />
                        </motion.button>
                    </div>

                    <div className="space-y-3 mb-4">
                        {topProducts.map((product, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.03, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onProductClick?.(product);
                                    setTimeout(() => {
                                        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }}
                                className={cn(
                                    "group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer",
                                    "bg-gradient-to-r from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-800/40",
                                    "border border-white/60 dark:border-slate-700/60",
                                    "backdrop-blur-sm overflow-hidden",
                                    "hover:border-orange-300 dark:hover:border-orange-600/50",
                                    "transition-all duration-300"
                                )}
                            >
                                {/* Hover gradient effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-orange-500/10 group-hover:via-pink-500/10 group-hover:to-purple-500/10 transition-all duration-300" />

                                <div className="relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                                    {product?.product?.charAt(0) || '?'}
                                </div>
                                <div className="relative z-10 flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                                        {product?.product}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {product?.category}
                                    </div>
                                </div>
                                <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AnimatedSparkles className="w-4 h-4 text-orange-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-medium bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 dark:from-orange-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                            ✨ Click any product to view details
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    };

    const HoverStateTooltip = ({ state }) => {
        const stateInfo = stateData[state];
        if (!stateInfo) return null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80",
                    "rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50",
                    "p-4 min-w-[260px] pointer-events-none overflow-hidden"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10" />
                <div className="absolute top-2 right-2 opacity-60">
                    <AnimatedSparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-300" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                            <AnimatedMapPin className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            {state}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 ml-7">
                        <div className="p-1 rounded bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                            <AnimatedPackage className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {stateInfo.count} products
                        </p>
                    </div>
                    <p className="text-xs text-center mt-3 font-medium bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        Click to explore →
                    </p>
                </div>
            </motion.div>
        );
    };

    const ClickedStateTooltip = ({ state, onClose }) => {
        const stateInfo = stateData[state];
        if (!stateInfo) return null;

        const topProducts = stateInfo.products.slice(0, 3);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={cn(
                    "relative backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90",
                    "rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/50",
                    "p-6 min-w-[340px] max-w-[420px] pointer-events-auto overflow-hidden"
                )}
            >
                {/* Ambient animated background with different colors for states */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.3),rgba(255,255,255,0))]" />

                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl opacity-30" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-lg">
                                    <AnimatedMapPin className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black text-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                    {state}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 ml-14">
                                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-300/30 dark:border-cyan-600/30">
                                    <div className="flex items-center gap-1.5">
                                        <AnimatedPackage className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                            {stateInfo.count} products
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm transition-all"
                        >
                            <AnimatedClose className="w-5 h-5 text-gray-600 dark:text-gray-300" onClick={onClose} />
                        </motion.button>
                    </div>

                    <div className="space-y-3 mb-4">
                        {topProducts.map((product, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.03, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onProductClick?.(product);
                                    setTimeout(() => {
                                        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }}
                                className={cn(
                                    "group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer",
                                    "bg-gradient-to-r from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-800/40",
                                    "border border-white/60 dark:border-slate-700/60",
                                    "backdrop-blur-sm overflow-hidden",
                                    "hover:border-cyan-300 dark:hover:border-cyan-600/50",
                                    "transition-all duration-300"
                                )}
                            >
                                {/* Hover gradient effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-indigo-500/0 group-hover:from-cyan-500/10 group-hover:via-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-300" />

                                <div className="relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                                    {product?.product?.charAt(0) || '?'}
                                </div>
                                <div className="relative z-10 flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-indigo-600 group-hover:bg-clip-text transition-all">
                                        {product?.product}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {product?.category}
                                    </div>
                                </div>
                                <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AnimatedSparkles className="w-4 h-4 text-cyan-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-medium bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            ✨ Click any product to view details
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading India map...</p>
                </div>
            </div>
        );
    }

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

            {/* District Toggle Button */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setShowDistricts(!showDistricts)}
                    disabled={loadingDistricts}
                    className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        showDistricts
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white'
                            : 'bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-slate-600'
                    }`}
                >
                    {loadingDistricts ? (
                        <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Loading District Boundaries...
                        </span>
                    ) : (
                        showDistricts ? 'Hide District Boundaries' : 'Show District Boundaries'
                    )}
                </button>
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
                <svg ref={svgRef} className="w-full h-auto" style={{ maxHeight: '700px' }} />
            </div>

            {/* Hover Tooltips (lightweight previews with smooth animations) */}
            <AnimatePresence mode="wait">
                {hoveredDistrict && !clickedDistrict && !clickedState && (
                    <div
                        className="fixed z-40"
                        style={{
                            left: `${hoverTooltipPosition.x + 20}px`,
                            top: `${hoverTooltipPosition.y - 20}px`,
                        }}
                    >
                        <HoverDistrictTooltip district={hoveredDistrict} />
                    </div>
                )}
                {hoveredState && !hoveredDistrict && !clickedDistrict && !clickedState && (
                    <div
                        className="fixed z-40"
                        style={{
                            left: `${hoverTooltipPosition.x + 20}px`,
                            top: `${hoverTooltipPosition.y - 20}px`,
                        }}
                    >
                        <HoverStateTooltip state={hoveredState} />
                    </div>
                )}
            </AnimatePresence>

            {/* Clicked Tooltips (locked, stays visible) */}
            <AnimatePresence>
                {clickedDistrict && (
                    <div
                        className="fixed z-50"
                        style={{
                            left: `${clickTooltipPosition.x + 20}px`,
                            top: `${clickTooltipPosition.y - 20}px`,
                        }}
                    >
                        <ClickedDistrictTooltip district={clickedDistrict} onClose={closeClickedTooltip} />
                    </div>
                )}
                {clickedState && (
                    <div
                        className="fixed z-50"
                        style={{
                            left: `${clickTooltipPosition.x + 20}px`,
                            top: `${clickTooltipPosition.y - 20}px`,
                        }}
                    >
                        <ClickedStateTooltip state={clickedState} onClose={closeClickedTooltip} />
                    </div>
                )}
            </AnimatePresence>

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

export default IndiaMapD3Fixed;
