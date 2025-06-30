import CryptoJS from 'crypto-js';

/**
 * Generates a random encryption key
 * @returns {string} A random 256-bit key encoded as a hex string
 */
export const generateEncryptionKey = () => {
  const randomWordArray = CryptoJS.lib.WordArray.random(32); // 32 bytes = 256 bits
  return randomWordArray.toString(CryptoJS.enc.Hex);
};

/**
 * Encrypts a file using AES-256 encryption
 * @param {File} file - The file to encrypt
 * @param {string} key - The encryption key as a hex string
 * @returns {Promise<Object>} Object containing the encrypted data and metadata
 */
export const encryptFile = (file) => {
  return new Promise((resolve, reject) => {
    const key = generateEncryptionKey();
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const fileData = event.target.result;
        
        // Encrypt the file data
        const encrypted = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(fileData), 
          key
        ).toString();
        
        resolve({
          encryptedData: encrypted,
          key: key,
          originalName: file.name,
          originalType: file.type,
          originalSize: file.size
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Decrypts file data using AES-256 encryption
 * @param {string} encryptedData - The encrypted file data
 * @param {string} key - The encryption key as a hex string
 * @param {string} originalType - The original MIME type of the file
 * @returns {Blob} The decrypted file as a Blob
 */
export const decryptFile = (encryptedData, key, originalType) => {
  try {
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const wordArray = decrypted;
    
    // Convert WordArray to ArrayBuffer
    const arrayBuffer = wordArrayToArrayBuffer(wordArray);
    
    // Create a Blob from the ArrayBuffer
    return new Blob([arrayBuffer], { type: originalType });
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

/**
 * Helper function to convert CryptoJS WordArray to ArrayBuffer
 * @param {WordArray} wordArray - CryptoJS WordArray
 * @returns {ArrayBuffer} The resulting ArrayBuffer
 */
const wordArrayToArrayBuffer = (wordArray) => {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const buffer = new ArrayBuffer(sigBytes);
  const view = new DataView(buffer);
  
  for (let i = 0; i < sigBytes; i += 4) {
    const word = words[i / 4];
    if (i + 4 <= sigBytes) {
      view.setUint32(i, word, false);
    } else {
      const remaining = sigBytes - i;
      for (let j = 0; j < remaining; j++) {
        const byte = (word >> (24 - j * 8)) & 0xff;
        view.setUint8(i + j, byte);
      }
    }
  }
  
  return buffer;
};