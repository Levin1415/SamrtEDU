import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { timetableAPI } from '../../api/timetable';
import { toast } from 'react-toastify';

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    teacher: '',
    room: '',
    class: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const data = await timetableAPI.getTeacherTimetables();
      setTimetables(data);
    } catch (error) {
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await timetableAPI.createTimetable(formData);
      toast.success('Timetable entry created');
      setShowModal(false);
      setFormData({
        subject: '',
        day: 'Monday',
        startTime: '',
        endTime: '',
        teacher: '',
        room: '',
        class: ''
      });
      fetchTimetables();
    } catch (error) {
      toast.error('Failed to create timetable entry');
    }
  };

  const deleteTimetable = async (id) => {
    if (window.confirm('Delete this timetable entry?')) {
      try {
        await timetableAPI.deleteTimetable(id);
        toast.success('Timetable entry deleted');
        fetchTimetables();
      } catch (error) {
        toast.error('Failed to delete timetable entry');
      }
    }
  };

  const groupedTimetables = days.reduce((acc, day) => {
    acc[day] = timetables.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Timetable Management</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Entry
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {days.map(day => (
              <div key={day} className="card">
                <h3 className="text-xl font-semibold mb-3 dark:text-white">{day}</h3>
                {groupedTimetables[day].length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No classes scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {groupedTimetables[day].map(entry => (
                      <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium dark:text-white">{entry.subject}</p>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {entry.startTime} - {entry.endTime}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {entry.class && <span>Class: {entry.class}</span>}
                            {entry.teacher && <span>Teacher: {entry.teacher}</span>}
                            {entry.room && <span>Room: {entry.room}</span>}
                          </div>
                        </div>
                        <button onClick={() => deleteTimetable(entry._id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
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
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Add Timetable Entry</h2>
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
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Class</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="input"
                    placeholder="e.g., Grade 10A"
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
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Teacher</label>
                  <input
                    type="text"
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="input"
                    placeholder="e.g., 101"
                  />
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

export default Timetable;
