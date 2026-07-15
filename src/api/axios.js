import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7042';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    // Axios automatically sets Content-Type to multipart/form-data for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to handle PascalCase and camelCase from C# backend
const normalizeBaseResponse = (resData) => {
  if (resData && typeof resData === 'object') {
    const hasSuccess = 'success' in resData || 'Success' in resData;
    if (hasSuccess) {
      return {
        isBaseResponse: true,
        success: resData.success !== undefined ? resData.success : resData.Success,
        message: resData.message || resData.Message,
        data: resData.data !== undefined ? resData.data : resData.Data,
      };
    }
  }
  return { isBaseResponse: false };
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    const normalized = normalizeBaseResponse(resData);
    
    // Support BaseResponse format
    if (normalized.isBaseResponse) {
      if (!normalized.success) {
        toast.error(normalized.message || 'Operation failed');
        return Promise.reject(new Error(normalized.message || 'Operation failed'));
      }
      
      // If config asks for a success toast
      if (response.config.showSuccessToast && normalized.message) {
        toast.success(normalized.message);
      }

      // Return ONLY the data payload to keep components clean, 
      // matching the previous apiFetch behavior.
      return normalized.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const resData = error.response.data;
      const normalized = normalizeBaseResponse(resData);

      if (error.response.status === 401) {
        useAuthStore.getState().logout();
        toast.error(normalized.message || 'Unauthorized. Please log in again.');
      } else if (error.response.status === 400 && normalized.isBaseResponse && !normalized.success && normalized.data) {
         return Promise.reject({ isValidationError: true, errors: normalized.data, message: normalized.message });
      } else {
         if (normalized.isBaseResponse && normalized.message) {
            toast.error(normalized.message);
         } else if (resData && typeof resData === 'object' && (resData.message || resData.Message || resData.title)) {
            toast.error(resData.message || resData.Message || resData.title);
         } else {
            toast.error('An unexpected server error occurred.');
         }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An error occurred.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
