// src/main.jsx or index.jsx (your entry point)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./components/auth.jsx";
import { HostAuthProvider } from "./components/host/hostauth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap both providers globally */}
      <AuthProvider>
        <HostAuthProvider>
          <App />
        </HostAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);