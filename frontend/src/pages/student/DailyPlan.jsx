import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Play } from 'lucide-react';
import Layout from '../../components/Layout';
import { scheduleAPI } from '../../api/schedule';
import { toast } from 'react-toastify';

const DailyPlan = () => {
  const [dailyPlan, setDailyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [energyLevel, setEnergyLevel] = useState('high');
  const [emergencyNote, setEmergencyNote] = useState('');

  useEffect(() => {
    fetchDailyPlan();
  }, [selectedDate]);

  const fetchDailyPlan = async () => {
    try {
      const data = await scheduleAPI.getDailyPlan(selectedDate);
      setDailyPlan(data);
    } catch (error) {
      toast.error('Failed to load daily plan');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyPlan = async () => {
    try {
      setLoading(true);
      const data = await scheduleAPI.generateDailyPlan({
        date: selectedDate,
        energyLevel,
        emergencyNote
      });
      setDailyPlan(data);
      toast.success('Daily plan generated successfully');
    } catch (error) {
      toast.error('Failed to generate daily plan');
    } finally {
      setLoading(false);
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      await scheduleAPI.updateTaskStatus(taskId, 'completed');
      toast.success('Task marked as complete');
      fetchDailyPlan();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Daily Plan</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-auto"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Energy Level</label>
            <select
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="input"
            >
              <option value="low">Low Energy</option>
              <option value="medium">Medium Energy</option>
              <option value="high">High Energy</option>
            </select>
          </div>
          <div className="card md:col-span-2">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Emergency/Interruption Note</label>
            <input
              type="text"
              value={emergencyNote}
              onChange={(e) => setEmergencyNote(e.target.value)}
              placeholder="Any urgent tasks or interruptions?"
              className="input"
            />
          </div>
        </div>

        <button onClick={generateDailyPlan} className="btn-primary mb-6 flex items-center gap-2">
          <Play size={20} />
          Generate AI Daily Plan
        </button>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : dailyPlan ? (
          <div className="space-y-4">
            {dailyPlan.tasks && dailyPlan.tasks.length > 0 ? (
              dailyPlan.tasks.map((task, index) => (
                <div key={index} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${task.completed ? 'text-green-500' : 'text-gray-400'}`}>
                        {task.completed ? <CheckCircle size={24} /> : <Clock size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold dark:text-white">{task.subject}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {task.startTime} - {task.endTime}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{task.description}</p>
                        {task.priority === 'high' && (
                          <div className="flex items-center gap-1 mt-2 text-red-500">
                            <AlertCircle size={16} />
                            <span className="text-sm">High Priority</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!task.completed && (
                      <button
                        onClick={() => markTaskComplete(task._id)}
                        className="btn-primary text-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-12">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No tasks for this day. Generate a daily plan to get started.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Generate your daily plan to see tasks</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DailyPlan;
