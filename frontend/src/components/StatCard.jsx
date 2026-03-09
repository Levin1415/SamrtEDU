import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon, title, value, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300',
    accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
  };

  // Handle both component and JSX element
  const IconComponent = typeof icon === 'function' ? icon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${colorClasses[color]}`}>
          {IconComponent ? <IconComponent size={28} /> : icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
