import { useState } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';

export default function AdvancedSharing({ file, sharingLink, onClose }) {
  const [qrCode, setQrCode] = useState('');
  const [emailForm, setEmailForm] = useState({ to: '', message: '' });

  const [activeTab, setActiveTab] = useState('qr');

  const shareUrl = `${window.location.origin}/shared/${sharingLink?.token}`;

  // Generate QR Code
  const generateQR = async () => {
    try {
      const qr = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      setQrCode(qr);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };



  // Social sharing
  const shareToWhatsApp = () => {
    const text = `Check out this file: ${file.originalName}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = `Check out this file: ${file.originalName}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareByEmail = async () => {
    if (!emailForm.to) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/share-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          fileName: file.originalName,
          shareUrl,
          message: emailForm.message
        })
      });

      if (response.ok) {
        toast.success('Email sent successfully');
        setEmailForm({ to: '', message: '' });
      } else {
        toast.error('Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Share: {file.originalName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {[
            { id: 'qr', label: '📱 QR Code', action: generateQR },
            { id: 'social', label: '🌐 Social' },
            { id: 'email', label: '📧 Email' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                tab.action?.();
              }}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div className="text-center space-y-4">
            {qrCode ? (
              <div>
                <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Scan with your phone to access the file
                </p>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `${file.originalName}-qr.png`;
                    link.href = qrCode;
                    link.click();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Download QR Code
                </button>
              </div>
            ) : (
              <button
                onClick={generateQR}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Generate QR Code
              </button>
            )}
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={shareToWhatsApp}
                className="flex items-center justify-center space-x-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </button>
              <button
                onClick={shareToTelegram}
                className="flex items-center justify-center space-x-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <span>✈️</span>
                <span>Telegram</span>
              </button>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Share URL:</label>
              <div className="flex">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-l-lg bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-r-lg hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">To:</label>
              <input
                type="email"
                value={emailForm.to}
                onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Custom Message (optional):</label>
              <textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={shareByEmail}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send Email
            </button>
          </div>
        )}


      </div>
    </div>
  );
}