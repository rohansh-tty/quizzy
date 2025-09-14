// Google OAuth Configuration
// You'll need to replace this with your actual Google OAuth Client ID
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here';
// Google OAuth Scopes
export const GOOGLE_SCOPES = [
  'openid',
  'profile',
  'email'
].join(' ');
