import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, ClipboardCheck, Award, Clock } from 'lucide-react';
import { badgesAPI } from '../../api/badges';
import { scheduleAPI } from '../../api/schedule';
import { assessmentsAPI } from '../../api/assessments';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    assessmentsTaken: 0,
    badgesEarned: 0,
    studyHours: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [badgesData, scheduleData, assessmentsData] = await Promise.all([
        badgesAPI.getBadges(),
        scheduleAPI.getSchedules(),
        assessmentsAPI.getAssessments(),
      ]);

      setStats({
        lessonsCompleted: 12,
        assessmentsTaken: assessmentsData.length,
        badgesEarned: badgesData.total || 0,
        studyHours: 24,
      });

      setWeeklyData([
        { day: 'Mon', hours: 3 },
        { day: 'Tue', hours: 4 },
        { day: 'Wed', hours: 2 },
        { day: 'Thu', hours: 5 },
        { day: 'Fri', hours: 3 },
        { day: 'Sat', hours: 4 },
        { day: 'Sun', hours: 3 },
      ]);

      if (scheduleData.blocks) {
        setUpcomingSchedule(scheduleData.blocks.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BookOpen}
            title="Lessons Completed"
            value={stats.lessonsCompleted}
            color="primary"
          />
          <StatCard
            icon={ClipboardCheck}
            title="Assessments Taken"
            value={stats.assessmentsTaken}
            color="accent"
          />
          <StatCard
            icon={Award}
            title="Badges Earned"
            value={stats.badgesEarned}
            color="warning"
          />
          <StatCard
            icon={Clock}
            title="Study Hours This Week"
            value={stats.studyHours}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Weekly Study Progress
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Upcoming Schedule
            </h3>
            <div className="space-y-3">
              {upcomingSchedule.length > 0 ? (
                upcomingSchedule.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.subject}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.topic}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.start_time}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No upcoming schedule. Create your study plan!
                </p>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/student/ai-chat'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
            >
              <p className="font-semibold">Start AI Chat</p>
              <p className="text-sm opacity-90">Get instant help</p>
            </button>
            <button
              onClick={() => window.location.href = '/student/assessments'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
            >
              <p className="font-semibold">Take Assessment</p>
              <p className="text-sm opacity-90">Test your knowledge</p>
            </button>
            <button
              onClick={() => window.location.href = '/student/schedule'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
            >
              <p className="font-semibold">View Timetable</p>
              <p className="text-sm opacity-90">Manage your time</p>
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
