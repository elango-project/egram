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

  getQuiz: async (topicId) => {
    const response = await axiosInstance.get(`/courses/topics/${topicId}/quiz`);
    return response.data;
  },

  createOrUpdateQuiz: async (topicId, data) => {
    const response = await axiosInstance.post(`/courses/topics/${topicId}/quiz`, data);
    return response.data;
  },

  submitQuiz: async (topicId, data) => {
    const response = await axiosInstance.post(`/courses/topics/${topicId}/quiz/submit`, data);
    return response.data;
  },

  getTopicProgress: async (topicId) => {
    const response = await axiosInstance.get(`/courses/topics/${topicId}/progress`);
    return response.data;
  },

  updateReelProgress: async (topicId, data) => {
    const response = await axiosInstance.post(`/courses/topics/${topicId}/progress/reel`, data);
    return response.data;
  },

  updateVideoProgress: async (topicId, data) => {
    const response = await axiosInstance.post(`/courses/topics/${topicId}/progress/video`, data);
    return response.data;
  },

  getCertificateEligibility: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/certificate-eligibility`);
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
  },

  reorderTopicReels: async (topicId, reelIds) => {
    const response = await axiosInstance.put(`/courses/topics/${topicId}/reels/reorder`, reelIds);
    return response.data;
  },

  addTopicVideo: async (topicId, data) => {
    const response = await axiosInstance.post(`/courses/topics/${topicId}/videos`, data);
    return response.data;
  },

  deleteTopicVideo: async (topicId, videoId) => {
    const response = await axiosInstance.delete(`/courses/topics/${topicId}/videos/${videoId}`);
    return response.data;
  },

  reorderTopicVideos: async (topicId, videoIds) => {
    const response = await axiosInstance.put(`/courses/topics/${topicId}/videos/reorder`, videoIds);
    return response.data;
  },

  // Content Search APIs
  searchReals: async (query) => {
    const response = await axiosInstance.get(`/reals/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  searchVideos: async (query) => {
    const response = await axiosInstance.get(`/videos/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Assessment & Certificate APIs
  getAssessment: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/assessment`);
    return response.data;
  },

  createAssessment: async (courseId, data) => {
    const response = await axiosInstance.post(`/courses/${courseId}/assessment`, data);
    return response.data;
  },

  updateAssessment: async (courseId, data) => {
    const response = await axiosInstance.put(`/courses/${courseId}/assessment`, data);
    return response.data;
  },

  deleteAssessment: async (courseId) => {
    const response = await axiosInstance.delete(`/courses/${courseId}/assessment`);
    return response.data;
  },

  getAssessmentQuestions: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/assessment/questions`);
    return response.data;
  },

  submitAssessment: async (courseId, data) => {
    const response = await axiosInstance.post(`/courses/${courseId}/assessment/submit`, data);
    return response.data;
  },

  getAssessmentAttempts: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/assessment/attempts`);
    return response.data;
  },

  verifyCertificate: async (code) => {
    const response = await axiosInstance.get(`/certificates/verify/${code}`);
    return response.data;
  },

  getCertificate: async (id) => {
    const response = await axiosInstance.get(`/certificates/${id}`);
    return response.data;
  },

  getMyCertificates: async () => {
    const response = await axiosInstance.get('/certificates/my-certificates');
    return response.data;
  }
};

export default courseService;
