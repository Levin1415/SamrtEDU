import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { scheduleAPI } from '../../api/schedule';
import { toast } from 'react-toastify';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    priority: 'medium'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const priorities = ['low', 'medium', 'high'];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await scheduleAPI.getSchedules();
      setSchedules(data);
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await scheduleAPI.createSchedule(formData);
      toast.success('Schedule created successfully');
      setShowModal(false);
      setFormData({ subject: '', day: 'Monday', startTime: '', endTime: '', priority: 'medium' });
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to create schedule');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this schedule?')) {
      try {
        await scheduleAPI.deleteSchedule(id);
        toast.success('Schedule deleted');
        fetchSchedules();
      } catch (error) {
        toast.error('Failed to delete schedule');
      }
    }
  };

  const generateAISchedule = async () => {
    try {
      setLoading(true);
      await scheduleAPI.generateAISchedule();
      toast.success('AI schedule generated successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to generate AI schedule');
    } finally {
      setLoading(false);
    }
  };

  const groupedSchedules = days.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Weekly Schedule</h1>
          <div className="flex gap-3">
            <button onClick={generateAISchedule} className="btn-secondary flex items-center gap-2">
              <Calendar size={20} />
              Generate AI Schedule
            </button>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Add Schedule
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {days.map(day => (
              <div key={day} className="card">
                <h3 className="text-xl font-semibold mb-3 dark:text-white">{day}</h3>
                {groupedSchedules[day].length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No schedules</p>
                ) : (
                  <div className="space-y-2">
                    {groupedSchedules[day].map(schedule => (
                      <div key={schedule._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpen size={20} className="text-blue-500" />
                          <div>
                            <p className="font-medium dark:text-white">{schedule.subject}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <Clock size={14} />
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            schedule.priority === 'high' ? 'bg-red-100 text-red-700' :
                            schedule.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {schedule.priority}
                          </span>
                          <button onClick={() => handleDelete(schedule._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Add Schedule</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="input"
                  >
                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="input"
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">Create</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
