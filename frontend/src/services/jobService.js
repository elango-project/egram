import axiosInstance from '../api/axiosInstance';

const jobService = {
  // Student APIs
  getJobs: async () => {
    const response = await axiosInstance.get('/jobs');
    return response.data;
  },

  getJobById: async (id) => {
    const response = await axiosInstance.get(`/jobs/${id}`);
    return response.data;
  },

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

  applyJob: async (id) => {
    const response = await axiosInstance.post(`/jobs/${id}/apply`);
    return response.data;
  },

  getAppliedJobs: async () => {
    const response = await axiosInstance.get('/jobs/applied');
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
  }
};

export default jobService;
