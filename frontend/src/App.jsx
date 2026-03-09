import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/Dashboard';
import AIChat from './pages/student/AIChat';
import Schedule from './pages/student/Schedule';
import DailyPlan from './pages/student/DailyPlan';
import StudentTimetable from './pages/student/Timetable';
import StudentAssessments from './pages/student/Assessments';
import TakeAssessment from './pages/student/TakeAssessment';
import Badges from './pages/student/Badges';
import StudentAnalytics from './pages/student/Analytics';

import TeacherDashboard from './pages/teacher/Dashboard';
import LessonPlan from './pages/teacher/LessonPlan';
import TeacherAssessments from './pages/teacher/Assessments';
import TeacherTimetable from './pages/teacher/Timetable';
import TeacherAnalytics from './pages/teacher/Analytics';

import Settings from './pages/Settings';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/ai-chat" element={<ProtectedRoute role="student"><AIChat /></ProtectedRoute>} />
        <Route path="/student/schedule" element={<ProtectedRoute role="student"><Schedule /></ProtectedRoute>} />
        <Route path="/student/daily-plan" element={<ProtectedRoute role="student"><DailyPlan /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute role="student"><StudentTimetable /></ProtectedRoute>} />
        <Route path="/student/assessments" element={<ProtectedRoute role="student"><StudentAssessments /></ProtectedRoute>} />
        <Route path="/student/assessments/:id" element={<ProtectedRoute role="student"><TakeAssessment /></ProtectedRoute>} />
        <Route path="/student/badges" element={<ProtectedRoute role="student"><Badges /></ProtectedRoute>} />
        <Route path="/student/analytics" element={<ProtectedRoute role="student"><StudentAnalytics /></ProtectedRoute>} />
        
        <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/lesson-plan" element={<ProtectedRoute role="teacher"><LessonPlan /></ProtectedRoute>} />
        <Route path="/teacher/assessments" element={<ProtectedRoute role="teacher"><TeacherAssessments /></ProtectedRoute>} />
        <Route path="/teacher/timetable" element={<ProtectedRoute role="teacher"><TeacherTimetable /></ProtectedRoute>} />
        <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><TeacherAnalytics /></ProtectedRoute>} />
        
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
