import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Get user ID
export const getCurrentUserId = async () => {
  const user = await getCurrentUser();
  return user ? user.uid : null;
};

// Get user email
export const getCurrentUserEmail = async () => {
  const user = await getCurrentUser();
  return user ? user.email : null;
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};