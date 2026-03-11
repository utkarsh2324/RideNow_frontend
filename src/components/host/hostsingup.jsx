import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HostSignup = () => {
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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput, password: passwordInput }),
          credentials: "include",
        }
      );

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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("OTP verified! Host account created successfully 🎉");
      navigate("/host/login");
    } catch (err) {
      alert(err.message);
    }
  };

  // Google Signup
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Google signup successful");
      navigate("/host/login");
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
          document.getElementById("googleHostSignUp"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white min-h-screen pt-28 pb-12 flex items-center relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-12 lg:gap-20">

          {/* Right Text (Actually Left visually, but reversed in flex) */}
          <div className="w-full lg:w-[50%] flex flex-col">
            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-blue-950 leading-[1.05] tracking-tight mb-6 mt-8 lg:mt-0">
              Become a Host <br className="hidden lg:block" /> today.
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-lg mb-8">
              Unlock a new stream of income. List your vehicles with confidence on our secure and trusted platform.
            </p>
            
            <ul className="space-y-5">
              {[
                { icon: "🛡️", text: "Comprehensive insurance coverage" },
                { icon: "⚡", text: "Guaranteed instant payouts" },
                { icon: "🌟", text: "Verified and trusted renters" }
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {benefit.icon}
                  </div>
                  <span className="text-slate-700 font-bold text-lg">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Left Form (Actually Right visually, but reversed in flex) */}
          <div className="w-full lg:w-[50%] flex lg:justify-start">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-blue-950 mb-2">Apply to Host</h2>
                <p className="text-slate-500 font-medium">
                  {otpSent ? "Verify your email to complete registration." : "Create your host account in seconds."}
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={otpSent ? handleVerifyOtp : handleSignup}>
                <div className={otpSent ? "opacity-60 cursor-not-allowed" : ""}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    disabled={otpSent}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {!otpSent && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Create a strong password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Repeat your password"
                        required
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all text-blue-950 font-medium"
                      />
                    </div>
                  </>
                )}

                {otpSent && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 flex justify-between items-center">
                      <span>One-Time Password</span>
                      <span className="text-emerald-600 text-xs font-bold">Sent to email</span>
                    </label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      className="w-full bg-slate-50 border border-slate-200 text-center tracking-[0.5em] text-2xl rounded-xl px-4 py-4 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all font-bold placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 w-full py-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl font-bold text-lg active:scale-[0.98] transition-all duration-300 shadow-lg shadow-blue-950/20 cursor-pointer"
                >
                  {otpSent ? "Verify & Create Account" : "Submit Application"}
                </button>
              </form>

              {!otpSent && (
                <>
                  <div className="my-8 flex items-center">
                    <div className="flex-grow h-px bg-slate-200"></div>
                    <span className="px-4 text-xs text-slate-400 font-bold uppercase tracking-wider">or continue with</span>
                    <div className="flex-grow h-px bg-slate-200"></div>
                  </div>

                  <div id="googleHostSignUp" className="w-full flex justify-center"></div>

                  <p className="mt-8 text-center text-slate-600 font-medium">
                    Already an approved host?{" "}
                    <button
                      onClick={() => navigate("/host/login")}
                      className="text-blue-950 hover:text-blue-800 hover:underline cursor-pointer font-bold"
                    >
                      Log in here
                    </button>
                  </p>
                </>
              )}

              {otpSent && (
                <p className="text-center text-sm text-slate-500 mt-6 font-medium">
                  Didn't receive the email? Check your spam folder or try again later.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HostSignup;