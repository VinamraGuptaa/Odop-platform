import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    AnimatedSearch,
    AnimatedMenu,
    AnimatedClose,
    AnimatedChevronDown,
    AnimatedSun,
    AnimatedMoon,
    AnimatedMapPin,
    AnimatedGrid,
    AnimatedBriefcase,
    AnimatedFilter
} from './ui/AnimatedIcons';

const Header = ({ onFilterChange, activeFilters = {}, products = [] }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [darkMode, setDarkMode] = useState(() =>
        window.matchMedia?.('(prefers-color-scheme: dark)').matches
    );
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    // Extract unique filter options from products (OPTIMIZED: memoized)
    const filterOptions = useMemo(() => ({
        states: [...new Set(products.map(p => p?.state).filter(Boolean))].sort(),
        categories: [...new Set(products.map(p => p?.category).filter(Boolean))].sort(),
        sectors: [...new Set(products.map(p => p?.sector).filter(Boolean))].sort(),
    }), [products]);

    // Pre-compute product counts for each filter option (OPTIMIZED: O(n) → O(1) lookup)
    const productCounts = useMemo(() => {
        const counts = {
            states: {},
            categories: {},
            sectors: {}
        };

        products.forEach(p => {
            if (p?.state) counts.states[p.state] = (counts.states[p.state] || 0) + 1;
            if (p?.category) counts.categories[p.category] = (counts.categories[p.category] || 0) + 1;
            if (p?.sector) counts.sectors[p.sector] = (counts.sectors[p.sector] || 0) + 1;
        });

        return counts;
    }, [products]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.pageYOffset > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFilterSelect = (filterType, value) => {
        const currentFilters = activeFilters[filterType] || [];
        const newFilters = currentFilters.includes(value)
            ? currentFilters.filter(v => v !== value)
            : [...currentFilters, value];

        onFilterChange?.({
            ...activeFilters,
            [filterType]: newFilters
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onFilterChange?.({
            ...activeFilters,
            search: searchTerm
        });
    };

    const clearFilter = (filterType, value = null) => {
        if (value) {
            handleFilterSelect(filterType, value);
        } else {
            onFilterChange?.({
                ...activeFilters,
                [filterType]: []
            });
        }
    };

    const totalActiveFilters =
        (activeFilters.states?.length || 0) +
        (activeFilters.categories?.length || 0) +
        (activeFilters.sectors?.length || 0);

    const FilterDropdown = ({ title, icon: Icon, filterType, options }) => {
        const isOpen = openDropdown === filterType;
        const activeCount = activeFilters[filterType]?.length || 0;

        return (
            <div className="relative" ref={isOpen ? dropdownRef : null}>
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : filterType)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                        isScrolled
                            ? 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                            : 'text-white hover:bg-white/20'
                    } ${activeCount > 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600' : ''}`}
                >
                    <Icon className="w-4 h-4" />
                    <span>{title}</span>
                    {activeCount > 0 && (
                        <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {activeCount}
                        </span>
                    )}
                    <AnimatedChevronDown className="w-4 h-4" isOpen={isOpen} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 max-h-96 overflow-y-auto scrollbar-thin">
                            {options.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                                    No options available
                                </p>
                            ) : (
                                options.map((option) => {
                                    const isSelected = activeFilters[filterType]?.includes(option);
                                    // OPTIMIZED: Use pre-computed counts (O(1) lookup instead of O(n) filter)
                                    const countKey = filterType === 'states' ? 'states' : filterType === 'categories' ? 'categories' : 'sectors';
                                    const count = productCounts[countKey][option] || 0;

                                    return (
                                        <label
                                            key={option}
                                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/30 dark:to-pink-900/30'
                                                    : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex items-center justify-center flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleFilterSelect(filterType, option)}
                                                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                                                    />
                                                </div>
                                                <span className={`text-sm font-medium truncate ${
                                                    isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                                                }`} title={option}>
                                                    {option}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                                {count}
                                            </span>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                        {activeCount > 0 && (
                            <div className="border-t border-gray-200 dark:border-slate-700 p-2">
                                <button
                                    onClick={() => clearFilter(filterType)}
                                    className="w-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                    Clear {title}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
                isScrolled
                    ? 'backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 shadow-lg border-b border-gray-200/50 dark:border-slate-700/50'
                    : 'bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600'
            }`}
        >
            {/* Top gradient bar */}
            {!isScrolled && (
                <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 opacity-60" />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex items-center justify-between ${isScrolled ? 'py-3' : 'py-4'}`}>
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-3 group">
                        <span className="text-4xl select-none transform group-hover:scale-110 transition-transform">
                            🇮🇳
                        </span>
                        <div>
                            <div className={`font-black text-xl md:text-2xl tracking-tight ${
                                isScrolled
                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500'
                                    : 'text-white drop-shadow-lg'
                            }`}>
                                ODOP India
                            </div>
                            <div className={`text-xs font-medium ${isScrolled ? 'text-gray-600 dark:text-gray-400' : 'text-white/90'}`}>
                                One District One Product
                            </div>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-2">
                        <FilterDropdown
                            title="States"
                            icon={AnimatedMapPin}
                            filterType="states"
                            options={filterOptions.states}
                        />
                        <FilterDropdown
                            title="Categories"
                            icon={AnimatedGrid}
                            filterType="categories"
                            options={filterOptions.categories}
                        />
                        <FilterDropdown
                            title="Sectors"
                            icon={AnimatedBriefcase}
                            filterType="sectors"
                            options={filterOptions.sectors}
                        />

                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <AnimatedSearch className={`absolute left-3 w-5 h-5 pointer-events-none z-10 ${
                                isScrolled ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'
                            }`} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={`w-64 pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all duration-300 ${
                                    searchFocused
                                        ? 'border-orange-500 ring-4 ring-orange-500/20 w-80'
                                        : 'border-transparent'
                                } ${
                                    isScrolled
                                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                                        : 'bg-white/20 backdrop-blur-sm text-white placeholder-white/70'
                                }`}
                            />
                        </form>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${
                                isScrolled
                                    ? 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                                    : 'hover:bg-white/20 text-white'
                            }`}
                        >
                            {darkMode ? <AnimatedSun className="w-5 h-5" /> : <AnimatedMoon className="w-5 h-5" />}
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`lg:hidden p-2 rounded-xl ${
                            isScrolled
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-white'
                        }`}
                    >
                        {mobileMenuOpen ? <AnimatedClose className="w-6 h-6" /> : <AnimatedMenu className="w-6 h-6" isOpen={mobileMenuOpen} />}
                    </button>
                </div>

                {/* Active Filters Pills */}
                {totalActiveFilters > 0 && (
                    <div className="pb-3 flex flex-wrap gap-2 items-center">
                        <AnimatedFilter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Filters:</span>
                        {activeFilters.states?.map(state => (
                            <span
                                key={state}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold"
                            >
                                {state}
                                <button onClick={() => clearFilter('states', state)}>
                                    <AnimatedClose className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        {activeFilters.categories?.map(cat => (
                            <span
                                key={cat}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-semibold"
                            >
                                {cat}
                                <button onClick={() => clearFilter('categories', cat)}>
                                    <AnimatedClose className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        {activeFilters.sectors?.map(sector => (
                            <span
                                key={sector}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold"
                            >
                                {sector}
                                <button onClick={() => clearFilter('sectors', sector)}>
                                    <AnimatedClose className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        <button
                            onClick={() => onFilterChange?.({
                                states: [],
                                categories: [],
                                sectors: [],
                                search: ''
                            })}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 animate-in slide-in-from-top">
                    <div className="p-4 space-y-3">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </form>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Filters</div>
                        {/* Mobile filters would go here */}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
