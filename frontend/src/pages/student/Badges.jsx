import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Target, Zap, TrendingUp } from 'lucide-react';
import Layout from '../../components/Layout';
import { badgesAPI } from '../../api/badges';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const [badgesData, statsData] = await Promise.all([
        badgesAPI.getBadges(),
        badgesAPI.getStats()
      ]);
      setBadges(badgesData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'score': return <Trophy className="text-yellow-500" size={32} />;
      case 'streak': return <Zap className="text-orange-500" size={32} />;
      case 'completion': return <Target className="text-green-500" size={32} />;
      case 'improvement': return <TrendingUp className="text-blue-500" size={32} />;
      default: return <Award className="text-purple-500" size={32} />;
    }
  };

  const getBadgeColor = (level) => {
    switch (level) {
      case 'gold': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'silver': return 'bg-gradient-to-br from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default: return 'bg-gradient-to-br from-blue-400 to-blue-600';
    }
  };

  const celebrateBadge = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Badges & Achievements</h1>

        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center">
              <Award size={32} className="mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold dark:text-white">{stats.totalBadges || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Badges</p>
            </div>
            <div className="card text-center">
              <Trophy size={32} className="mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold dark:text-white">{stats.goldBadges || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Gold Badges</p>
            </div>
            <div className="card text-center">
              <Zap size={32} className="mx-auto mb-2 text-orange-500" />
              <p className="text-3xl font-bold dark:text-white">{stats.currentStreak || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Day Streak</p>
            </div>
            <div className="card text-center">
              <Star size={32} className="mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold dark:text-white">{stats.points || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Points</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading badges...</div>
        ) : badges.length === 0 ? (
          <div className="card text-center py-12">
            <Award size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No badges earned yet. Keep learning to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map(badge => (
              <div
                key={badge._id}
                className="card hover:shadow-xl transition-all cursor-pointer"
                onClick={celebrateBadge}
              >
                <div className={`${getBadgeColor(badge.level)} p-6 rounded-lg mb-4 flex items-center justify-center`}>
                  {getBadgeIcon(badge.type)}
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{badge.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{badge.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    badge.level === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                    badge.level === 'silver' ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {badge.level.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Badges;
