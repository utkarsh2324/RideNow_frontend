import { useState, useRef, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "./auth";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const { user, setUser, loading } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}users/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Render nothing while loading
  if (loading) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-white/30 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <NavLink to="/" className="flex items-center group mt-2">
          <img src="/logo.png" alt="RideNow Logo" className="h-24 w-auto drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
        </NavLink>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-6">
          {!user && (
            <NavLink to="/host">
              <button className="cursor-pointer px-6 py-2.5 rounded-full border border-blue-900/20 bg-white/80 text-blue-950 font-medium shadow-sm hover:shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ring-1 ring-black/5">
                Host a Vehicle
              </button>
            </NavLink>
          )}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none cursor-pointer flex items-center justify-center h-11 w-11 rounded-full bg-white/60 border border-white shadow-sm hover:shadow active:scale-95 transition-all duration-300"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-7 w-7 text-blue-950" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl py-2 z-50 border border-white/50 overflow-hidden text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                  <NavLink
                    to="/profile"
                    className="flex items-center px-5 py-3 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/document-verification"
                    className="flex items-center px-5 py-3 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Document Verification
                  </NavLink>
                  <NavLink
                    to="/rides"
                    className="flex items-center px-5 py-3 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Rides
                  </NavLink>
                  <div className="h-px bg-slate-200/60 my-1 mx-3" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-5 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <NavLink to="/login">
              <button className="cursor-pointer px-6 py-2.5 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300">
                Login / Signup
              </button>
            </NavLink>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-blue-950 p-2 bg-white/50 rounded-full shadow-sm">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl px-6 py-6 flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
          {!user && (
            <NavLink to="/host" onClick={() => setIsOpen(false)}>
              <button className="w-full px-5 py-3 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-900 font-medium hover:bg-blue-100 transition-colors">
                Host a Vehicle
              </button>
            </NavLink>
          )}

          {user ? (
            <div className="flex flex-col space-y-3">
              <NavLink
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserCircle className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <span className="block text-slate-800 font-semibold">
                    {user.username || "Profile"}
                  </span>
                  <span className="block text-xs text-slate-500">View account</span>
                </div>
              </NavLink>
              <div className="h-px bg-slate-100 my-1" />
              <NavLink
                to="/document-verification"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Document Verification
              </NavLink>
              <NavLink
                to="/rides"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Rides
              </NavLink>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium mt-2"
              >
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" onClick={() => setIsOpen(false)}>
              <button className="w-full mt-2 px-5 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-medium shadow-md hover:shadow-lg transition-all">
                Login / Signup
              </button>
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
}