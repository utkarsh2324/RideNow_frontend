// src/main.jsx or index.jsx (your entry point)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./components/auth.jsx";
import { HostAuthProvider } from "./components/host/hostauth.jsx";
import { AdminAuthProvider } from "./components/admin/adminauth.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>

      {/* Admin Auth (global) */}
      <AdminAuthProvider>

        {/* Rent User Auth */}
        <AuthProvider>

          {/* Host Auth */}
          <HostAuthProvider>

            <App />

          </HostAuthProvider>
        </AuthProvider>
      </AdminAuthProvider>

    </BrowserRouter>
  </React.StrictMode>
);