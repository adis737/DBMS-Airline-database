import axios from 'axios';

const fallbackBase = 'https://dbms-airline-database-2.onrender.com'
const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBase,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export default api;
