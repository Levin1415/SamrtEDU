import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Award, Target } from 'lucide-react';
import Layout from '../../components/Layout';
import { analyticsAPI } from '../../api/analytics';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await analyticsAPI.getStudentAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center py-12">Loading analytics...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">My Analytics</h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <Clock size={32} className="mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold dark:text-white">{analytics?.totalStudyHours || 0}</p>
            <p className="text-gray-600 dark:text-gray-400">Study Hours</p>
          </div>
          <div className="card text-center">
            <Target size={32} className="mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold dark:text-white">{analytics?.completedAssessments || 0}</p>
            <p className="text-gray-600 dark:text-gray-400">Assessments</p>
          </div>
          <div className="card text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-orange-500" />
            <p className="text-3xl font-bold dark:text-white">{analytics?.averageScore || 0}%</p>
            <p className="text-gray-600 dark:text-gray-400">Avg Score</p>
          </div>
          <div className="card text-center">
            <Award size={32} className="mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-bold dark:text-white">{analytics?.totalBadges || 0}</p>
            <p className="text-gray-600 dark:text-gray-400">Badges Earned</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Assessment Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.scoreHistory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Study Hours by Subject</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.studyHoursBySubject || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Performance by Subject</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.performanceBySubject || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analytics?.performanceBySubject || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
