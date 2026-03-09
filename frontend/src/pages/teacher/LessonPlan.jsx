import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Download, Sparkles } from 'lucide-react';
import Layout from '../../components/Layout';
import { lessonsAPI } from '../../api/lessons';
import { toast } from 'react-toastify';
import { exportToPDF } from '../../utils/exportToPDF';

const LessonPlan = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    grade: '',
    duration: 60,
    objectives: ''
  });

  useEffect(() => {
    fetchLessonPlans();
  }, []);

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      const data = await lessonsAPI.getLessonPlans();
      setLessonPlans(data);
    } catch (error) {
      toast.error('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const generateLessonPlan = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const data = await lessonsAPI.generateLessonPlan(formData);
      toast.success('Lesson plan generated successfully!');
      setShowModal(false);
      setFormData({ subject: '', topic: '', grade: '', duration: 60, objectives: '' });
      fetchLessonPlans();
    } catch (error) {
      toast.error('Failed to generate lesson plan');
    } finally {
      setGenerating(false);
    }
  };

  const deleteLessonPlan = async (id) => {
    if (window.confirm('Delete this lesson plan?')) {
      try {
        await lessonsAPI.deleteLessonPlan(id);
        toast.success('Lesson plan deleted');
        fetchLessonPlans();
      } catch (error) {
        toast.error('Failed to delete lesson plan');
      }
    }
  };

  const handleExport = (lessonPlan) => {
    exportToPDF(lessonPlan, `lesson-plan-${lessonPlan.subject}-${lessonPlan.topic}`);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Lesson Plans</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Generate Lesson Plan
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : lessonPlans.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No lesson plans yet. Generate your first one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {lessonPlans.map(plan => (
              <div key={plan._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen size={32} className="text-blue-500" />
                    <div>
                      <h3 className="text-xl font-semibold dark:text-white">{plan.subject}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{plan.topic}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleExport(plan)} className="text-blue-500 hover:text-blue-700">
                      <Download size={20} />
                    </button>
                    <button onClick={() => deleteLessonPlan(plan._id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Grade:</span>
                    <span className="font-medium dark:text-white">{plan.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-medium dark:text-white">{plan.duration} min</span>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Objectives:</p>
                    <p className="text-gray-800 dark:text-gray-200">{plan.objectives}</p>
                  </div>
                  {plan.content && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Content:</p>
                      <p className="text-gray-800 dark:text-gray-200 line-clamp-3">{plan.content}</p>
                    </div>
                  )}
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
                Generate AI Lesson Plan
              </h2>
              <form onSubmit={generateLessonPlan} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="input"
                      required
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Grade</label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="input"
                      required
                      placeholder="e.g., Grade 10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="input"
                    required
                    placeholder="e.g., Quadratic Equations"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Duration (minutes)</label>
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
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Learning Objectives</label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                    className="input min-h-[100px]"
                    required
                    placeholder="What should students learn from this lesson?"
                    rows={4}
                  />
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

export default LessonPlan;
