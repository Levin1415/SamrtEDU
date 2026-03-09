export const calculateScore = (answers, correctAnswers) => {
  let correct = 0;
  answers.forEach((answer, index) => {
    if (answer === correctAnswers[index]) {
      correct++;
    }
  });
  return {
    score: correct,
    total: answers.length,
    percentage: (correct / answers.length) * 100
  };
};

export const getBadgeForScore = (percentage) => {
  if (percentage >= 90) return 'Gold Academic';
  if (percentage >= 75) return 'Silver Scholar';
  if (percentage >= 50) return 'Bronze Learner';
  return null;
};

export const getBadgeColor = (badgeType) => {
  const colors = {
    'Gold Academic': 'text-yellow-500',
    'Silver Scholar': 'text-gray-400',
    'Bronze Learner': 'text-orange-600',
    'Consistent Planner': 'text-blue-500',
    'Study Streak': 'text-red-500',
    'AI Explorer': 'text-purple-500',
    'Lesson Master': 'text-green-500',
  };
  return colors[badgeType] || 'text-gray-500';
};

export const getBadgeIcon = (badgeType) => {
  const icons = {
    'Gold Academic': '🥇',
    'Silver Scholar': '🥈',
    'Bronze Learner': '🥉',
    'Consistent Planner': '🎯',
    'Study Streak': '🔥',
    'AI Explorer': '🧠',
    'Lesson Master': '📚',
  };
  return icons[badgeType] || '🏅';
};
