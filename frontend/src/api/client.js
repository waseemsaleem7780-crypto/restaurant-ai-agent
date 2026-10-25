import axios from 'axios';

const api = axios.create({
  // Aapka Render URL (Dhyan rakhein, https aur aakhir mein slash nahi)
  baseURL: 'https://restaurant-ai-agent-4toc.onrender.com',
  
  // Timeout badha diya (Render free tier jaagne ke liye 60 sec chahiye)
  timeout: 60000, 
});

// Agar koi error aaye toh console mein print karo (Debugging ke liye)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);

export default api;