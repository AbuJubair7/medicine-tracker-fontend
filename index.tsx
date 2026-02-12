
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './src/App';

// Using the specific Client ID provided to resolve authorization errors
const GOOGLE_CLIENT_ID = "408990489269-cnd6ds9okm6mrulvp6f2fuuq7dn8l0v3.apps.googleusercontent.com";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HashRouter>
        <App />
      </HashRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
