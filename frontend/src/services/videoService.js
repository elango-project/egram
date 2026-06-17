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
  },

  deleteComment: async (commentId) => {
    const response = await axiosInstance.delete(`/videos/comments/${commentId}`);
    return response.data;
  },

  getAnalytics: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}/analytics`);
    return response.data;
  },

  getFeedPage: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(`/videos?page=${page}&size=${size}`);
    return response.data;
  },

  getContinueWatching: async () => {
    const response = await axiosInstance.get('/videos/continue-watching');
    return response.data;
  },

  getRecommendations: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}/recommendations`);
    return response.data;
  },

  recordView: async (id) => {
    const response = await axiosInstance.post(`/videos/${id}/view`);
    return response.data;
  },

  updateProgress: async (id, currentPositionSeconds, percentageWatched) => {
    const response = await axiosInstance.post(`/videos/${id}/progress`, {
      currentPositionSeconds,
      percentageWatched
    });
    return response.data;
  },

  getProgress: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}/progress`);
    return response.data;
  }
};

export default videoService;
