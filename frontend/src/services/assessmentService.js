import axiosInstance from '../api/axiosInstance';

const assessmentService = {
  // Student APIs
  getAssessments: async () => {
    const response = await axiosInstance.get('/assessments');
    return response.data;
  },

  getAssessmentQuestions: async (id) => {
    const response = await axiosInstance.get(`/assessments/${id}/questions`);
    return response.data;
  },

  submitAssessment: async (id, answers) => {
    const response = await axiosInstance.post(`/assessments/${id}/submit`, { answers });
    return response.data;
  },

  getAssessmentResult: async (id) => {
    const response = await axiosInstance.get(`/assessments/${id}/result`);
    return response.data;
  },

  // Admin APIs
  createAssessment: async (data) => {
    const response = await axiosInstance.post('/assessments', data);
    return response.data;
  },

  updateAssessment: async (id, data) => {
    const response = await axiosInstance.put(`/assessments/${id}`, data);
    return response.data;
  },

  deleteAssessment: async (id) => {
    const response = await axiosInstance.delete(`/assessments/${id}`);
    return response.data;
  },

  addQuestion: async (assessmentId, data) => {
    const response = await axiosInstance.post(`/assessments/${assessmentId}/questions`, data);
    return response.data;
  },

  deleteQuestion: async (questionId) => {
    // Assuming the backend endpoint is DELETE /api/assessments/questions/{questionId}
    // OR DELETE /api/assessments/{assessmentId}/questions/{questionId} based on implementation.
    // Based on previous patterns, the exact URL might be:
    const response = await axiosInstance.delete(`/assessments/questions/${questionId}`);
    return response.data;
  }
};

export default assessmentService;
