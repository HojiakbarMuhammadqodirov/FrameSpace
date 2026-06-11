import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('fs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fs_token')
      localStorage.removeItem('fs_user')
      localStorage.removeItem('framespace-store')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
}

// User
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: object) => api.put('/user/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/user/password', data),
}

// Rooms
export const roomsApi = {
  getAll: () => api.get('/rooms'),
  getById: (id: string) => api.get(`/rooms/${id}`),
  create: (data: object) => api.post('/rooms', data),
  update: (id: string, data: object) => api.put(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
  generate: (description: string) => api.post('/rooms/generate', { description }),
}

// Templates
export const templatesApi = {
  getAll: () => api.get('/templates'),
}

// Furniture
export const furnitureApi = {
  getAll: (params?: object) => api.get('/furniture', { params }),
  getById: (id: string) => api.get(`/furniture/${id}`),
  getCategories: () => api.get('/furniture/categories'),
  recommend: (data: { room: object; preferences?: object }) =>
    api.post('/furniture/recommend', data),
}

// Designs
export const designsApi = {
  getAll: () => api.get('/designs'),
  getById: (id: string) => api.get(`/designs/${id}`),
  create: (data: object) => api.post('/designs', data),
  update: (id: string, data: object) => api.put(`/designs/${id}`, data),
  delete: (id: string) => api.delete(`/designs/${id}`),
  share: (id: string) => api.post(`/designs/${id}/share`),
  getShared: (token: string) => api.get(`/designs/shared/${token}`),
  getGallery: (page = 1) => api.get(`/designs/gallery?page=${page}&limit=20`),
  getVersions: (id: string) => api.get(`/designs/${id}/versions`),
  getVersion: (id: string, vId: string) => api.get(`/designs/${id}/versions/${vId}`),
}

export default api
