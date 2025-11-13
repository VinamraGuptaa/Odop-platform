import React, { useState, useMemo } from 'react';
import { MapPin, Package, TrendingUp } from 'lucide-react';

// Enhanced India map with more comprehensive state coverage
const IndiaMapImproved = ({ products = [], onStateClick }) => {
    const [hoveredState, setHoveredState] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

    // Get color intensity based on product count
    const getStateColor = (stateName) => {
        const stateInfo = stateData[stateName];
        if (!stateInfo) return '#E5E7EB'; // Gray for no data

        const count = stateInfo.count;
        if (count > 100) return '#EA580C'; // Orange 600
        if (count > 50) return '#F97316'; // Orange 500
        if (count > 25) return '#FB923C'; // Orange 400
        if (count > 10) return '#FDBA74'; // Orange 300
        if (count > 5) return '#FED7AA'; // Orange 200
        return '#FFEDD5'; // Orange 100
    };

    const handleStateHover = (stateName, event) => {
        if (stateData[stateName]) {
            setHoveredState(stateName);
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPosition({
                x: event.clientX,
                y: event.clientY
            });
        }
    };

    const handleStateLeave = () => {
        setHoveredState(null);
    };

    // More comprehensive India states with better positioning
    const indiaStates = [
        // North
        { name: 'Jammu and Kashmir', path: 'M180,40 L200,35 L220,40 L225,60 L215,75 L190,78 L175,70 L170,55 Z', label: { x: 195, y: 55 } },
        { name: 'Ladakh', path: 'M225,30 L245,28 L255,45 L250,60 L235,58 L225,50 Z', label: { x: 240, y: 45 } },
        { name: 'Himachal Pradesh', path: 'M190,78 L215,75 L220,90 L210,100 L195,98 Z', label: { x: 205, y: 88 } },
        { name: 'Punjab', path: 'M170,85 L195,82 L195,105 L175,110 L165,100 Z', label: { x: 180, y: 95 } },
        { name: 'Chandigarh', path: 'M185,102 L192,100 L194,107 L187,109 Z', label: { x: 190, y: 105 } },
        { name: 'Haryana', path: 'M175,110 L195,105 L205,120 L195,130 L180,128 Z', label: { x: 190, y: 118 } },
        { name: 'Delhi', path: 'M192,125 L200,123 L202,130 L195,132 Z', label: { x: 197, y: 127 } },
        { name: 'Uttarakhand', path: 'M210,100 L230,95 L240,110 L235,120 L215,118 Z', label: { x: 225, y: 108 } },

        // Central North
        { name: 'Uttar Pradesh', path: 'M195,130 L240,125 L280,130 L290,155 L270,170 L240,172 L210,168 L200,155 Z', label: { x: 245, y: 150 } },
        { name: 'Bihar', path: 'M290,155 L330,153 L340,168 L335,180 L310,182 L290,175 Z', label: { x: 315, y: 167 } },
        { name: 'Jharkhand', path: 'M310,182 L335,180 L342,200 L330,215 L305,213 Z', label: { x: 323, y: 197 } },
        { name: 'West Bengal', path: 'M340,168 L370,165 L385,185 L380,210 L360,220 L342,200 Z', label: { x: 365, y: 190 } },

        // Northeast
        { name: 'Sikkim', path: 'M380,155 L392,153 L395,162 L388,165 Z', label: { x: 388, y: 158 } },
        { name: 'Assam', path: 'M385,165 L420,163 L435,178 L430,195 L405,198 L390,188 Z', label: { x: 415, y: 180 } },
        { name: 'Meghalaya', path: 'M405,198 L420,197 L422,208 L410,210 Z', label: { x: 414, y: 203 } },
        { name: 'Tripura', path: 'M410,210 L420,209 L422,222 L412,224 Z', label: { x: 416, y: 216 } },
        { name: 'Mizoram', path: 'M412,224 L422,222 L425,238 L415,240 Z', label: { x: 419, y: 231 } },
        { name: 'Manipur', path: 'M422,208 L438,206 L442,220 L430,222 Z', label: { x: 432, y: 214 } },
        { name: 'Nagaland', path: 'M430,195 L448,193 L452,207 L442,210 Z', label: { x: 442, y: 202 } },
        { name: 'Arunachal Pradesh', path: 'M420,163 L465,158 L475,175 L465,185 L448,188 L435,178 Z', label: { x: 450, y: 173 } },

        // West
        { name: 'Rajasthan', path: 'M120,130 L180,125 L200,155 L195,195 L170,210 L135,205 L115,180 Z', label: { x: 160, y: 170 } },
        { name: 'Gujarat', path: 'M80,195 L135,190 L145,230 L140,265 L110,280 L75,270 L65,240 Z', label: { x: 110, y: 235 } },
        { name: 'Dadra & Nagar Haveli (UT)', path: 'M115,240 L122,238 L124,245 L117,247 Z', label: { x: 120, y: 242 } },
        { name: 'Daman & Diu (UT)', path: 'M95,225 L103,223 L105,230 L97,232 Z', label: { x: 100, y: 227 } },
        { name: 'Maharashtra', path: 'M145,230 L210,225 L230,260 L225,305 L190,315 L155,310 L135,280 Z', label: { x: 185, y: 270 } },

        // Central
        { name: 'Madhya Pradesh', path: 'M170,210 L240,205 L265,235 L255,270 L230,272 L200,268 L180,245 Z', label: { x: 225, y: 240 } },
        { name: 'Chhattisgarh', path: 'M265,235 L305,233 L320,265 L310,290 L280,292 L265,275 Z', label: { x: 290, y: 260 } },

        // East
        { name: 'Odisha', path: 'M305,213 L340,210 L350,245 L345,275 L320,285 L310,270 Z', label: { x: 328, y: 245 } },

        // South
        { name: 'Telangana', path: 'M230,305 L265,300 L272,325 L260,340 L235,338 Z', label: { x: 250, y: 320 } },
        { name: 'Andhra Pradesh', path: 'M260,340 L295,335 L310,370 L300,395 L270,398 L255,375 Z', label: { x: 280, y: 365 } },
        { name: 'Karnataka', path: 'M190,315 L235,310 L255,350 L248,390 L215,405 L185,395 Z', label: { x: 220, y: 360 } },
        { name: 'Goa', path: 'M160,320 L180,318 L183,335 L165,338 Z', label: { x: 172, y: 328 } },
        { name: 'Kerala', path: 'M185,395 L215,390 L223,435 L205,455 L180,450 Z', label: { x: 202, y: 420 } },
        { name: 'Tamil Nadu', path: 'M215,405 L270,400 L285,440 L275,470 L240,478 L210,465 Z', label: { x: 250, y: 440 } },
        { name: 'Puducherry', path: 'M258,428 L265,426 L267,433 L260,435 Z', label: { x: 263, y: 430 } },

        // Islands
        { name: 'Andaman and Nicobar Islands', path: 'M485,330 L495,328 L500,345 L497,365 L490,368 L483,355 Z', label: { x: 492, y: 348 } },
        { name: 'Lakshadweep', path: 'M130,395 L138,393 L140,403 L132,405 Z', label: { x: 135, y: 399 } },
    ];

    const TooltipContent = ({ state }) => {
        const stateInfo = stateData[state];
        if (!stateInfo) return null;

        const topProducts = stateInfo.products.slice(0, 3);

        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-orange-300 dark:border-orange-600 p-4 min-w-[320px] max-w-[400px] animate-in fade-in zoom-in-95">
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

                <button
                    onClick={() => onStateClick?.(state)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                    View All {stateInfo.count} Products
                    <TrendingUp className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                    Explore India's Treasures
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Hover over states to discover authentic regional products
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
            <div className="relative flex justify-center items-center">
                <svg
                    viewBox="0 0 550 500"
                    className="w-full max-w-5xl h-auto drop-shadow-2xl"
                >
                    <rect x="0" y="0" width="550" height="500" fill="transparent" />

                    {indiaStates.map((state) => {
                        const hasData = stateData[state.name];
                        const fillColor = getStateColor(state.name);

                        return (
                            <g key={state.name}>
                                <path
                                    d={state.path}
                                    fill={fillColor}
                                    stroke={hoveredState === state.name ? '#EA580C' : '#ffffff'}
                                    strokeWidth={hoveredState === state.name ? 3 : 1.5}
                                    className={`transition-all duration-300 ${
                                        hasData ? 'cursor-pointer hover:opacity-90' : 'opacity-50'
                                    }`}
                                    style={{
                                        filter: hoveredState === state.name ? 'drop-shadow(0 4px 8px rgba(234, 88, 12, 0.4))' : 'none',
                                        transform: hoveredState === state.name ? 'scale(1.05)' : 'scale(1)',
                                        transformOrigin: `${state.label.x}px ${state.label.y}px`
                                    }}
                                    onMouseEnter={(e) => hasData && handleStateHover(state.name, e)}
                                    onMouseMove={(e) => hasData && handleStateHover(state.name, e)}
                                    onMouseLeave={handleStateLeave}
                                    onClick={() => hasData && onStateClick?.(state.name)}
                                />
                                {hasData && (
                                    <text
                                        x={state.label.x}
                                        y={state.label.y}
                                        className="text-[10px] font-bold pointer-events-none fill-gray-800 dark:fill-white"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        {stateData[state.name]?.count || ''}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

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
            </div>

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

export default IndiaMapImproved;
