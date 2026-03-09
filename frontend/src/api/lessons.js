import api from './axios';

/**
 * Lessons API
 * Handles lesson plan generation and management
 */
export const lessonsAPI = {
  // Get all lesson plans
  getLessonPlans: async () => {
    const response = await api.get('/lessons');
    return response.data;
  },

  // Get single lesson plan
  getLessonPlan: async (id) => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  // Generate full lesson plan with AI
  generateLessonPlan: async (data) => {
    const response = await api.post('/lessons/generate', data);
    return response.data;
  },

  // Generate instant lesson (quick version)
  generateInstantLesson: async (prompt) => {
    const response = await api.post('/lessons/generate-instant', { prompt });
    return response.data;
  },

  // Save lesson plan
  saveLessonPlan: async (data) => {
    const response = await api.post('/lessons', data);
    return response.data;
  },

  // Update lesson plan
  updateLessonPlan: async (id, data) => {
    const response = await api.put(`/lessons/${id}`, data);
    return response.data;
  },

  // Delete lesson plan
  deleteLessonPlan: async (id) => {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },

  // Share lesson plan
  shareLessonPlan: async (id, recipients) => {
    const response = await api.post(`/lessons/${id}/share`, { recipients });
    return response.data;
  }
};
