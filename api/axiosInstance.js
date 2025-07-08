import axios from 'axios';

const api = axios.create({
    baseURL: 'https://attendance.2-min.in',
    timeout: 10000,
    // headers: {
    //     'Content-Type': 'application/json'
    // }

});

// Request interceptor to add basic auth
api.interceptors.request.use(
    (config) => {
        // Add basic auth credentials
        const username = 'attendance';
        const password =  '20$tgbsv09u';    
        const basicAuth = `Basic ${btoa(`${username}:${password}`)}`;

        config.headers.Authorization = basicAuth;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url
        });

        return Promise.reject(error);
    }
);

export default api;