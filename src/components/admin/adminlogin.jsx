import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AdminAuthContext } from "./adminauth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useContext(AdminAuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- INPUT HANDLER ---------------- */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ---------------- LOGIN HANDLER ---------------- */

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}admins/login`,
        formData,
        {
          withCredentials: true, // ✅ REQUIRED for cookies
        }
      );

      toast.success(res.data.message || "Admin logged in");

      // ✅ Set admin context (minimal, backend verified)
      setAdmin({
        email: formData.email,
        role: "admin",
      });

      // ✅ Redirect to admin dashboard
      navigate("/admin");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Invalid admin credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@ridenow.com"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400"
                : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}