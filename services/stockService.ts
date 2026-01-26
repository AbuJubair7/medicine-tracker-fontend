
import api from './api';
import { Stock, Medicine } from '../types';

export const stockService = {
  getAll: async () => {
    const response = await api.get<Stock[]>('/stock/getAll');
    return response.data;
  },
  getOne: async (id: string | number) => {
    const response = await api.get<Stock>(`/stock/${id}`);
    return response.data;
  },
  create: async (name: string) => {
    const response = await api.post<Stock>('/stock/create', { name });
    return response.data;
  },
  update: async (id: string | number, name: string) => {
    const response = await api.patch<Stock>(`/stock/${id}`, { name });
    return response.data;
  },
  delete: async (id: string | number) => {
    await api.delete(`/stock/${id}`);
  },
  addMedicine: async (stockId: string | number, med: Omit<Medicine, 'id'>) => {
    const response = await api.post<Stock>(`/stock/insertMedicine/${stockId}`, med);
    return response.data;
  },
  editMedicine: async (medId: string | number, med: Partial<Omit<Medicine, 'id'>>) => {
    const response = await api.patch<Medicine>(`/stock/medicine/${medId}`, med);
    return response.data;
  },
  deleteMedicine: async (medId: string | number) => {
    await api.delete(`/stock/medicine/${medId}`);
  },
};
