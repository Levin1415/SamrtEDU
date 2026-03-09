import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, TrendingUp, Award } from 'lucide-react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { analyticsAPI } from '../../api/analytics';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await analyticsAPI.getTeacherDashboard();
      setStats(data.stats);
      setTopStudents(data.topStudents || []);
      setRecentActivity(data.recentActivity || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center py-12">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Teacher Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={<Users size={24} />}
            color="blue"
          />
          <StatCard
            title="Active Assessments"
            value={stats?.activeAssessments || 0}
            icon={<FileText size={24} />}
            color="green"
          />
          <StatCard
            title="Lesson Plans"
            value={stats?.lessonPlans || 0}
            icon={<Calendar size={24} />}
            color="orange"
          />
          <StatCard
            title="Avg Class Score"
            value={`${stats?.averageScore || 0}%`}
            icon={<TrendingUp size={24} />}
            color="purple"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
              <Award className="text-yellow-500" />
              Top Performing Students
            </h3>
            {topStudents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No student data available</p>
            ) : (
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{student.averageScore}%</p>
                      <p className="text-xs text-gray-500">{student.completedAssessments} assessments</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="dark:text-white">{activity.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
