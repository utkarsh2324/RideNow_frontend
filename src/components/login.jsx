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

      const u = data?.data?.user;
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

      // 🔹 FIXED: safer extraction
      const u = data?.data?.user || data?.data || {};

      if (!u?._id) {
        toast.error("Google login failed. Try again.");
        console.log("Invalid response:", data);
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
    <div className="bg-white min-h-screen pt-28 pb-12 flex items-center relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

          {/* Left Text */}
          <div className="w-full lg:w-[50%] flex flex-col">
            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-blue-950 leading-[1.05] tracking-tight mb-6">
              Welcome back to <br className="hidden lg:block" /> RideNow
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-lg mb-8">
              Log in to discover premium scooters, easily manage your bookings, and enjoy the ride.
            </p>
            <div className="hidden lg:flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xl">🛵</div>
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xl">⚡</div>
                <div className="w-12 h-12 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-xl">🌟</div>
              </div>

            </div>
          </div>

          {/* Right Form */}
          <div className="w-full lg:w-[50%] flex lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-blue-950 mb-2">Sign In</h2>
                <p className="text-slate-500 font-medium">Please enter your details to continue.</p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <span className="text-sm font-semibold text-blue-950 hover:text-blue-800 cursor-pointer transition-colors">Forgot password?</span>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full py-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl font-bold text-lg active:scale-[0.98] transition-all duration-300 shadow-lg shadow-blue-950/20"
                >
                  Sign In
                </button>
              </form>

              <div className="my-8 flex items-center">
                <div className="flex-grow h-px bg-slate-200"></div>
                <span className="px-4 text-xs text-slate-400 font-bold uppercase tracking-wider">or continue with</span>
                <div className="flex-grow h-px bg-slate-200"></div>
              </div>

              {/* Google Sign-In Button Container */}
              <div id="googleSignIn" className="w-full flex justify-center"></div>

              <p className="mt-8 text-center text-slate-600 font-medium">
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-blue-950 hover:text-blue-800 hover:underline cursor-pointer font-bold"
                >
                  Sign up
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;