import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {GoogleOAuthProvider} from "@react-oauth/google";

// Get Google OAuth Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Validate that the Client ID is configured
if (!GOOGLE_CLIENT_ID) {
  console.error(
    "❌ VITE_GOOGLE_CLIENT_ID is not configured in .env.example file"
  );
  console.error("Please add: VITE_GOOGLE_CLIENT_ID=your-client-id");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
