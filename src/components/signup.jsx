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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg flex overflow-hidden">
        {/* Left Section */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

          <form
            className="flex flex-col gap-4"
            onSubmit={otpSent ? handleVerifyOtp : handleSignup}
          >
            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={email}
              disabled={otpSent} // disable once OTP sent
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={password}
              disabled={otpSent} // disable once OTP sent
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {!otpSent && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {/* OTP Field (only show after step 1) */}
            {otpSent && (
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                required
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            )}

            <button
              type="submit"
              className={`${
                otpSent
                  ? "bg-blue-900 hover:bg-blue-800"
                  : "bg-blue-900 hover:bg-blue-800"
              } text-white py-3 rounded-lg font-semibold transition`}
            >
              {otpSent ? "Verify OTP" : "Sign Up"}
            </button>
          </form>

          {/* OR Divider + Google Signup */}
          {!otpSent && (
            <>
              <div className="my-6 flex items-center">
                <hr className="flex-grow border-gray-300" />
                <span className="px-3 text-gray-400">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <div id="googleSignUp" className="w-full flex justify-center"></div>

              <p className="mt-6 text-center text-gray-600">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Login
                </span>
              </p>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex flex-1 bg-blue-900 text-white items-center justify-center p-10">
          <h2 className="text-3xl font-bold leading-snug text-center">
            Join Us Today! <br /> Create your account and start exploring 🚀
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Signup;