// Simple virus scanner utility
// In production, you would integrate with services like VirusTotal API, ClamAV, or cloud-based scanners

const SUSPICIOUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.msi', '.dll', '.sys', '.drv', '.bin', '.app', '.deb', '.rpm'
];

const SUSPICIOUS_PATTERNS = [
  // Common malware signatures (simplified)
  'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*', // EICAR test
  'eval(', 'document.write', '<script', 'javascript:', 'vbscript:',
  'powershell', 'cmd.exe', 'system32'
];

/**
 * Scan file for potential threats
 * @param {File} file - The file to scan
 * @returns {Promise<Object>} Scan result
 */
export const scanFile = async (file) => {
  return new Promise((resolve) => {
    const result = {
      isClean: true,
      threats: [],
      scanTime: Date.now()
    };

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (SUSPICIOUS_EXTENSIONS.includes(extension)) {
      result.isClean = false;
      result.threats.push(`Suspicious file extension: ${extension}`);
    }

    // Check file size (files over 500MB are suspicious)
    if (file.size > 500 * 1024 * 1024) {
      result.threats.push('File size exceeds safe limits');
    }

    // Read file content for pattern matching (first 1KB only for performance)
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      const textContent = new TextDecoder().decode(content).toLowerCase();
      
      // Check for suspicious patterns
      SUSPICIOUS_PATTERNS.forEach(pattern => {
        if (textContent.includes(pattern.toLowerCase())) {
          result.isClean = false;
          result.threats.push(`Suspicious content pattern detected`);
        }
      });

      // Simulate scanning delay
      setTimeout(() => {
        resolve(result);
      }, 1000 + Math.random() * 2000); // 1-3 seconds
    };

    reader.onerror = () => {
      resolve(result); // If can't read, assume clean
    };

    // Read first 1KB of file
    const blob = file.slice(0, 1024);
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Get threat level based on scan result
 * @param {Object} scanResult - Result from scanFile
 * @returns {string} Threat level
 */
export const getThreatLevel = (scanResult) => {
  if (scanResult.isClean) return 'clean';
  if (scanResult.threats.length >= 3) return 'high';
  if (scanResult.threats.length >= 2) return 'medium';
  return 'low';
};