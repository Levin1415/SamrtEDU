import api from './axios';

/**
 * Analytics API
 * Handles student and teacher analytics data
 */
export const analyticsAPI = {
  // Student analytics
  getStudentAnalytics: async () => {
    const response = await api.get('/analytics/student');
    return response.data;
  },

  // Teacher analytics
  getTeacherAnalytics: async () => {
    const response = await api.get('/analytics/teacher');
    return response.data;
  },

  // Teacher dashboard data
  getTeacherDashboard: async () => {
    const response = await api.get('/analytics/teacher/dashboard');
    return response.data;
  },

  // Class performance metrics
  getClassPerformance: async (classId) => {
    const response = await api.get(`/analytics/class/${classId}`);
    return response.data;
  },

  // Student progress over time
  getStudentProgress: async (studentId, timeRange = '30d') => {
    const response = await api.get(`/analytics/student/${studentId}/progress`, {
      params: { timeRange }
    });
    return response.data;
  }
};
