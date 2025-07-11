# Render Environment Variables

## Backend Service Environment Variables

```
NODE_ENV=production
PORT=10000
JWT_SECRET=someSuperSecretKey123!@#$
URL_EXPIRATION_SECONDS=3600
CORS_ORIGIN=https://your-frontend-app.onrender.com
SUPABASE_URL=https://oicqumgrhpwgbaccqmqv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3F1bWdyaHB3Z2JhY2NxbXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMzY1OTgsImV4cCI6MjA2NTcxMjU5OH0.HO4FBrseoog_fQTI3IpZc9O4XIqzRUii6cvPR_sdJN8
FIREBASE_PROJECT_ID=fileshare-14c20
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJKGP7vc6dLsmp\nI43h2Wa0vKrK4UqhXpXGcyFKEgvXS4Eh9yfz838M2fpwcckal8AxmVwhdcAZGigM\nULzGKBXcadyNdgEmfQpL5+bMPQqcNPGaY8fjJT0776FqTOtFyi6XPXqO5d6yhfSk\nCRsYAs/0DEzNrBkni47VXKaQs60LOiSH4pVwbqEoZxuzXz9kt0XgtrjXp3T9BIoB\n+FqKYMtITcxD+QucCxhKg3qU7yrclf4MfcseJtkByAFyrRKfmg1hA6eNUK9vf06q\nR9dz0VEOAgVTQ1a7DaL2ned1FoWK2CdkpRDOKOZyo4169LX9FXBqrFWc99GB+bWF\nSnrHSP2hAgMBAAECggEAImmN/TWB4KLt7cj+zzm9V8ME5tM2zLddIQd2FPFUZD7u\n9uwMwi+QNxcdQFo+4JVAVFvbhn/Z3pF6c2zmdnHKF5xmli6vULHIbqbb9Wml5IYs\nJNDYE7Q9rwC2GPTStOw7HzVtv390ow7GhL9oCqoEgEgQZYkA/qJhy39foVaTjl1U\neOyeEAN8dpkzbIo9+2wthVEjvB94+FfvVgY2Nx2OBMKaRd2y5qcJwvAKa8dhMrbL\nJs46xW4XrqeomBwjX4EiWDmgzRLmQ3l+TMKsHtzO63aMduu5MMFtESzh7KEA6QII\n84d0KUWdLTG5dsVoYeGg3kCz1JStITHC5y2ka7AK7wKBgQD6WvEQesDT1U04kttQ\nh1KBB/wBo6iH7Jf/XD3ICojY1D1K4ceHMuKr3DgxbXxQwqOX8J9aKZBpVnspXVvx\nKZDTsR0lCAhTr//xbWNO6GA1qpWmky0y7DFl1d8A9LY5vsxqE9jtKqW4/WkVeFiR\nY76P75+U2wFe2KcROhW2ZrLW9wKBgQDNsXrF5U5Yp2Y+GjWf2FUScnEwoHCRNVkm\n1K9pm7HJ9khDuM1ip5BUjB6RtliyTNIO2P3hqK4cuFeDXTcFULbVWP75vf85zBWd\ndpgWwI38M+g4xGXTsk3aFZ2MrGazNephYrxG4JvuM5heZv1jX6ZYB3m2pbSxhonF\ngbthguIyJwKBgGQS+CujNfM3X1/O7FX7UdJ8M5MgLVzwCS4tXBDbjSpHZJzLNavo\nfk0+gUPYxQmvVB+HMtuio7RHuoGlbPwwplDIiqLj3Bg/0SpblIfVQagSITHtwPKL\nEY/odvT13OWmTCXW+y6KjqYsvdW0PosXePQmT/77sEeOiPHM6yL3WGOvAoGBAKTp\n5sVDU81AaXjhCp1dlNd1acrS122UmCXJ39mMOr7x9n5VbFXsgotGzDuHNxW9Aa1l\nzCdgVjgwk/l+gt6AGBZ1g/g3nKl6NtpIeyfCuhO6ijT5Qaq5CjIPooFmt/B3CbOK\ntekdq+cO9tq5N+60gWmSlMMbmAO9GjiACvvjM/eBAoGAbxLc3b3211Ve1ULLhm5D\n2Rr1CIbnDRGeH2/YCpw63X5GpxsMEeZgr7INUzvuithyuyoLQ6mEHi4Rlqvplomw\n4r7N24TTUGezm2LZIBYfFDm6eTGQ2ydDQjMLzHXZHHCvCSsEVtBHsgYQa6prBRAb\n9/yG+b5w/DGrG9EdJFAtnws=\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fileshare-14c20.iam.gserviceaccount.com
```

## Frontend Service Environment Variables

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDgbDTS947w4lhp4c3ROoJT3MniG1pe7w0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fileshare-14c20.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fileshare-14c20
```

## Notes

- Replace `your-frontend-app` and `your-backend-app` with actual Render service names
- Get Firebase config from Firebase Console → Project Settings
- Get Supabase URL and anon key from Supabase Dashboard → Settings → API
- Generate JWT_SECRET: use any random 32+ character string
- Files stored in memory, file metadata stored in Supabase database (free)