# Firebase Storage CORS Configuration

To fix the CORS error when uploading files from localhost, follow these steps:

## 1. Install Firebase CLI
```
npm install -g firebase-tools
```

## 2. Login to Firebase
```
firebase login
```

## 3. Set the default project
```
firebase use --add
```
Select your project (`fileshare-14c20`) when prompted.

## 4. Configure CORS for Firebase Storage
Use the `cors.json` file in this directory and run:
```
firebase storage:cors set cors.json
```

## 5. Check Firebase Storage Rules
Make sure your Firebase Storage rules allow uploads. Go to the Firebase Console:
1. Navigate to Storage
2. Click on "Rules" tab
3. Ensure your rules allow authenticated users to upload files:

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

## 6. Verify Firebase Project Settings
1. Go to Firebase Console
2. Select your project
3. Go to Project Settings
4. Under "Your apps" section, verify that your web app is correctly registered
5. Check that the domain "localhost" is added to the authorized domains list

## 7. Check System Date and Time
Ensure your system date and time are set correctly, as Firebase authentication tokens rely on accurate time.

## 8. Restart Your Application
After making these changes, restart your Next.js development server:
```
npm run dev
```