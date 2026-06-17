import axiosInstance from '../api/axiosInstance';

const realService = {
  getReals: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(`/reals?page=${page}&size=${size}`);
    return response.data;
  },

  getRealById: async (id) => {
    const response = await axiosInstance.get(`/reals/${id}`);
    return response.data;
  },

  recordView: async (id) => {
    const response = await axiosInstance.post(`/reals/${id}/view`);
    return response.data;
  },

  uploadReal: async (data) => {
    const response = await axiosInstance.post('/reals', data);
    return response.data;
  },

  deleteReal: async (id) => {
    const response = await axiosInstance.delete(`/reals/${id}`);
    return response.data;
  },

  likeReal: async (id) => {
    const response = await axiosInstance.post(`/reals/${id}/like`);
    return response.data;
  },

  unlikeReal: async (id) => {
    const response = await axiosInstance.delete(`/reals/${id}/like`);
    return response.data;
  },

  saveReal: async (id) => {
    const response = await axiosInstance.post(`/reals/${id}/save`);
    return response.data;
  },

  unsaveReal: async (id) => {
    const response = await axiosInstance.delete(`/reals/${id}/save`);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await axiosInstance.post(`/reals/${id}/comments`, { comment });
    return response.data;
  },

  getComments: async (id) => {
    const response = await axiosInstance.get(`/reals/${id}/comments`);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await axiosInstance.delete(`/reals/comments/${commentId}`);
    return response.data;
  }
};

export default realService;
