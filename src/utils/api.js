import axios from 'axios';
import mockData from './mockData';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'AIzaSys-EventCheckInApp-2026-Sundar'
    }
});

// Interceptor to add Admin Token if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle Offline/Mock mode
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If server is down (ECONNREFUSED) or we specifically want dummy data
        if (!error.response) {
            console.warn('⚠️ Server Unreachable. Entering Mock Mode with Dummy Data.');
            const url = error.config.url;

            if (url.includes('/auth/login')) {
                return Promise.resolve({ 
                    data: {
                        success: true,
                        admin: { id: 1, userId: 'sundar', fullName: 'Sundar Admin', role: 'admin' },
                        token: 'mock-jwt-token-sundar'
                    }
                });
            }

            if (url.includes('/users/login-attendee') || url.includes('/users/checkin')) {
                return Promise.resolve({
                    data: {
                        success: true,
                        user: mockData.users[0]
                    }
                });
            }

            let result = { success: true, data: [] };

            if (url.includes('/events')) {
                const id = url.split('/').pop();
                if (!isNaN(id)) result.data = mockData.events.find(e => e.id == id) || mockData.events[0];
                else result.data = mockData.events;
            } else if (url.includes('/speakers')) {
                result.data = mockData.speakers;
            } else if (url.includes('/registrations')) {
                result.data = mockData.registrations;
            } else if (url.includes('/analytics/overview')) {
                result.data = mockData.analytics;
            } else if (url.includes('/cms')) {
                result.data = mockData.cms;
            } else if (url.includes('/templates/default')) {
                result.data = mockData.templates.default;
            } else if (url.includes('/registration-fields')) {
                result.data = [
                    { id: 1, label: 'T-Shirt Size', field_type: 'dropdown', is_required: 1, field_options: '["S", "M", "L", "XL"]' },
                    { id: 2, label: 'Company Name', field_type: 'text', is_required: 0, field_options: '[]' }
                ];
            }

            return Promise.resolve({ data: result });
        }
        return Promise.reject(error);
    }
);

export default api;

