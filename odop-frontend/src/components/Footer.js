import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="text-center space-y-6">
                    {/* Brand Section */}
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-5xl">🇮🇳</span>
                        <div className="text-left">
                            <h3 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                                ODOP India
                            </h3>
                            <p className="text-sm text-gray-400">One District One Product</p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Celebrating India's rich cultural heritage through authentic regional products and traditional craftsmanship
                    </p>

                    {/* Divider */}
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto" />

                    {/* Credits */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-400">
                            © {currentYear} Made by{' '}
                            <span className="font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                                Vinamra Gupta
                            </span>
                        </p>
                        <p className="text-xs text-gray-500">
                            Data sourced from ODOP Initiative by Government of India
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
        </footer>
    );
};

export default Footer;
