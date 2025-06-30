# Firebase Connection Troubleshooting Guide

You're experiencing issues with Firebase connections in your file sharing application. The application has been temporarily switched to use mock storage to allow you to continue development and testing.

## Current Issues

1. **CORS Errors with Firebase Storage**
   - Error: `Access to XMLHttpRequest has been blocked by CORS policy`
   - This prevents file uploads to Firebase Storage

2. **Firebase Firestore Connection Errors**
   - Error: `WebChannelConnection RPC 'Listen' stream transport errored`
   - This prevents reading and writing to Firestore database

3. **Date/Time Discrepancy**
   - Your error logs show dates from 2025 (e.g., `[2025-06-16T14:34:42.342Z]`)
   - This suggests a time synchronization issue between your system and Firebase

## Troubleshooting Steps

### 1. Check Firebase Project Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`fileshare-14c20`)
3. Go to Project Settings
4. Verify your web app configuration matches your `.env.local` file
5. Under "Your apps" section, make sure `localhost` is added to authorized domains

### 2. Configure CORS for Firebase Storage

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Set project: `firebase use fileshare-14c20`
4. Apply CORS configuration:
   ```
   firebase storage:cors set cors.json
   ```

### 3. Check Firebase Rules

1. In Firebase Console, go to Storage > Rules
2. Ensure your rules allow authenticated users to upload files:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### 4. Check Firebase Authentication

1. In Firebase Console, go to Authentication > Sign-in method
2. Ensure Email/Password authentication is enabled
3. Check if there are any active users

### 5. Check for Network Issues

1. Ensure your network allows connections to Firebase domains
2. Try using a different network connection
3. Disable any VPNs or proxies that might interfere with connections

### 6. Check for Browser Extensions

1. Disable any browser extensions that might block connections
2. Try using a different browser

### 7. Check System Time Synchronization

1. Ensure your system time is correctly synchronized
2. Firebase authentication relies on accurate timestamps
3. On Windows:
   - Right-click on the time in your taskbar
   - Select "Adjust date/time"
   - Turn on "Set time automatically"
   - Check that your timezone is correct

## Switching Back to Firebase Storage

Once you've resolved the connection issues, you can switch back to using Firebase Storage by:

1. Reverting the import changes in:
   - `FileUploader.js`
   - `FileList.js`
   - `dashboard.js`
   - `[token].js`

2. Testing file uploads and sharing to ensure everything works correctly

## Additional Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [CORS Configuration for Firebase Storage](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)