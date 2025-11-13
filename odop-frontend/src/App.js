import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from './services/api';

// Import all components
import Header from './components/Header';
import IndiaMapD3Fixed from './components/IndiaMapD3Fixed';
import FeaturedStates from './components/FeaturedStates';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';

const ODOPApp = () => {
    // State management
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        states: [],
        categories: [],
        sectors: [],
        search: '',
    });

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [productsData, statsData] = await Promise.all([
                    apiService.getProducts(),
                    apiService.getProductStats()
                ]);

                const productList = productsData?.results || productsData || [];
                setProducts(productList);
                setStats(statsData || null);
                setError(null);
            } catch (err) {
                setError('Failed to load data. Please make sure your Django server is running on http://localhost:8000');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Filter products based on active filters
    const filteredProducts = useMemo(() => {
        // OPTIMIZED: Check if any filters are active first to avoid unnecessary array copy
        const hasActiveFilters = filters.states.length > 0 ||
                                 filters.categories.length > 0 ||
                                 filters.sectors.length > 0 ||
                                 filters.search;

        // If no filters, return original array (no copy needed)
        if (!hasActiveFilters) {
            return products;
        }

        // Start with original array reference
        let filtered = products;

        // Filter by states
        if (filters.states.length > 0) {
            filtered = filtered.filter(p => filters.states.includes(p?.state));
        }

        // Filter by categories
        if (filters.categories.length > 0) {
            filtered = filtered.filter(p => filters.categories.includes(p?.category));
        }

        // Filter by sectors
        if (filters.sectors.length > 0) {
            filtered = filtered.filter(p => filters.sectors.includes(p?.sector));
        }

        // Filter by search
        if (filters.search) {
            try {
                // Sanitize search input - trim and limit length
                const sanitizedSearch = filters.search.trim().slice(0, 100);
                if (sanitizedSearch) {
                    const searchLower = sanitizedSearch.toLowerCase();
                    filtered = filtered.filter(p => {
                        try {
                            const searchableText = `${p?.product || ''} ${p?.description || ''} ${p?.state || ''} ${p?.district || ''} ${p?.category || ''}`.toLowerCase();
                            return searchableText.includes(searchLower);
                        } catch (err) {
                            console.error('Error filtering product:', p?.id, err);
                            return false;
                        }
                    });
                }
            } catch (err) {
                console.error('Error in search filter:', err);
                // If search fails, return unfiltered results
            }
        }

        return filtered;
    }, [products, filters]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
        // Scroll to products section
        setTimeout(() => {
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    // Handle state click from map
    const handleStateClick = useCallback((stateName) => {
        setFilters(prev => ({
            ...prev,
            states: [stateName]
        }));
        // Scroll to products
        setTimeout(() => {
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    // Handle product click
    const handleProductClick = useCallback((product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }, []);

    // Handle modal close
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
    }, []);

    // Loading state
    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-24 w-24 border-8 border-orange-200 border-t-orange-500 mx-auto mb-6" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl">🇮🇳</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        Loading ODOP Platform
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Discovering India's authentic treasures...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border-2 border-red-200 dark:border-red-800">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Connection Error
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen app-background">
            {/* Header with Filters */}
            <Header
                onFilterChange={handleFilterChange}
                activeFilters={filters}
                products={products}
            />

            {/* Main Content */}
            <main className="pt-20">
                {/* Hero Section with Stats */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-4">
                            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                                One District
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                One Product
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Celebrating India's rich cultural heritage through authentic regional products and traditional craftsmanship
                        </p>
                    </div>

                    {/* Stats Overview */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                            {[
                                { label: 'Products', value: stats.total_products, icon: '🏺', color: 'from-orange-500 to-red-500' },
                                { label: 'States', value: stats.total_states, icon: '🗺️', color: 'from-green-500 to-emerald-500' },
                                { label: 'Districts', value: stats.total_districts, icon: '📍', color: 'from-blue-500 to-indigo-500' },
                                { label: 'Categories', value: stats.total_categories, icon: '🎨', color: 'from-purple-500 to-pink-500' },
                                { label: 'Sectors', value: stats.total_sectors, icon: '⚙️', color: 'from-pink-500 to-rose-500' },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200 dark:border-slate-700"
                                >
                                    <div className="text-4xl mb-2">{stat.icon}</div>
                                    <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                                        {stat.value.toLocaleString()}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Interactive India Map */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <IndiaMapD3Fixed
                        products={products}
                        onStateClick={handleStateClick}
                        onProductClick={handleProductClick}
                    />
                </div>

                {/* Featured States Carousel */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <FeaturedStates products={products} onStateClick={handleStateClick} />
                </div>

                {/* Products Section */}
                <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="mb-8">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                            {filters.states.length > 0 || filters.categories.length > 0 || filters.sectors.length > 0 || filters.search
                                ? 'Filtered Products'
                                : 'All Products'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {filteredProducts.length === products.length
                                ? 'Browse our complete collection of authentic regional products'
                                : `Showing ${filteredProducts.length} of ${products.length} products`}
                        </p>
                    </div>
                    <ProductGrid
                        products={filteredProducts}
                        onProductClick={handleProductClick}
                        loading={loading}
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Product Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleModalClose}
            />
        </div>
    );
};

export default ODOPApp;
