import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Award, Package, Briefcase, ExternalLink, Heart, Share2, Info } from 'lucide-react';

const ProductModal = ({ product, isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !product) {
        return null;
    }

    const getImageUrl = () => {
        const photo = product?.photo || product?.image || product?.image_url;

        if (!photo) {
            return getPlaceholderImage();
        }

        // Check if it's a Google Drive link - use proxy to bypass CORS
        if (photo.includes('drive.google.com')) {
            return `http://127.0.0.1:8000/api/proxy-image/?url=${encodeURIComponent(photo)}`;
        }

        return photo;
    };

    const getPlaceholderImage = () => {
        const colors = ['FF6B6B', 'FFB84D', '51CF66', '4DABF7', 'B197FC'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.product || 'Product')}&background=${randomColor}&color=fff&size=800&bold=true&font-size=0.35`;
    };

    const modalContent = (
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div
                    className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-3 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white dark:hover:bg-slate-600 transition-all transform hover:scale-110 hover:rotate-90"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[90vh] scrollbar-thin">
                        {/* Image Section */}
                        <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-900">
                            <img
                                src={getImageUrl()}
                                alt={product?.product}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getPlaceholderImage();
                                }}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {product?.category && (
                                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg">
                                        {product.category}
                                    </span>
                                )}
                                {product?.gi_tag && (
                                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                        <Award className="w-4 h-4" />
                                        GI Certified
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8">
                            {/* Title */}
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                {product?.product || 'Product Name'}
                            </h2>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-6">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <span className="text-lg font-semibold">
                                    {product?.district}, {product?.state}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 mb-8">
                                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                                    <Heart className="w-5 h-5" />
                                    Save to Favorites
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                                    <Share2 className="w-5 h-5" />
                                    Share
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-slate-600 hover:border-orange-500 dark:hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-orange-500 rounded-xl font-semibold transition-all">
                                    <ExternalLink className="w-5 h-5" />
                                    Visit Website
                                </button>
                            </div>

                            {/* Product Details Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Description Card */}
                                {product?.description && (
                                    <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Description</h3>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Category Card */}
                                {product?.category && (
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {product.category}
                                        </p>
                                    </div>
                                )}

                                {/* Sector Card */}
                                {product?.sector && (
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sector</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {product.sector}
                                        </p>
                                    </div>
                                )}

                                {/* State Card */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">State</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {product.state}
                                    </p>
                                    {product?.district && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            District: {product.district}
                                        </p>
                                    )}
                                </div>

                                {/* GI Status Card */}
                                <div className={`bg-gradient-to-br rounded-2xl p-6 border ${
                                    product?.gi_tag
                                        ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'
                                        : 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800'
                                }`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Award className={`w-5 h-5 ${
                                            product?.gi_tag ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">GI Status</h3>
                                    </div>
                                    <p className={`text-2xl font-bold ${
                                        product?.gi_tag
                                            ? 'text-yellow-600 dark:text-yellow-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {product?.gi_tag ? 'Certified ✓' : 'Not Certified'}
                                    </p>
                                    {product?.gi_tag && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            This product has Geographical Indication certification
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    About ODOP Initiative
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    The One District One Product (ODOP) initiative aims to promote indigenous and specialized products
                                    and crafts from every district of India. This program helps preserve traditional craftsmanship
                                    while supporting local artisans and boosting economic growth in rural areas.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Border Gradient Effect */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none"
                         style={{
                             background: 'linear-gradient(45deg, transparent, rgba(255,107,107,0.1), rgba(255,184,77,0.1), transparent)',
                             backgroundSize: '400% 400%',
                             animation: 'gradient 8s ease infinite'
                         }}
                    />
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ProductModal;
