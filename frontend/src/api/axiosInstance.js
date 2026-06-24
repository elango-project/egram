import axios from 'axios';
import toast from 'react-hot-toast';
const envUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-error'));
        toast.error('Session expired. Please log in again.');
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('Requested resource not found.');
        break;
      case 500:
        toast.error('Internal server error. Please try again later.');
        break;
      default:
        // Other errors might be handled by the specific service
        break;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
