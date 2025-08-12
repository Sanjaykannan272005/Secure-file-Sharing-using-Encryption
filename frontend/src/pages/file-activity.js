import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getCurrentUser, getCurrentUserId } from '../utils/auth';

export default function FileActivity() {
  const [user, setUser] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    fileName: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadDownloads();
    }
  }, [user]);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const loadDownloads = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      const queryParams = new URLSearchParams();
      queryParams.append('ownerId', userId);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/files/download-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setDownloads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading downloads:', error);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    loadDownloads();
  };

  const clearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', fileName: '' });
    setTimeout(loadDownloads, 100);
  };

  if (!user) {
    return (
      <Layout title="Loading...">
        <div className="container mx-auto p-4 text-center">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="File Activity" user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📊 My File Activity</h1>
          <div className="text-sm text-gray-600">
            Tracking downloads of your shared files
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">🔍 Filter Downloads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File Name</label>
              <input
                type="text"
                placeholder="Search file name..."
                value={filters.fileName}
                onChange={(e) => setFilters({...filters, fileName: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={applyFilters}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Downloads</h3>
            <p className="text-2xl font-bold text-blue-600">{downloads?.length || 0}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Files Downloaded</h3>
            <p className="text-2xl font-bold text-green-600">
              {downloads?.length ? new Set(downloads.map(d => d.fileId)).size : 0}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Unique Visitors</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {downloads?.length ? new Set(downloads.map(d => d.ipAddress)).size : 0}
            </p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Today</h3>
            <p className="text-2xl font-bold text-purple-600">
              {downloads?.length ? downloads.filter(d => 
                new Date(d.downloadTime).toDateString() === new Date().toDateString()
              ).length : 0}
            </p>
          </div>
        </div>

        {/* Downloads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading your file activity...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">📅 When</th>
                      <th className="p-3 text-left">📁 File</th>
                      <th className="p-3 text-left">🌐 IP Address</th>
                      <th className="p-3 text-left">🖥️ Device</th>
                      <th className="p-3 text-left">📍 Location</th>
                      <th className="p-3 text-left">📊 Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map((download, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(download.downloadTime).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              {new Date(download.downloadTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{download.fileName}</div>
                          <div className="text-sm text-gray-500">{download.fileType}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {download.ipAddress}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm max-w-xs truncate" title={download.userAgent}>
                            {download.userAgent?.includes('Mobile') ? '📱 Mobile' : 
                             download.userAgent?.includes('Windows') ? '🖥️ Windows' :
                             download.userAgent?.includes('Mac') ? '🍎 Mac' : '💻 Desktop'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>{download.country || 'Unknown'}</div>
                            <div className="text-gray-500">{download.city || 'Unknown'}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {(download.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {downloads.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold mb-2">No Downloads Yet</h3>
                  <p>When people download your shared files, you'll see the activity here.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {downloads.length} download records for your files
        </div>
      </div>
    </Layout>
  );
}