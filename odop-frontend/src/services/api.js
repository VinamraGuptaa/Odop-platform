import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API service functions
export const apiService = {
    // Get all products with optional filters - handles pagination automatically
    getProducts: async (params = {}) => {
        try {
            // Set a large page size to get all products in one request
            const response = await api.get('/products/', {
                params: {
                    ...params,
                    page_size: 2000  // Increase page size to get all products
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Get product statistics
    getProductStats: async () => {
        try {
            const response = await api.get('/products/stats/');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    },

    // Search products
    searchProducts: async (searchTerm, filters = {}) => {
        try {
            const params = {
                search: searchTerm,
                page_size: 2000,  // Increase page size for search results
                ...filters
            };
            const response = await api.get('/products/', { params });
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }
};

export default api;
