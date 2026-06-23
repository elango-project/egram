import axiosInstance from '../api/axiosInstance';

const courseService = {
  // Student APIs
  getCourses: async () => {
    const response = await axiosInstance.get('/courses');
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await axiosInstance.get(`/courses/${id}`);
    return response.data;
  },

  getTopic: async (id) => {
    const response = await axiosInstance.get(`/courses/topics/${id}`);
    return response.data;
  },

  enrollCourse: async (id) => {
    const response = await axiosInstance.post(`/courses/${id}/enroll`);
    return response.data;
  },

  updateProgress: async (id, completedModulesCount) => {
    const response = await axiosInstance.put(`/courses/${id}/progress`, { completedModulesCount });
    return response.data;
  },

  // Admin APIs
  createCourse: async (data) => {
    const response = await axiosInstance.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id, data) => {
    const response = await axiosInstance.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await axiosInstance.delete(`/courses/${id}`);
    return response.data;
  },

  addModule: async (courseId, data) => {
    const response = await axiosInstance.post(`/courses/${courseId}/modules`, data);
    return response.data;
  },

  deleteModule: async (courseId, moduleId) => {
    const response = await axiosInstance.delete(`/courses/modules/${moduleId}`);
    return response.data;
  },

  addTopic: async (moduleId, data) => {
    const response = await axiosInstance.post(`/courses/modules/${moduleId}/topics`, data);
    return response.data;
  },

  deleteTopic: async (topicId) => {
    const response = await axiosInstance.delete(`/courses/topics/${topicId}`);
    return response.data;
  },

  addTopicReel: async (topicId, data) => {
    const response = await axiosInstance.post(`/courses/topics/${topicId}/reels`, data);
    return response.data;
  },

  deleteTopicReel: async (topicId, reelId) => {
    const response = await axiosInstance.delete(`/courses/topics/${topicId}/reels/${reelId}`);
    return response.data;
  }
};

export default courseService;
