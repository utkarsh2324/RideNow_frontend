import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Fetch current admin on app mount
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}admins/current-admin`,
          {
            withCredentials: true, // IMPORTANT (cookie-based auth)
          }
        );

        if (res.data?.data) {
          const a = res.data.data;

          // ✅ Normalize admin data (future-proof)
          const normalizedAdmin = {
            email: a.email,
            role: "admin",
          };

          setAdmin(normalizedAdmin);
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error("❌ Failed to fetch current admin:", error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        setAdmin,
        loading,
        isAdminLoggedIn: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}