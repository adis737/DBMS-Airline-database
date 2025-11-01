import axios from 'axios';

// Use localhost when in development, otherwise use environment variable or fallback
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const fallbackBase = isDev ? 'http://localhost:3000' : 'https://dbms-airline-database-2.onrender.com';
const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBase,
	timeout: 10000,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export default api;
