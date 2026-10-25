import axios from 'axios';

const api = axios.create({
  baseURL: 'https://restaurant-ai-agent-xyz.onrender.com', // <-- Yahan apna asli Render URL daalo
});

export default api;