import React, { useState } from 'react';
import { MapPin, Award, Heart, ExternalLink, Info, Sparkles, Package } from 'lucide-react';

const ProductCard = ({ product, onClick }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Generate gradient based on category
    const getCategoryGradient = (category) => {
        const gradients = {
            'Handicrafts': 'from-purple-500 via-pink-500 to-red-500',
            'Handloom': 'from-blue-500 via-cyan-500 to-teal-500',
            'Textiles': 'from-indigo-500 via-purple-500 to-pink-500',
            'Food Products': 'from-orange-500 via-yellow-500 to-amber-500',
            'Agriculture': 'from-green-500 via-emerald-500 to-teal-500',
            'Art & Craft': 'from-rose-500 via-pink-500 to-fuchsia-500',
            'Wooden Products': 'from-amber-600 via-orange-500 to-yellow-600',
            'Metal Craft': 'from-gray-500 via-slate-600 to-zinc-600',
        };
        return gradients[category] || 'from-gray-500 via-slate-500 to-zinc-500';
    };

    // Convert Google Drive link to proxied URL to bypass CORS
    const getImageUrl = () => {
        const photo = product?.photo || product?.image || product?.image_url;

        if (!photo) {
            return getPlaceholderImage();
        }

        // Check if it's a Google Drive link
        if (photo.includes('drive.google.com')) {
            // Use Django proxy to fetch the image (bypasses CORS)
            return `http://127.0.0.1:8000/api/proxy-image/?url=${encodeURIComponent(photo)}`;
        }

        return photo;
    };

    // Fallback placeholder image with category-specific colors
    const getPlaceholderImage = () => {
        const categoryColors = {
            'Primary': '10B981',
            'Handicrafts': 'A855F7',
            'Handloom': '3B82F6',
            'Textiles': '8B5CF6',
            'Food Products': 'F59E0B',
            'Agriculture': '10B981',
            'Art & Craft': 'EC4899',
            'Wooden Products': 'D97706',
            'Metal Craft': '6B7280',
        };

        const category = product?.category || 'Product';
        const color = categoryColors[category] || 'F97316';
        const productName = product?.product || 'Product';

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(productName)}&background=${color}&color=fff&size=800&bold=true&font-size=0.33&length=2`;
    };

    return (
        <div className="group relative h-full">
            {/* Main Card */}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-slate-700 h-full flex flex-col">

                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
                    <img
                        src={getImageUrl()}
                        alt={product?.product || 'Product'}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getPlaceholderImage();
                            setImageLoaded(true);
                        }}
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getCategoryGradient(product?.category)} text-white text-xs font-bold shadow-xl backdrop-blur-sm flex items-center gap-2 transform transition-transform group-hover:scale-110`}>
                            <Sparkles className="w-3 h-3" />
                            {product?.category || 'Handicrafts'}
                        </div>
                    </div>

                    {/* GI Tag if applicable */}
                    {product?.gi_tag && (
                        <div className="absolute top-4 right-4 z-10">
                            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                GI Certified
                            </div>
                        </div>
                    )}

                    {/* Like Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLiked(!isLiked);
                        }}
                        className="absolute bottom-4 right-4 p-3 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-xl transform transition-all duration-300 hover:scale-125 opacity-0 group-hover:opacity-100 z-10"
                        aria-label={isLiked ? 'Unlike' : 'Like'}
                    >
                        <Heart
                            className={`w-5 h-5 transition-all duration-300 ${
                                isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        />
                    </button>

                    {/* Quick View on Hover */}
                    <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={() => onClick?.(product)}
                            className="w-full py-3 px-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-gray-900 dark:text-white font-semibold rounded-xl shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Info className="w-4 h-4" />
                            Quick View
                        </button>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* Product Name */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 transition-all duration-300">
                        {product?.product || 'Authentic Product'}
                    </h3>

                    {/* Description */}
                    {product?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-1">
                            {product.description}
                        </p>
                    )}

                    {/* Location Info */}
                    <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                            {product?.district}, {product?.state}
                        </span>
                    </div>

                    {/* Sector Badge */}
                    {product?.sector && (
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                                {product.sector}
                            </span>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-slate-700 my-4" />

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onClick?.(product)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            <Info className="w-4 h-4" />
                            Details
                        </button>

                        <button
                            className="p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-orange-500"
                            aria-label="Share product"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Border Glow on Hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10"
                />
            </div>

            {/* Floating Badge (appears on hover) */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-2xl whitespace-nowrap">
                    ✨ Authentic Heritage Product
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
