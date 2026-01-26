
import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/user/signup', { name, email, password });
    return response.data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/user/login', { email, password });
    return response.data;
  },
  googleLogin: async (token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/user/google-login', { token });
    return response.data;
  },
};
