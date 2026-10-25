import axios from 'axios';

const api = axios.create({
  baseURL: 'https://restaurant-ai-agent-4toc.onrender.com', // Aapka asli URL
});

export default api;