import axios from 'axios'

const envUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('egram_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-handle 401 – clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('egram_token')
      localStorage.removeItem('egram_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refresh: (token) => api.post('/auth/refresh', null, { headers: { 'X-Refresh-Token': token } }),
}

// ─── User ───────────────────────────────────────────────
export const userApi = {
  me: () => api.get('/users/me'),
  stats: () => api.get('/users/me/stats'),
  update: (data) => api.put('/users/me', data),
  getById: (id) => api.get(`/users/${id}`),
}

// ─── Courses ────────────────────────────────────────────
export const courseApi = {
  list: (params) => api.get('/courses', { params }),
  get: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
}

// ─── Reels ──────────────────────────────────────────────
export const reelApi = {
  feed: (params) => api.get('/reels', { params }),
  get: (id) => api.get(`/reels/${id}`),
  quiz: (id) => api.get(`/reels/${id}/quiz`),
}

// ─── Internships & Jobs ─────────────────────────────────
export const internshipApi = {
  list: (params) => api.get('/internships', { params }),
  get: (id) => api.get(`/internships/${id}`),
  apply: (id, data) => api.post(`/internships/${id}/apply`, data),
  match: (data) => api.post('/match/internships', data),
}
export const jobApi = {
  list: (params) => api.get('/jobs', { params }),
  apply: (id) => api.post(`/jobs/${id}/apply`),
}

// ─── Events ─────────────────────────────────────────────
export const eventApi = {
  list: (params) => api.get('/events', { params }),
  get: (id) => api.get(`/events/${id}`),
  register: (id) => api.post(`/events/register/${id}`),
}

// ─── Mentors ────────────────────────────────────────────
export const mentorApi = {
  list: (params) => api.get('/mentors', { params }),
  get: (id) => api.get(`/mentors/${id}`),
  book: (id, data) => api.post(`/mentors/${id}/book`, data),
  review: (id, data) => api.post(`/mentors/${id}/reviews`, data),
}

// ─── AI ─────────────────────────────────────────────────
export const aiApi = {
  mentor: (data) => api.post('/ai/mentor', data),
  mockInterview: (params) => api.post('/ai/mentor/mock-interview', null, { params }),
  videoSummary: (data) => api.post('/ai/video/summary', data),
  videoQna: (data) => api.post('/ai/video/qna', data),
  resume: (data) => api.post('/ai/resume', data),
  skillPassport: () => api.get('/ai/hub/skill-passport'),
  analytics: () => api.get('/ai/hub/analytics'),
}

// ─── Projects ────────────────────────────────────────────
export const projectApi = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),
}

// ─── Creator Verification ────────────────────────────────
export const creatorApi = {
  apply: (data) => api.post('/creators/apply', data),
  status: (userId) => api.get(`/creators/status/${userId}`),
  review: (userId, approve, reason) =>
    api.post(`/creators/review/${userId}`, null, { params: { approve, rejectionReason: reason } }),
}
