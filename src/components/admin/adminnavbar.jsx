import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AdminAuthContext } from "./adminauth";

export default function AdminNavbar() {
  const { admin, setAdmin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  // 🚪 Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}admins/logout`,
        {},
        { withCredentials: true }
      );

      setAdmin(null);
      toast.success("Logged out successfully");
      navigate("/admin");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // ❌ If not logged in → DO NOT show navbar
  if (!admin) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        
        {/* Logo */}
        <NavLink to="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="RideNow Logo" className="h-10 w-auto" />
          <span className="text-white font-bold text-lg">
            RideNow Admin
          </span>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}