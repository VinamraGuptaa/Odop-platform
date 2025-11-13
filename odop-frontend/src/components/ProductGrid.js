import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Grid3x3, List, ChevronDown, SlidersHorizontal } from 'lucide-react';

const ProductGrid = ({ products = [], onProductClick, loading = false }) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'state', 'category'
    const [itemsToShow, setItemsToShow] = useState(20);

    // Deduplicate and sort products
    const sortedProducts = useMemo(() => {
        // Remove duplicates based on product name, state, and district
        const uniqueProducts = products.reduce((acc, current) => {
            const key = `${current?.product}-${current?.state}-${current?.district}`;
            if (!acc.has(key)) {
                acc.set(key, current);
            }
            return acc;
        }, new Map());

        const sorted = Array.from(uniqueProducts.values());

        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => (a?.product || '').localeCompare(b?.product || ''));
            case 'state':
                return sorted.sort((a, b) => (a?.state || '').localeCompare(b?.state || ''));
            case 'category':
                return sorted.sort((a, b) => (a?.category || '').localeCompare(b?.category || ''));
            default:
                return sorted;
        }
    }, [products, sortBy]);

    const visibleProducts = sortedProducts.slice(0, itemsToShow);
    const hasMore = itemsToShow < sortedProducts.length;

    const loadMore = () => {
        setItemsToShow(prev => prev + 20);
    };

    if (loading) {
        return (
            <div className="py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 dark:bg-slate-700 rounded-3xl h-96" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center">
                        <Grid3x3 className="w-12 h-12 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        No Products Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Try adjusting your filters or search terms to find what you're looking for.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {products.length} Products Found
                    </h3>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Sort Dropdown */}
                    <div className="relative flex-1 sm:flex-initial">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-auto appearance-none px-4 py-2 pr-10 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-medium cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="state">Sort by State</option>
                            <option value="category">Sort by Category</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-600 shadow-md text-orange-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                            aria-label="Grid view"
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-600 shadow-md text-orange-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                            aria-label="List view"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid/List */}
            <div className={`
                ${viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'flex flex-col gap-4'
                }
            `}>
                {visibleProducts.map((product, index) => (
                    <div
                        key={product?.id || `${product?.product}-${index}`}
                    >
                        {viewMode === 'grid' ? (
                            <ProductCard product={product} onClick={onProductClick} />
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                                <div className="flex gap-4">
                                    <img
                                        src={product?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.product || 'P')}&background=random&size=200`}
                                        alt={product?.product}
                                        className="w-24 h-24 rounded-xl object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                            {product?.product}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {product?.district}, {product?.state}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                                                {product?.category}
                                            </span>
                                            {product?.gi_tag && (
                                                <span className="text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">
                                                    GI Certified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onProductClick?.(product)}
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center pt-8">
                    <button
                        onClick={loadMore}
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        Load More Products
                        <ChevronDown className="w-5 h-5" />
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        Showing {visibleProducts.length} of {sortedProducts.length} products
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
