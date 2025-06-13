import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Emisores
export const emisorService = {
  getAll: () => api.get('/emisores'),
  getById: (id) => api.get(`/emisores/${id}`),
  create: (data) => api.post('/emisores', data),
  update: (id, data) => api.put(`/emisores/${id}`, data),
  delete: (id) => api.delete(`/emisores/${id}`),
};

// Clientes
export const clienteService = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// Productos/Servicios
export const productoServicioService = {
  getAll: () => api.get('/productos-servicios'),
  getById: (id) => api.get(`/productos-servicios/${id}`),
  create: (data) => api.post('/productos-servicios', data),
  update: (id, data) => api.put(`/productos-servicios/${id}`, data),
  delete: (id) => api.delete(`/productos-servicios/${id}`),
};

// Facturas
export const facturaService = {
  getAll: () => api.get('/facturas'),
  getById: (id) => api.get(`/facturas/${id}`),
  create: (data) => api.post('/facturas', data),
  update: (id, data) => api.put(`/facturas/${id}`, data),
  delete: (id) => api.delete(`/facturas/${id}`),
  getPdf: (id) => api.get(`/facturas/${id}/pdf`, { responseType: 'blob' }),
};

export default api;

