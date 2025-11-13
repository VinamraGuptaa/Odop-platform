import React, { useState, useMemo } from 'react';
import { MapPin, Package, TrendingUp, X } from 'lucide-react';

// Simplified India map with states - SVG paths for major states
const IndiaMap = ({ products = [], onStateClick }) => {
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
        if (!stateInfo) return 'fill-gray-200 dark:fill-slate-700';

        const count = stateInfo.count;
        if (count > 50) return 'fill-orange-600 dark:fill-orange-500';
        if (count > 30) return 'fill-orange-500 dark:fill-orange-400';
        if (count > 15) return 'fill-orange-400 dark:fill-orange-300';
        if (count > 5) return 'fill-orange-300 dark:fill-orange-200';
        return 'fill-orange-200 dark:fill-orange-100';
    };

    const handleStateHover = (stateName, event) => {
        setHoveredState(stateName);
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        });
    };

    const handleStateLeave = () => {
        setHoveredState(null);
    };

    // Simplified state paths (representative positions)
    const states = [
        { name: 'Jammu and Kashmir', path: 'M 150 50 L 180 40 L 200 50 L 190 80 L 160 85 Z', cx: 175, cy: 60 },
        { name: 'Himachal Pradesh', path: 'M 160 85 L 190 80 L 195 100 L 165 105 Z', cx: 177, cy: 92 },
        { name: 'Punjab', path: 'M 140 90 L 165 85 L 165 110 L 140 115 Z', cx: 152, cy: 100 },
        { name: 'Haryana', path: 'M 140 115 L 165 110 L 170 130 L 145 135 Z', cx: 155, cy: 122 },
        { name: 'Delhi', path: 'M 145 130 L 155 127 L 158 135 L 148 138 Z', cx: 151, cy: 132 },
        { name: 'Uttarakhand', path: 'M 165 105 L 195 100 L 200 120 L 170 125 Z', cx: 182, cy: 112 },
        { name: 'Uttar Pradesh', path: 'M 145 135 L 200 130 L 240 135 L 245 165 L 200 170 L 150 165 Z', cx: 195, cy: 150 },
        { name: 'Rajasthan', path: 'M 100 115 L 145 120 L 150 165 L 140 200 L 90 195 L 85 150 Z', cx: 117, cy: 157 },
        { name: 'Gujarat', path: 'M 70 180 L 90 195 L 85 240 L 60 260 L 40 240 L 45 200 Z', cx: 65, cy: 220 },
        { name: 'Maharashtra', path: 'M 90 240 L 140 235 L 160 270 L 150 300 L 100 295 L 80 270 Z', cx: 120, cy: 267 },
        { name: 'Madhya Pradesh', path: 'M 140 200 L 200 195 L 210 230 L 170 235 L 140 235 Z', cx: 170, cy: 217 },
        { name: 'Bihar', path: 'M 245 165 L 280 165 L 285 185 L 250 188 Z', cx: 262, cy: 176 },
        { name: 'Jharkhand', path: 'M 250 188 L 285 185 L 290 205 L 255 210 Z', cx: 267, cy: 197 },
        { name: 'West Bengal', path: 'M 285 185 L 320 180 L 330 210 L 310 225 L 290 205 Z', cx: 307, cy: 202 },
        { name: 'Odisha', path: 'M 255 210 L 290 205 L 295 245 L 265 250 Z', cx: 275, cy: 227 },
        { name: 'Chhattisgarh', path: 'M 210 230 L 255 225 L 260 250 L 215 255 Z', cx: 235, cy: 240 },
        { name: 'Andhra Pradesh', path: 'M 200 280 L 240 275 L 250 320 L 210 325 Z', cx: 225, cy: 300 },
        { name: 'Telangana', path: 'M 190 265 L 230 260 L 235 285 L 195 290 Z', cx: 212, cy: 275 },
        { name: 'Karnataka', path: 'M 150 300 L 200 295 L 210 345 L 160 350 Z', cx: 180, cy: 322 },
        { name: 'Goa', path: 'M 125 295 L 145 292 L 148 310 L 128 313 Z', cx: 136, cy: 302 },
        { name: 'Kerala', path: 'M 140 350 L 170 345 L 175 395 L 145 400 Z', cx: 157, cy: 372 },
        { name: 'Tamil Nadu', path: 'M 170 345 L 220 340 L 230 390 L 180 395 Z', cx: 200, cy: 367 },
        { name: 'Assam', path: 'M 330 210 L 370 205 L 380 230 L 340 235 Z', cx: 355, cy: 220 },
        { name: 'Meghalaya', path: 'M 340 235 L 365 233 L 368 245 L 343 247 Z', cx: 354, cy: 240 },
        { name: 'Tripura', path: 'M 345 250 L 360 248 L 362 265 L 347 267 Z', cx: 353, cy: 258 },
        { name: 'Mizoram', path: 'M 347 267 L 362 265 L 365 285 L 350 287 Z', cx: 356, cy: 276 },
        { name: 'Manipur', path: 'M 360 248 L 378 245 L 382 265 L 364 268 Z', cx: 371, cy: 256 },
        { name: 'Nagaland', path: 'M 370 225 L 390 222 L 394 242 L 374 245 Z', cx: 382, cy: 233 },
    ];

    const TooltipContent = ({ state }) => {
        const stateInfo = stateData[state];
        if (!stateInfo) return null;

        const topProducts = stateInfo.products.slice(0, 3);

        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-orange-300 dark:border-orange-600 p-4 min-w-[320px] max-w-[400px] animate-in fade-in zoom-in-95">
                {/* Header */}
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

                {/* Top Products */}
                <div className="space-y-2 mb-3">
                    {topProducts.map((product, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-800"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
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

                {/* View All Button */}
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
            {/* Header */}
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
                    <div className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-100"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">1-5 products</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-300 dark:bg-orange-200"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">6-15 products</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-400 dark:bg-orange-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">16-30 products</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500 dark:bg-orange-400"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">31-50 products</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-600 dark:bg-orange-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">50+ products</span>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative flex justify-center items-center">
                <svg
                    viewBox="0 0 450 450"
                    className="w-full max-w-4xl h-auto drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))' }}
                >
                    {/* Map background */}
                    <rect x="0" y="0" width="450" height="450" fill="transparent" />

                    {/* States */}
                    {states.map((state) => {
                        const hasData = stateData[state.name];
                        return (
                            <g key={state.name}>
                                <path
                                    d={state.path}
                                    className={`${getStateColor(state.name)} transition-all duration-300 cursor-pointer ${
                                        hoveredState === state.name
                                            ? 'opacity-100 stroke-orange-600 dark:stroke-orange-400 stroke-[3] filter drop-shadow-lg scale-105'
                                            : 'opacity-80 stroke-white dark:stroke-slate-600 stroke-[1.5] hover:opacity-100 hover:stroke-orange-500'
                                    }`}
                                    onMouseEnter={(e) => hasData && handleStateHover(state.name, e)}
                                    onMouseLeave={handleStateLeave}
                                    onClick={() => hasData && onStateClick?.(state.name)}
                                    style={{ transformOrigin: `${state.cx}px ${state.cy}px` }}
                                />
                                {/* State label */}
                                {hasData && (
                                    <text
                                        x={state.cx}
                                        y={state.cy}
                                        className="text-[8px] font-bold pointer-events-none fill-gray-700 dark:fill-white"
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

export default IndiaMap;
