import api from './axios';

/**
 * Badges API
 * Handles student badges and achievements
 */
export const badgesAPI = {
  // Get user's badges
  getBadges: async () => {
    const response = await api.get('/badges');
    return response.data.badges || [];
  },

  // Get badge statistics
  getStats: async () => {
    const response = await api.get('/badges/stats');
    return response.data;
  },

  // Award badge to student
  awardBadge: async (studentId, badgeData) => {
    const response = await api.post('/badges/award', {
      student_id: studentId,
      ...badgeData
    });
    return response.data;
  },

  // Get available badge types
  getBadgeTypes: async () => {
    const response = await api.get('/badges/types');
    return response.data;
  },

  // Check badge eligibility
  checkEligibility: async (studentId, badgeType) => {
    const response = await api.get(`/badges/check/${studentId}/${badgeType}`);
    return response.data;
  }
};
