import api from './axios';

/**
 * Timetable API
 * Handles class timetables and scheduling
 */
export const timetableAPI = {
  // Get user's timetables
  getTimetables: async () => {
    const response = await api.get('/timetable');
    return response.data.slots || [];
  },

  // Get teacher's timetables
  getTeacherTimetables: async () => {
    const response = await api.get('/timetable/teacher');
    return response.data.slots || [];
  },

  // Get single timetable entry
  getTimetable: async (id) => {
    const response = await api.get(`/timetable/${id}`);
    return response.data;
  },

  // Create timetable entry
  createTimetable: async (data) => {
    const response = await api.post('/timetable', data);
    return response.data;
  },

  // Update timetable entry
  updateTimetable: async (id, data) => {
    const response = await api.put(`/timetable/${id}`, data);
    return response.data;
  },

  // Delete timetable entry
  deleteTimetable: async (id) => {
    const response = await api.delete(`/timetable/${id}`);
    return response.data;
  },

  // Check for scheduling conflicts
  checkConflicts: async (data) => {
    const response = await api.post('/timetable/check-conflicts', data);
    return response.data;
  },

  // Get timetable by day
  getTimetableByDay: async (day) => {
    const response = await api.get('/timetable/day', {
      params: { day }
    });
    return response.data;
  }
};
