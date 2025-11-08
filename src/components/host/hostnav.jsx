import { useState, useRef, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HostAuthContext } from "./hostauth";
import { Menu, X, UserCircle, LogOut, Bell, CheckCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function HostNavbar() {
  const { host, setHost, loading } = useContext(HostAuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Fetch Notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}hosts/notifications/my`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load notifications");
    }
  };

  // Fetch notifications when logged in
  useEffect(() => {
    if (host) fetchNotifications();
  }, [host]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!host) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [host]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}hosts/logout`,
        {},
        { withCredentials: true }
      );
      setHost(null);
      toast.success("Logged out successfully");
      navigate("/host/login");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed");
    }
  };

  if (loading) return null;

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <NavLink to="/host" className="flex items-center">
          <img src="/logo.png" alt="RideNow Logo" className="h-25 w-auto" />
        </NavLink>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {/* 🔔 Notifications */}
          {host && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="cursor-pointer relative text-blue-900 hover:text-blue-800 focus:outline-none"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white shadow-xl rounded-xl py-2 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm font-semibold border-b text-gray-600">
                    Notifications
                  </div>

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                          !n.isRead ? "bg-gray-50" : "bg-white"
                        }`}
                        onClick={() => markAsRead(n._id)}
                      >
                        <div className="font-semibold text-blue-900 flex items-center gap-2">
                          {n.isRead && (
                            <CheckCircle size={14} className="text-green-500" />
                          )}
                          {n.title}
                        </div>
                        <p className="text-sm text-gray-600">{n.message}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No new notifications
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 👤 Host Profile Dropdown */}
          {host && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none cursor-pointer"
              >
                {host.avatar ? (
                  <img
                    src={host.avatar}
                    alt="Host Avatar"
                    className="h-10 w-10 rounded-full object-cover border-2 border-blue-900"
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-blue-900" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-xl py-2 z-50 border border-gray-200">
                  <NavLink
                    to="/host/profile"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/host/document-verification"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Document Verification
                  </NavLink>
                  <NavLink
                    to="/host/hostavehicle"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Host-Vehicle
                  </NavLink>
                  <NavLink
                    to="/host/bookings"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Bookings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 mt-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-semibold"
                  >
                    <LogOut className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {!host && (
            <NavLink to="/host/login">
              <button className="cursor-pointer px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-md transition-all duration-300">
                Login / Signup
              </button>
            </NavLink>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-blue-900">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>
  );
}