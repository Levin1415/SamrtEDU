import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Calendar, MessageSquare, Award, BookOpen, Clock } from 'lucide-react';

const Landing = () => {
  const features = [
    { icon: MessageSquare, title: 'AI Tutor', desc: 'Get instant answers in multiple languages' },
    { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered study plans' },
    { icon: BookOpen, title: 'Lesson Plans', desc: 'Generate complete lesson plans instantly' },
    { icon: Clock, title: 'Time Management', desc: 'Emergency-aware daily planning' },
    { icon: Award, title: 'Badges & Rewards', desc: 'Earn badges for achievements' },
    { icon: Brain, title: 'Auto Assessment', desc: 'AI-generated and graded assessments' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">SmartAcad</h1>
          <div className="space-x-4">
            <Link to="/login" className="px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              Login
            </Link>
            <Link to="/register" className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-indigo-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered <span className="text-primary">Academic Assistant</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Transform your learning experience with intelligent planning, instant AI tutoring, 
            and personalized assessments
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register?role=student"
              className="px-8 py-4 rounded-2xl bg-primary text-white text-lg font-semibold hover:bg-indigo-700 shadow-lg"
            >
              Get Started as Student
            </Link>
            <Link
              to="/register?role=teacher"
              className="px-8 py-4 rounded-2xl bg-accent text-white text-lg font-semibold hover:bg-emerald-700 shadow-lg"
            >
              Get Started as Teacher
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
          Powerful Features
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <feature.icon className="text-primary" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">© 2026 SmartAcad. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
