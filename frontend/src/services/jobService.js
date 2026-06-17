import axiosInstance from '../api/axiosInstance';

const jobService = {
  // Shared APIs
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.location) params.append('location', filters.location);
    if (filters.remoteType) params.append('remoteType', filters.remoteType);
    if (filters.activeOnly !== undefined) params.append('activeOnly', filters.activeOnly);

    const response = await axiosInstance.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  getJobById: async (id) => {
    const response = await axiosInstance.get(`/jobs/${id}`);
    return response.data;
  },

  // Student APIs
  saveJob: async (id) => {
    const response = await axiosInstance.post(`/jobs/${id}/save`);
    return response.data;
  },

  unsaveJob: async (id) => {
    const response = await axiosInstance.delete(`/jobs/${id}/save`);
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await axiosInstance.get('/jobs/saved');
    return response.data;
  },

  applyJob: async (id, data) => {
    const response = await axiosInstance.post(`/jobs/${id}/apply`, data);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await axiosInstance.get('/jobs/my-applications');
    return response.data;
  },

  // Admin APIs
  createJob: async (data) => {
    const response = await axiosInstance.post('/jobs', data);
    return response.data;
  },

  updateJob: async (id, data) => {
    const response = await axiosInstance.put(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await axiosInstance.delete(`/jobs/${id}`);
    return response.data;
  },

  getJobApplications: async (id) => {
    const response = await axiosInstance.get(`/jobs/${id}/applications`);
    return response.data;
  },

  updateApplicationStatus: async (jobId, studentId, status) => {
    const response = await axiosInstance.put(`/jobs/${jobId}/applications/${studentId}/status?status=${status}`);
    return response.data;
  }
};

export default jobService;
