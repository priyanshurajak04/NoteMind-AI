// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data)     => API.post('/auth/register', data);
export const loginUser    = (data)     => API.post('/auth/login', data);
export const uploadNote   = (formData) => API.post('/notes/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const processNote  = (id)       => API.post(`/notes/process/${id}`);
export const chatWithNote = (id, data) => API.post(`/notes/chat/${id}`, data);
export const getNotes     = ()         => API.get('/notes');
export const getNoteById  = (id)       => API.get(`/notes/${id}`);
export const deleteNote   = (id)       => API.delete(`/notes/${id}`);