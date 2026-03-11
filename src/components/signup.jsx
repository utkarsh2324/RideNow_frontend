import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 1: Signup (register & send OTP)
  const handleSignup = async (e) => {
    e.preventDefault();
    const emailInput = e.target.email.value;
    const passwordInput = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (passwordInput !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Signup successful! OTP has been sent to your email.");
      setOtpSent(true);
      setEmail(emailInput);
      setPassword(passwordInput);
    } catch (err) {
      alert(err.message);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("OTP verified! Signup complete 🎉");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  // Google Signup
  const handleGoogleCredential = async (response) => {
    try {
      const token = response.credential;
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Google signup successful");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  // Init Google
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Google Client ID not found. Check .env");
      return;
    }

    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignUp"),
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
          <div className="w-full lg:w-[50%] flex flex-col order-2 lg:order-1">
            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-blue-950 leading-[1.05] tracking-tight mb-6">
              Unlock Your <br className="hidden lg:block" /> Next Adventure
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-lg mb-8">
              Sign up in seconds to access thousands of vehicles hosted by local experts.
            </p>
            <div className="hidden lg:flex flex-col gap-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-950 shrink-0 border border-blue-100 text-xl">
                   ✨
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950">Seamless Booking</h3>
                  <p className="text-slate-500 font-medium">Found a ride? Book it in two taps.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-950 shrink-0 border border-blue-100 text-xl">
                   🔒
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950">Verifiable Truth</h3>
                  <p className="text-slate-500 font-medium">Bank-level security & document checks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full lg:w-[50%] flex lg:justify-end order-1 lg:order-2">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-blue-950 mb-2">Create Account</h2>
                <p className="text-slate-500 font-medium">Join us and start your journey today.</p>
              </div>

              <form
                className="flex flex-col gap-4"
                onSubmit={otpSent ? handleVerifyOtp : handleSignup}
              >
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      disabled={otpSent}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium disabled:opacity-60 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Password Fields */}
                  <div className={`transition-all duration-300 overflow-hidden ${otpSent ? 'max-h-0 opacity-0' : 'max-h-64 opacity-100 space-y-4'}`}>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required={!otpSent}
                        value={password}
                        disabled={otpSent}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        required={!otpSent}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium"
                      />
                    </div>
                  </div>

                  {/* OTP Field Area */}
                  <div className={`transition-all duration-500 overflow-hidden ${!otpSent ? 'max-h-0 opacity-0 hidden' : 'max-h-32 opacity-100 mt-2'}`}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Verification Code</label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      required={otpSent}
                      className="w-full px-4 py-3.5 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-slate-900 font-bold tracking-widest text-center text-lg"
                    />
                    <p className="text-xs text-blue-800 font-medium text-center mt-3">We sent a code to your email.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`mt-4 w-full py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-all duration-300 text-white ${
                    otpSent 
                      ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" 
                      : "bg-blue-950 hover:bg-blue-900 shadow-lg shadow-blue-950/20"
                  }`}
                >
                  {otpSent ? "Verify Account" : "Sign Up"}
                </button>
              </form>

              {/* OR Divider + Google Signup */}
              {!otpSent && (
                <div className="animate-in fade-in duration-500 fade-in">
                  <div className="my-8 flex items-center">
                    <div className="flex-grow h-px bg-slate-200"></div>
                    <span className="px-4 text-xs text-slate-400 font-bold uppercase tracking-wider">or register with</span>
                    <div className="flex-grow h-px bg-slate-200"></div>
                  </div>

                  <div id="googleSignUp" className="w-full flex justify-center"></div>

                  <p className="mt-8 text-center text-slate-600 font-medium">
                    Already have an account?{" "}
                    <span
                      onClick={() => navigate("/login")}
                      className="text-blue-950 hover:text-blue-800 hover:underline cursor-pointer font-bold"
                    >
                      Log In
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;