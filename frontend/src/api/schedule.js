import api from './axios';

/**
 * Schedule API
 * Handles student schedules and AI-powered planning
 */
export const scheduleAPI = {
  // Get user's schedules
  getSchedules: async () => {
    const response = await api.get('/schedule');
    return response.data;
  },

  // Get single schedule
  getSchedule: async (id) => {
    const response = await api.get(`/schedule/${id}`);
    return response.data;
  },

  // Create new schedule
  createSchedule: async (data) => {
    const response = await api.post('/schedule', data);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (id, data) => {
    const response = await api.put(`/schedule/${id}`, data);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (id) => {
    const response = await api.delete(`/schedule/${id}`);
    return response.data;
  },

  // Generate AI-optimized schedule
  generateAISchedule: async (data) => {
    const response = await api.post('/schedule/ai-generate', data);
    return response.data;
  },

  // Get daily plan
  getDailyPlan: async (date) => {
    const response = await api.get('/schedule/daily', {
      params: { date }
    });
    return response.data;
  },

  // Generate daily plan with AI
  generateDailyPlan: async (data) => {
    const response = await api.post('/schedule/daily-plan', data);
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/schedule/task/${taskId}`, { status });
    return response.data;
  }
};
