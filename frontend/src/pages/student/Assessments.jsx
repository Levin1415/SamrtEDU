import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Play } from 'lucide-react';
import Layout from '../../components/Layout';
import { assessmentsAPI } from '../../api/assessments';
import { toast } from 'react-toastify';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const data = await assessmentsAPI.getAssessments();
      setAssessments(data);
    } catch (error) {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assessment) => {
    if (assessment.submitted) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
          <CheckCircle size={16} />
          Completed
        </span>
      );
    }
    if (new Date(assessment.dueDate) < new Date()) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
          <XCircle size={16} />
          Overdue
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
        <Clock size={16} />
        Pending
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Assessments</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : assessments.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No assessments available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map(assessment => (
              <div key={assessment._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <FileText size={32} className="text-blue-500" />
                  {getStatusBadge(assessment)}
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{assessment.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{assessment.subject}</p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{assessment.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{assessment.duration || 60} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-medium">{new Date(assessment.dueDate).toLocaleDateString()}</span>
                  </div>
                  {assessment.score !== undefined && (
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className="font-bold text-blue-600">{assessment.score}%</span>
                    </div>
                  )}
                </div>
                {!assessment.submitted && (
                  <button
                    onClick={() => navigate(`/student/assessments/${assessment._id}`)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    Start Assessment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Assessments;
