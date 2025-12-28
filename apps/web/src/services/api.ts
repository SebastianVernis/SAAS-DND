import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  
  verifyOtp: (data: { email: string; code: string }) =>
    api.post('/auth/verify-otp', data),
  
  resendOtp: (data: { email: string }) =>
    api.post('/auth/resend-otp', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getSession: () =>
    api.get('/auth/session'),
};

// Onboarding API
export const onboardingApi = {
  complete: (data: Record<string, unknown>) =>
    api.post('/onboarding/complete', data),
  
  getStatus: () =>
    api.get('/onboarding/status'),
};

// Team API
export const teamApi = {
  getMembers: () =>
    api.get('/team/members'),
  
  invite: (data: { email: string; role: string; message?: string }) =>
    api.post('/team/invite', data),
  
  acceptInvite: (data: { token: string }) =>
    api.post('/team/accept-invite', data),
  
  updateRole: (memberId: string, role: string) =>
    api.patch(`/team/members/${memberId}`, { role }),
  
  removeMember: (memberId: string) =>
    api.delete(`/team/members/${memberId}`),
  
  getInvitations: () =>
    api.get('/team/invitations'),
  
  revokeInvitation: (invitationId: string) =>
    api.delete(`/team/invitations/${invitationId}`),
};

// Projects API
export const projectsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/projects', { params }),
  
  create: (data: { name: string; description?: string; template?: string }) =>
    api.post('/projects', data),
  
  getById: (projectId: string) =>
    api.get(`/projects/${projectId}`),
  
  update: (projectId: string, data: Record<string, unknown>) =>
    api.put(`/projects/${projectId}`, data),
  
  delete: (projectId: string) =>
    api.delete(`/projects/${projectId}`),
  
  duplicate: (projectId: string) =>
    api.post(`/projects/${projectId}/duplicate`),
};

export default api;
