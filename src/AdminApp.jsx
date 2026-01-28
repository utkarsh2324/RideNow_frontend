import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";

import { AdminAuthContext } from "./components/admin/adminauth.jsx";
import AdminNavbar from "./components/admin/adminnavbar.jsx";
import AdminLogin from "./components/admin/adminlogin";
import AdminDashboard from "./components/admin/admindashboard.jsx";

function AdminApp() {
  const { admin, loading } = useContext(AdminAuthContext);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Checking admin session...
      </div>
    );
  }

  // 🔐 Not logged in → login page ONLY
  if (!admin) {
    return (
      <>
        <Toaster position="top-right" />
        <AdminLogin />
      </>
    );
  }

  // ✅ Logged in
  return (
    <>
      <Toaster position="top-right" />
      <AdminNavbar />

      {/* Add top padding because navbar is fixed */}
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default AdminApp;