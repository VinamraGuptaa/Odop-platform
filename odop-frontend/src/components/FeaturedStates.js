import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Package, Star } from 'lucide-react';

const FeaturedStates = ({ products = [], onStateClick }) => {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    // Group products by state and get featured states
    const stateGroups = React.useMemo(() => {
        const grouped = {};
        products.forEach(product => {
            const state = product?.state;
            if (state) {
                if (!grouped[state]) {
                    grouped[state] = {
                        name: state,
                        products: [],
                        categories: new Set(),
                    };
                }
                grouped[state].products.push(product);
                if (product?.category) {
                    grouped[state].categories.add(product.category);
                }
            }
        });

        // Convert to array and sort by product count
        return Object.values(grouped)
            .map(state => ({
                ...state,
                categories: Array.from(state.categories),
                count: state.products.length,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15); // Top 15 states
    }, [products]);

    // Check scroll position
    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [stateGroups]);

    // Auto scroll
    useEffect(() => {
        if (!isAutoScrolling) return;

        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft >= scrollWidth - clientWidth - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isAutoScrolling]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            setIsAutoScrolling(false); // Stop auto scroll when user manually scrolls
        }
    };

    const getStateIcon = (state) => {
        const icons = {
            'Rajasthan': '🏜️',
            'Kerala': '🥥',
            'Kashmir': '🏔️',
            'Jammu and Kashmir': '🏔️',
            'Tamil Nadu': '🛕',
            'Maharashtra': '🏰',
            'Gujarat': '🦁',
            'Punjab': '🌾',
            'West Bengal': '🐅',
            'Karnataka': '☕',
            'Uttar Pradesh': '🕌',
            'Madhya Pradesh': '💎',
        };
        return icons[state] || '🏛️';
    };

    const getGradient = (index) => {
        const gradients = [
            'from-orange-500 to-red-500',
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-green-500 to-emerald-500',
            'from-yellow-500 to-orange-500',
            'from-indigo-500 to-purple-500',
            'from-rose-500 to-pink-500',
            'from-teal-500 to-green-500',
        ];
        return gradients[index % gradients.length];
    };

    if (stateGroups.length === 0) return null;

    return (
        <div className="relative bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Header */}
            <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full px-6 py-2 mb-4">
                    <Star className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">FEATURED STATES</span>
                </div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                    Explore by State
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Discover unique products from India's diverse regions
                </p>
            </div>

            {/* Carousel Controls */}
            <div className="relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white dark:bg-slate-800 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-gray-200 dark:border-slate-600 group"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-orange-500" />
                    </button>
                )}

                {/* Carousel Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    onMouseEnter={() => setIsAutoScrolling(false)}
                    onMouseLeave={() => setIsAutoScrolling(true)}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-12"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {stateGroups.map((state, index) => (
                        <div
                            key={state.name}
                            className="flex-shrink-0 w-80 group cursor-pointer"
                            onClick={() => onStateClick?.(state.name)}
                        >
                            <div className={`relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600 h-full`}>
                                {/* Header with Gradient */}
                                <div className={`bg-gradient-to-r ${getGradient(index)} p-6 text-white relative overflow-hidden`}>
                                    {/* Pattern Overlay */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                            backgroundSize: '20px 20px'
                                        }} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-5xl">{getStateIcon(state.name)}</span>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold">
                                                #{index + 1}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black mb-1">{state.name}</h3>
                                        <p className="text-white/90 text-sm font-medium flex items-center gap-1">
                                            <Package className="w-4 h-4" />
                                            {state.count} Products
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Categories */}
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                                            Popular Categories
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {state.categories.slice(0, 3).map((category, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/30 dark:to-pink-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-semibold border border-orange-200 dark:border-orange-800"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                            {state.categories.length > 3 && (
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-semibold">
                                                    +{state.categories.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Products Preview */}
                                    <div className="space-y-2 mb-4">
                                        {state.products.slice(0, 2).map((product, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600"
                                            >
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGradient(idx)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                                    {product?.product?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {product?.product}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* View Button */}
                                    <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Explore {state.name}
                                    </button>
                                </div>

                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white dark:bg-slate-800 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-gray-200 dark:border-slate-600 group"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-orange-500" />
                    </button>
                )}
            </div>

            {/* Auto-scroll indicator */}
            <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className={`w-2 h-2 rounded-full ${isAutoScrolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    {isAutoScrolling ? 'Auto-scrolling enabled' : 'Paused'}
                </div>
            </div>
        </div>
    );
};

export default FeaturedStates;
