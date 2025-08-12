import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function MFASetup({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const setupMFA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await response.json();
      setQrCode(data.qrCode);
      setStep(2);
    } catch (error) {
      console.error('MFA setup error:', error);
    }
    setLoading(false);
  };

  const verifyMFA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, code: verificationCode })
      });
      const data = await response.json();
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setStep(3);
      }
    } catch (error) {
      console.error('MFA verification error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Setup Multi-Factor Authentication</h2>
      
      {step === 1 && (
        <div>
          <p className="mb-4">Enhance your account security with MFA</p>
          <button 
            onClick={setupMFA}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Setting up...' : 'Setup MFA'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-4">Scan this QR code with your authenticator app:</p>
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={qrCode} size={200} />
          </div>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button 
            onClick={verifyMFA}
            disabled={loading || !verificationCode}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            {loading ? 'Verifying...' : 'Verify & Complete'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Backup Codes</h3>
          <p className="text-sm text-gray-600 mb-4">Save these codes safely:</p>
          <div className="bg-gray-100 p-4 rounded mb-4">
            {backupCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm">{code}</div>
            ))}
          </div>
          <button 
            onClick={onComplete}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
}