import { useEffect, useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HostAuthContext } from "./hostauth";
import toast from "react-hot-toast";

const HostLogin = () => {
  const navigate = useNavigate();
  const { setHost } = useContext(HostAuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const extractHost = (resp) => resp?.data?.host || resp?.data?.user || resp?.data || {};

  // ✅ Helper to safely parse JSON
  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // 🔹 Normal Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}hosts/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        toast.error(data?.message || "Invalid email or password");
        return;
      }

      const u = extractHost(data);
      setHost({
        _id: u._id,
        email: u.email,
        username: u.username || (u.email ? u.email.split("@")[0] : "HostUser"),
        avatar: u.profile?.photo || null,
        profile: u.profile || {},
      });

      toast.success("Login successful!");
      navigate("/host");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // 🔹 Google Login
  const handleGoogleCredential = async (response) => {
    try {
      const token = response.credential;
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        }
      );

      const data = await safeJson(res);

      if (!res.ok) {
        toast.error(data?.message || "Google login failed");
        return;
      }

      const u = extractHost(data);
      setHost({
        _id: u._id,
        email: u.email,
        username: u.username || (u.email ? u.email.split("@")[0] : "HostUser"),
        avatar: u.profile?.photo || null,
        profile: u.profile || {},
      });

      toast.success("Logged in with Google!");
      navigate("/host");
    } catch (err) {
      console.error(err);
      toast.error("Google login failed. Please try again.");
    }
  };

  // 🔹 Initialize Google Button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return console.error("Google Client ID missing");

    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(interval);
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignIn"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-16 px-4">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl border border-gray-200">
        <div className="flex-1 flex items-center justify-center px-8 py-12 md:px-16">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-blue-900 mb-6 text-center">
              Host Login
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Start earning passive income by hosting your 2-wheeler 🚀
            </p>

            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-blue-700 hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className="bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition duration-300"
              >
                Login
              </button>

              <p className="text-center text-gray-600 mt-4">
                Don’t have an account?{" "}
                <Link
                  to="/host/signup"
                  className="text-blue-700 font-semibold hover:underline"
                >
                  Create one
                </Link>
              </p>
            </form>

            <div className="mt-6 text-center text-gray-500">or</div>
            <div id="googleSignIn" className="mt-4 flex justify-center"></div>
          </div>
        </div>

        <div className="flex-1 bg-blue-900 text-white flex flex-col justify-center items-center p-10">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Turn Your Scooter Into Earnings 🛵
          </h2>
          <p className="text-blue-100 text-center mb-6 max-w-sm">
            Join our host network and earn every day while helping others move
            freely. Host your 2-wheeler effortlessly and get instant payouts!
          </p>
          <img
            src="/Hostlogin.png"
            alt="Host Benefits"
            className="w-72 md:w-80 lg:w-96 animate-bounce-slow"
          />
        </div>
      </div>
    </div>
  );
};

export default HostLogin;