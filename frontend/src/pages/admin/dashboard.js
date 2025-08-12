import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import UserManagement from '../../components/admin/UserManagement';
import Link from 'next/link';

export default function AdminDashboard({ user, loading }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalStorage: 0,
    activeShares: 0
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout title="Access Denied">
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'downloads', label: 'Downloads', icon: '📥' },
    { id: 'storage', label: 'Storage', icon: '💾' }
  ];

  return (
    <Layout title="Admin Dashboard" user={user}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-green-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Total Files</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.totalFiles}</p>
                </div>
                <div className="bg-yellow-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Storage Used</h3>
                  <p className="text-3xl font-bold text-yellow-600">{(stats.totalStorage / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="bg-purple-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Active Shares</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.activeShares}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🔧 Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/admin/download-logs" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">
                      📥 View Download Logs
                    </Link>
                    <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      📊 Generate Report
                    </button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📈 Recent Activity</h3>
                  <div className="text-sm text-gray-600">
                    <p>• {stats.newUsersToday || 0} new users today</p>
                    <p>• {stats.filesUploadedToday || 0} files uploaded today</p>
                    <p>• {stats.downloadCount || 0} total downloads</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && <UserManagement onUpdate={loadStats} />}
          
          {activeTab === 'downloads' && (
            <div className="text-center py-8">
              <h3 className="text-2xl font-semibold mb-4">📥 Download Activity Monitor</h3>
              <p className="text-gray-600 mb-6">Track who downloads files, when, and from where</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold">Real-time Tracking</h4>
                  <p className="text-sm text-gray-600">Monitor downloads as they happen</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-semibold">IP Geolocation</h4>
                  <p className="text-sm text-gray-600">See download locations</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <h4 className="font-semibold">Export Reports</h4>
                  <p className="text-sm text-gray-600">Download CSV reports</p>
                </div>
              </div>
              <Link href="/admin/download-logs" className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-lg">
                Open Download Logs Dashboard
              </Link>
            </div>
          )}
          
          {activeTab === 'storage' && (
            <div>
              <h2 className="text-xl font-bold mb-4">💾 Storage Monitoring</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold">Total Capacity</h3>
                  <p className="text-xl font-bold">100 GB</p>
                </div>
                <div className="bg-blue-100 p-4 rounded">
                  <h3 className="font-semibold">Used Space</h3>
                  <p className="text-xl font-bold text-blue-600">{(stats.totalStorage / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="bg-green-100 p-4 rounded">
                  <h3 className="font-semibold">Available</h3>
                  <p className="text-xl font-bold text-green-600">
                    {(100 * 1024 - stats.totalStorage / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Storage Usage by File Type</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Documents (PDF, DOC)</span>
                    <span>45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images (JPG, PNG)</span>
                    <span>30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Videos (MP4, AVI)</span>
                    <span>20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Others</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}