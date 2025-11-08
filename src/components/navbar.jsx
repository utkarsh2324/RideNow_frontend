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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <img src="/logo.png" alt="RideNow Logo" className="h-25 w-auto" />
        </NavLink>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!user && (
            <NavLink to="/host">
              <button className="cursor-pointer px-5 py-2 rounded-xl border-2 border-blue-900 bg-white text-blue-900 shadow-sm hover:bg-blue-900 hover:text-white transition-all duration-300">
                Host a Vehicle
              </button>
            </NavLink>
          )}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none cursor-pointer"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover border-2 border-blue-900"
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-blue-900" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-xl py-2 z-50 border border-gray-200">
                  <NavLink
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/document-verification"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Document Verification
                  </NavLink>
                  <NavLink
                    to="/rides"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Rides
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

          {!user && (
            <NavLink to="/login">
              <button className="cursor-pointer px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-md transition-all duration-300">
                Login / Signup
              </button>
            </NavLink>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-blue-900">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-lg shadow-md px-6 pb-4 space-y-4">
          {!user && (
            <NavLink to="/host" onClick={() => setIsOpen(false)}>
              <button className="w-full px-5 py-2 rounded-xl border-2 border-blue-900 bg-white text-blue-900 font-semibold shadow-sm hover:bg-blue-900 hover:text-white transition-all duration-300">
                Host a Vehicle
              </button>
            </NavLink>
          )}

          {user ? (
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover border-2 border-blue-900"
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-blue-900" />
                )}
                <span className="text-blue-900 font-semibold">
                  {user.username || "Profile"}
                </span>
              </NavLink>
              <NavLink
                to="/document-verification"
                onClick={() => setIsOpen(false)}
                className="text-blue-900 font-semibold"
              >
                Document Verification
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 mt-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-semibold"
              >
                <LogOut className="mr-2" /> Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" onClick={() => setIsOpen(false)}>
              <button className="w-full mt-2 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-md transition-all duration-300">
                Login / Signup
              </button>
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
}