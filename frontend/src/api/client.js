import axios from 'axios';

const api = axios.create({
  baseURL: 'https://restaurant-ai-agent-4toc.onrender.com',
  timeout: 180000, // 3 minute (180 seconds)
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error("Request Timeout: AI zyada waqt le raha hai.");
    }
    return Promise.reject(error);
  }
);

export default api;
