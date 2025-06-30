import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// Upload file to Firebase Storage with progress tracking
export const uploadFile = async (file, metadata, onProgress = () => {}) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    // Create a unique file ID
    const fileId = Date.now().toString() + Math.random().toString(36).substring(2, 10);
    
    // Create storage reference
    const storageRef = ref(storage, `files/${user.uid}/${fileId}`);
    
    // Upload with progress monitoring
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Return a promise that resolves when upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save metadata to Firestore
            const fileData = {
              id: fileId,
              originalName: metadata.originalName,
              originalType: metadata.originalType,
              originalSize: metadata.originalSize,
              downloadURL,
              createdAt: new Date().toISOString(),
              ownerId: user.uid,
              ownerEmail: user.email
            };
            
            const docRef = await addDoc(collection(db, "files"), fileData);
            resolve({ id: fileId, docId: docRef.id, ...fileData });
          } catch (err) {
            console.error("Error saving file metadata:", err);
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error("Upload initialization error:", error);
    throw error;
  }
};

// Get user's files
export const getFiles = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];
  
  const q = query(collection(db, "files"), where("ownerId", "==", user.uid));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    docId: doc.id
  }));
};

// Create sharing link with longer expiration
export const createSharingLink = async (fileId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  
  // Find the file
  const q = query(collection(db, "files"), where("id", "==", fileId), where("ownerId", "==", user.uid));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) throw new Error("File not found");
  
  const fileDoc = querySnapshot.docs[0];
  
  // Create sharing token
  const token = `share-${fileId}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Set expiration to 7 days (matching Firebase Storage default URL expiration)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); 
  
  const sharingLink = {
    token,
    expiresAt: expiresAt.toISOString()
  };
  
  // Update file with sharing link
  await updateDoc(doc(db, "files", fileDoc.id), {
    sharingLink
  });
  
  return sharingLink;
};

// Get shared file by token with better error handling
export const getSharedFile = async (token) => {
  if (!token) return null;
  
  try {
    const fileId = token.split('-')[1];
    if (!fileId) return null;
    
    // Find the file with this token
    const q = query(collection(db, "files"), where("id", "==", fileId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const fileData = querySnapshot.docs[0].data();
    
    // Verify the token and check expiration
    if (!fileData.sharingLink || fileData.sharingLink.token !== token) {
      console.log("Invalid sharing token");
      return null;
    }
    
    if (new Date(fileData.sharingLink.expiresAt) < new Date()) {
      console.log("Sharing link has expired");
      return null;
    }
    
    // Refresh the download URL to ensure it's valid
    try {
      const storageRef = ref(storage, `files/${fileData.ownerId}/${fileData.id}`);
      const freshDownloadURL = await getDownloadURL(storageRef);
      
      // Update the download URL in the returned data
      return {
        ...fileData,
        downloadURL: freshDownloadURL
      };
    } catch (error) {
      console.error("Error refreshing download URL:", error);
      return fileData; // Return original data if refresh fails
    }
  } catch (error) {
    console.error("Error in getSharedFile:", error);
    return null;
  }
};