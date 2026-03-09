import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import Layout from '../../components/Layout';
import { timetableAPI } from '../../api/timetable';
import { toast } from 'react-toastify';

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const data = await timetableAPI.getTimetables();
      setTimetables(data);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const filteredTimetables = timetables
    .filter(t => t.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Class Timetable</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredTimetables.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No classes scheduled for {selectedDay}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTimetables.map(item => (
              <div key={item._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 dark:text-white">{item.subject}</h3>
                    <div className="space-y-2 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      {item.teacher && (
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-green-500" />
                          <span>{item.teacher}</span>
                        </div>
                      )}
                      {item.room && (
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-red-500" />
                          <span>Room {item.room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {item.duration || '60'} min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Timetable;
