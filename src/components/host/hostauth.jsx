// src/components/hostauth.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const HostAuthContext = createContext();

export function HostAuthProvider({ children }) {
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current host on mount
  useEffect(() => {
    const fetchHost = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}hosts/current-host`,
          { withCredentials: true }
        );

        if (res.data?.data) {
          const h = res.data.data;

          const normalizedHost = {
            _id: h._id,
            email: h.email,
            username: h.username || h.email.split("@")[0],
            avatar: h.profile?.photo || null,
            profile: h.profile || {},
            createdAt: h.createdAt,
          };

          setHost(normalizedHost);
        } else {
          setHost(null);
        }
      } catch (err) {
        console.error("❌ Failed to fetch current host:", err);
        setHost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHost();
  }, []);

  return (
    <HostAuthContext.Provider value={{ host, setHost, loading }}>
      {children}
    </HostAuthContext.Provider>
  );
}