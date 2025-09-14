# Google OAuth Setup Instructions

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" > "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add your domain to "Authorized JavaScript origins":
   - For development: `http://localhost:3000`
   - For production: your production domain
8. Copy the Client ID

## 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Replace `your-google-client-id-here` with your actual Google Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here
   ```

## 3. Start the Application

```bash
npm run dev
```

## 4. Test Authentication

1. Open your browser and go to `http://localhost:3000`
2. You should be redirected to the authentication page
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected back to the app and logged in

## Features

- ✅ Google OAuth authentication
- ✅ Protected routes (all pages require authentication except `/take/:shareCode`)
- ✅ User profile display in header
- ✅ Logout functionality
- ✅ Persistent login state (stored in localStorage)
- ✅ Loading states during authentication

## Notes

- The `/take/:shareCode` route is public and doesn't require authentication (for taking quizzes)
- All other routes are protected and require Google authentication
- User data is stored in localStorage for persistence across browser sessions
