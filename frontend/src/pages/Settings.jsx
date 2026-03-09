import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Moon, Sun } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, languages } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'security', label: 'Security', icon: <Lock size={20} /> },
    { id: 'preferences', label: 'Preferences', icon: <Globe size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> }
  ];

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="card md:col-span-1">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="card md:col-span-3">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="input"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      className="input bg-gray-100 dark:bg-gray-700"
                      disabled
                    />
                  </div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">Change Password</button>
                </form>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Theme</label>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                      <span className="dark:text-white">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Language</label>
                    <select
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="input"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">Notification Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <span className="dark:text-white">Email Notifications</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <span className="dark:text-white">Assessment Reminders</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <span className="dark:text-white">Badge Achievements</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <span className="dark:text-white">Weekly Progress Reports</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
