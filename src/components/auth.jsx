// src/components/auth.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on app mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}users/current-user`,
          { withCredentials: true }
        );

        if (res.data?.data) {
          const u = res.data.data;

          // ✅ Normalize user so all components get consistent data
          const normalizedUser = {
            _id: u._id,
            email: u.email,
            username: u.username || u.email.split("@")[0], // prefer username if exists
            avatar: u.profile?.photo || null, // flat avatar field for Navbar/Profile
            profile: u.profile || {}, // keep original profile object too
            createdAt: u.createdAt,   // in case you need "account created" display
          };

          setUser(normalizedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Failed to fetch current user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}