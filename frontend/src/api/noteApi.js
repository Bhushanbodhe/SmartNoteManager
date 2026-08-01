import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================
// Notes API
// ========================

export const noteApi = {
  /** Get all active notes */
  getAll: () => api.get('/notes').then(res => res.data),

  /** Get a single note by ID */
  getById: (id) => api.get(`/notes/${id}`).then(res => res.data),

  /** Create a new note */
  create: (note) => api.post('/notes', note).then(res => res.data),

  /** Update a note */
  update: (id, note) => api.put(`/notes/${id}`, note).then(res => res.data),

  /** Delete a note */
  delete: (id) => api.delete(`/notes/${id}`).then(res => res.data),

  /** Search notes by keyword */
  search: (query) => api.get(`/notes/search?q=${encodeURIComponent(query)}`).then(res => res.data),

  /** Get archived notes */
  getArchived: () => api.get('/notes/archived').then(res => res.data),

  /** Toggle pin status */
  togglePin: (id) => api.put(`/notes/${id}/pin`).then(res => res.data),

  /** Toggle archive status */
  toggleArchive: (id) => api.put(`/notes/${id}/archive`).then(res => res.data),

  /** Get all categories */
  getCategories: () => api.get('/notes/categories').then(res => res.data),

  /** Get notes by category */
  getByCategory: (category) => api.get(`/notes/category/${encodeURIComponent(category)}`).then(res => res.data),
};

// ========================
// RAG API
// ========================

export const ragApi = {
  /** Ask the AI assistant a question */
  ask: (question) => api.post('/rag/ask', { question }).then(res => res.data),

  /** Check RAG status */
  getStatus: () => api.get('/rag/status').then(res => res.data),

  /** Trigger re-indexing */
  reindex: () => api.post('/rag/reindex').then(res => res.data),
};

export default api;
