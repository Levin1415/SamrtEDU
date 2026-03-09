import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, Sparkles } from 'lucide-react';
import Layout from '../../components/Layout';
import { assessmentsAPI } from '../../api/assessments';
import { toast } from 'react-toastify';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    topic: '',
    difficulty: 'medium',
    questionCount: 10,
    questionTypes: 'mixed',
    duration: 60,
    dueDate: ''
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentsAPI.getTeacherAssessments();
      setAssessments(data);
    } catch (error) {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const generateAssessment = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await assessmentsAPI.generateAssessment(formData);
      toast.success('Assessment generated successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        subject: '',
        topic: '',
        difficulty: 'medium',
        questionCount: 10,
        questionTypes: 'mixed',
        duration: 60,
        dueDate: ''
      });
      fetchAssessments();
    } catch (error) {
      toast.error('Failed to generate assessment');
    } finally {
      setGenerating(false);
    }
  };

  const deleteAssessment = async (id) => {
    if (window.confirm('Delete this assessment? All student submissions will be lost.')) {
      try {
        await assessmentsAPI.deleteAssessment(id);
        toast.success('Assessment deleted');
        fetchAssessments();
      } catch (error) {
        toast.error('Failed to delete assessment');
      }
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Assessments</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Create Assessment
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : assessments.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No assessments yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map(assessment => (
              <div key={assessment._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <FileText size={32} className="text-blue-500" />
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <Eye size={20} />
                    </button>
                    <button onClick={() => deleteAssessment(assessment._id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{assessment.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{assessment.subject}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                    <span className="font-medium dark:text-white">{assessment.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-medium dark:text-white">{assessment.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium dark:text-white">{new Date(assessment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Submissions:</span>
                    <span className="font-medium dark:text-white">{assessment.submissions || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
                <Sparkles className="text-yellow-500" />
                Generate AI Assessment
              </h2>
              <form onSubmit={generateAssessment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="input"
                    required
                    placeholder="e.g., Chapter 5 Quiz"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="input"
                      required
                      placeholder="e.g., Physics"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Topic</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      className="input"
                      required
                      placeholder="e.g., Newton's Laws"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="input"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Questions</label>
                    <input
                      type="number"
                      value={formData.questionCount}
                      onChange={(e) => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                      className="input"
                      required
                      min="5"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
                    <select
                      value={formData.questionTypes}
                      onChange={(e) => setFormData({...formData, questionTypes: e.target.value})}
                      className="input"
                    >
                      <option value="mixed">Mixed</option>
                      <option value="mcq">Multiple Choice</option>
                      <option value="short">Short Answer</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Duration (min)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="input"
                      required
                      min="15"
                      max="180"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={generating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Sparkles size={18} />
                    {generating ? 'Generating...' : 'Generate with AI'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Assessments;
