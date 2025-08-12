import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function AnalyticsDashboard({ files }) {
  const [analytics, setAnalytics] = useState({
    downloads: [],
    geographic: {},
    trends: [],
    popular: [],
    storage: { used: 0, total: 0 }
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data - replace with real API calls
      const mockData = {
        downloads: generateMockDownloads(),
        geographic: generateMockGeographic(),
        trends: generateMockTrends(),
        popular: generateMockPopular(),
        storage: calculateStorageUsage()
      };
      
      setAnalytics(mockData);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockDownloads = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      downloads: Math.floor(Math.random() * 50) + 10
    })).reverse();
  };

  const generateMockGeographic = () => ({
    'United States': 45,
    'United Kingdom': 23,
    'Germany': 18,
    'Canada': 12,
    'Australia': 8,
    'France': 6,
    'Japan': 4,
    'Others': 15
  });

  const generateMockTrends = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      downloads: Math.floor(Math.random() * 20) + 5
    }));
    return hours;
  };

  const generateMockPopular = () => {
    return files.slice(0, 5).map(file => ({
      ...file,
      downloads: Math.floor(Math.random() * 100) + 10,
      views: Math.floor(Math.random() * 200) + 20
    }));
  };

  const calculateStorageUsage = () => {
    const used = files.reduce((total, file) => total + (file.originalSize || 0), 0);
    const total = 5 * 1024 * 1024 * 1024; // 5GB limit
    return { used, total };
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">📊 Analytics Dashboard</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📥</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.downloads.reduce((sum, day) => sum + day.downloads, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👁️</div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.popular.reduce((sum, file) => sum + file.views, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🌍</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(analytics.geographic).length}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📁</div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{files.length}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📈 Download Trends</h3>
          <div className="space-y-2">
            {analytics.downloads.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full"
                      style={{ width: `${(day.downloads / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm font-medium">{day.downloads}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🌍 Geographic Distribution</h3>
          <div className="space-y-2">
            {Object.entries(analytics.geographic)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([country, count]) => (
                <div key={country} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 truncate">{country}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(analytics.geographic))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-sm font-medium">{count}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Popular Files & Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Files */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🔥 Popular Files</h3>
          <div className="space-y-3">
            {analytics.popular.map((file, index) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm truncate">{file.originalName}</div>
                  <div className="text-xs text-gray-500">
                    {file.downloads} downloads • {file.views} views
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{file.downloads}</div>
                  <div className="text-xs text-gray-500">downloads</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">💾 Storage Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Used Storage</span>
                <span>{formatBytes(analytics.storage.used)} / {formatBytes(analytics.storage.total)}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${(analytics.storage.used / analytics.storage.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {((analytics.storage.used / analytics.storage.total) * 100).toFixed(1)}% used
              </div>
            </div>

            {/* File Type Breakdown */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">File Types</h4>
              <div className="space-y-2">
                {['Images', 'Documents', 'Videos', 'Others'].map((type, index) => {
                  const percentage = [40, 30, 20, 10][index];
                  return (
                    <div key={type} className="flex items-center">
                      <div className="w-16 text-xs text-gray-600">{type}</div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-gray-500'][index]
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-8 text-xs font-medium">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🕐 Hourly Activity</h3>
        <div className="flex items-end space-x-1 h-32">
          {analytics.trends.map((hour) => (
            <div key={hour.hour} className="flex-1 flex flex-col items-center">
              <div
                className="bg-blue-500 w-full rounded-t"
                style={{ height: `${(hour.downloads / 20) * 100}%` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1">
                {hour.hour.toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}