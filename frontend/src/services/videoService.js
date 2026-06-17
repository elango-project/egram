import axiosInstance from '../api/axiosInstance';

const videoService = {
  getVideos: async () => {
    const response = await axiosInstance.get('/videos');
    return response.data;
  },

  getVideoById: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}`);
    return response.data;
  },

  uploadVideo: async (data) => {
    const response = await axiosInstance.post('/videos', data);
    return response.data;
  },

  deleteVideo: async (id) => {
    const response = await axiosInstance.delete(`/videos/${id}`);
    return response.data;
  },

  likeVideo: async (id) => {
    const response = await axiosInstance.post(`/videos/${id}/like`);
    return response.data;
  },

  unlikeVideo: async (id) => {
    const response = await axiosInstance.delete(`/videos/${id}/like`);
    return response.data;
  },

  saveVideo: async (id) => {
    const response = await axiosInstance.post(`/videos/${id}/save`);
    return response.data;
  },

  unsaveVideo: async (id) => {
    const response = await axiosInstance.delete(`/videos/${id}/save`);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await axiosInstance.post(`/videos/${id}/comments`, { comment });
    return response.data;
  },

  getComments: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}/comments`);
    return response.data;
  }
};

export default videoService;
