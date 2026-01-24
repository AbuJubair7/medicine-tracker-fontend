'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleAuthWrapper({ children }: { children: React.ReactNode }) {
  // Use environment variable for Client ID, with a fallback or empty string to prevent build error if missing,
  // but functionality will fail if not provided. logic handles in runtime.
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    console.warn("Google Client ID is missing in environment variables. Google Login will not work.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
