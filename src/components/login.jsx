import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // ✅ Safe JSON parser
  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // ✅ Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}users/login`, {
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

      const u = data?.data;
      if (!u) {
        toast.error("Invalid response from server.");
        return;
      }

      setUser({
        _id: u._id,
        email: u.email,
        username: u.username || u.email.split("@")[0],
        avatar: u.profile?.photo || null,
        profile: u.profile || {},
      });

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ✅ Google login
  const handleGoogleCredential = async (response) => {
    try {
      const token = response.credential;
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}users/google-login`,
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

      const u = data?.data?.user;
      if (!u) {
        toast.error("Google login failed. Try again.");
        return;
      }

      setUser({
        _id: u._id,
        email: u.email,
        username: u.username || u.email.split("@")[0],
        avatar: u.profile?.photo || null,
        profile: u.profile || {},
      });

      toast.success("Logged in with Google!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Google login failed. Please try again.");
    }
  };

  // ✅ Initialize Google Button
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg flex overflow-hidden">
        {/* Left Section */}
        <div className="hidden md:flex flex-1 bg-blue-900 text-white items-center justify-center p-10">
          <h2 className="text-3xl font-bold leading-snug">
            Welcome Back! <br /> Sign in to continue 🎬
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Login
            </button>
          </form>

          <div className="my-6 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-400">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Sign-In Button */}
          <div id="googleSignIn" className="w-full flex justify-center"></div>

          <p className="mt-6 text-center text-gray-600">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;