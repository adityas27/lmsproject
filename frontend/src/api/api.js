import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('access');
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh');
        const res = await axios.post('http://localhost:8000/api/accounts/token/refresh/', { refresh });
        localStorage.setItem('access', res.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
        originalRequest.headers['Authorization'] = 'Bearer ' + res.data.access;
        return api(originalRequest);
      } catch (refreshError) {
        console.log('Refresh failed. Redirect to login.');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
