import api from './axios';

/**
 * Assessments API
 * Handles assessment creation, submission, and grading
 */
export const assessmentsAPI = {
  // Generate AI assessment
  generateAssessment: async (data) => {
    const response = await api.post('/assessments/generate', data);
    return response.data;
  },

  // Get all assessments (student or teacher view)
  getAssessments: async () => {
    const response = await api.get('/assessments');
    return response.data;
  },

  // Get teacher's assessments
  getTeacherAssessments: async () => {
    const response = await api.get('/assessments/teacher');
    return response.data;
  },

  // Get single assessment by ID
  getAssessment: async (id) => {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },

  // Submit assessment answers
  submitAssessment: async (id, data) => {
    const response = await api.post(`/assessments/${id}/submit`, data);
    return response.data;
  },

  // Grade assessment (AI or manual)
  gradeAssessment: async (id, data) => {
    const response = await api.post(`/assessments/${id}/grade`, data);
    return response.data;
  },

  // Delete assessment
  deleteAssessment: async (id) => {
    const response = await api.delete(`/assessments/${id}`);
    return response.data;
  },

  // Get assessment results
  getAssessmentResults: async (id) => {
    const response = await api.get(`/assessments/${id}/results`);
    return response.data;
  }
};
