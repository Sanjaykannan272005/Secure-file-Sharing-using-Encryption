import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function DownloadLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    fileName: '',
    ipAddress: '',
    userEmail: ''
  });

  useEffect(() => {
    loadDownloadLogs();
  }, []);

  const loadDownloadLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/admin/download-logs?${queryParams}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error loading download logs:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadDownloadLogs();
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      fileName: '',
      ipAddress: '',
      userEmail: ''
    });
    setTimeout(loadDownloadLogs, 100);
  };

  const exportLogs = async () => {
    try {
      const response = await fetch('/api/admin/download-logs/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `download-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting logs:', error);
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

  return (
    <Layout title="Download Logs" user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📥 Download Activity Logs</h1>
          <button
            onClick={exportLogs}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            📊 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">🔍 Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File Name</label>
              <input
                type="text"
                placeholder="Search file name..."
                value={filters.fileName}
                onChange={(e) => handleFilterChange('fileName', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IP Address</label>
              <input
                type="text"
                placeholder="192.168.1.1"
                value={filters.ipAddress}
                onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User Email</label>
              <input
                type="text"
                placeholder="user@example.com"
                value={filters.userEmail}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
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
              Clear All
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Downloads</h3>
            <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Unique Files</h3>
            <p className="text-2xl font-bold text-green-600">
              {new Set(logs.map(log => log.fileId)).size}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Unique IPs</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {new Set(logs.map(log => log.ipAddress)).size}
            </p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Today's Downloads</h3>
            <p className="text-2xl font-bold text-purple-600">
              {logs.filter(log => 
                new Date(log.downloadTime).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading download logs...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">📅 Date & Time</th>
                      <th className="p-3 text-left">📁 File Name</th>
                      <th className="p-3 text-left">👤 File Owner</th>
                      <th className="p-3 text-left">🌐 IP Address</th>
                      <th className="p-3 text-left">🖥️ User Agent</th>
                      <th className="p-3 text-left">📊 File Size</th>
                      <th className="p-3 text-left">🔗 Share Token</th>
                      <th className="p-3 text-left">📍 Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(log.downloadTime).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              {new Date(log.downloadTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{log.fileName}</div>
                          <div className="text-sm text-gray-500">{log.fileType}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium">{log.ownerEmail}</div>
                            <div className="text-gray-500">ID: {log.ownerId?.substring(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {log.ipAddress}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm max-w-xs truncate" title={log.userAgent}>
                            {log.userAgent}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {(log.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">
                            {log.shareToken?.substring(0, 10)}...
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>{log.country || 'Unknown'}</div>
                            <div className="text-gray-500">{log.city || 'Unknown'}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {logs.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No download logs found matching your criteria.
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {logs.length} download records
        </div>
      </div>
    </Layout>
  );
}