import { useNavigate, NavLink } from "react-router-dom";
import { useContext } from "react";
import { ShieldCheck, Wallet, Timer, Star } from "lucide-react";
import { HostAuthContext } from "./hostauth"; // ✅ Make sure this context provides `host`

export default function HostHome() {
  const navigate = useNavigate();
  const { host } = useContext(HostAuthContext); // ✅ Get logged-in host info

  // 🚀 Conditional navigation handler
  const handleNavigation = () => {
    if (host && host.email) {
      navigate("/host/hostavehicle");
    } else {
      navigate("/host/login");
    }
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20 px-6 md:px-16 overflow-hidden">
        {/* Left Content */}
        <div className="flex flex-col items-start text-left space-y-6 md:w-1/2 z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Turn Your 2-Wheeler into an Earning Machine
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-lg">
            Join thousands of hosts earning passive income by sharing their 2-wheelers on RideNow.
            List your scooter or bike in minutes and start earning effortlessly.
          </p>

          {/* 🚀 "Host Your Vehicle" Button */}
          <button
            onClick={handleNavigation}
            className="cursor-pointer mt-4 inline-block bg-white text-blue-900 font-semibold px-8 py-3 rounded-xl shadow-md hover:bg-blue-100 transition-all duration-300"
          >
            Host Your Vehicle
          </button>
        </div>

        {/* Right Image */}
        <div className="mt-12 md:mt-0 md:w-1/2 flex justify-center relative">
          <img
            src="/hosthomephoto.jpeg"
            alt="Host your vehicle"
            className="w-[90%] max-w-md md:max-w-lg lg:max-w-xl drop-shadow-2xl rounded-2xl object-cover"
          />
          <div className="absolute -z-10 top-10 right-10 w-72 h-72 bg-blue-700 blur-3xl opacity-30 rounded-full"></div>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-b from-blue-50 to-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
          Earn Up To ₹10,500 Per Month
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Hosting your vehicle on RideNow helps you turn idle time into income.
          We handle bookings, insurance, and support — you simply share your 2-wheeler and earn.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 w-72 border border-blue-100">
            <h3 className="text-blue-900 font-bold text-2xl mb-2">₹300-400/day</h3>
            <p className="text-gray-600">Average daily earning for short city rides</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 w-72 border border-blue-100">
            <h3 className="text-blue-900 font-bold text-2xl mb-2">₹2500/week</h3>
            <p className="text-gray-600">Average weekly earnings for active hosts</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 w-72 border border-blue-100">
            <h3 className="text-blue-900 font-bold text-2xl mb-2">₹10000+/month</h3>
            <p className="text-gray-600">Top scooter hosts in metro cities</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 md:px-16 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-12">
          Why Become a RideNow Host?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center">
            <Wallet className="h-12 w-12 text-blue-900 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Earn Effortlessly</h3>
            <p className="text-gray-600 text-sm">
              Let your 2-wheeler pay for itself while you’re not using it.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-12 w-12 text-blue-900 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Full Insurance</h3>
            <p className="text-gray-600 text-sm">
              Every trip is protected by industry-leading insurance and support.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Timer className="h-12 w-12 text-blue-900 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Fast Setup</h3>
            <p className="text-gray-600 text-sm">
              List your bike or scooter in minutes and start getting bookings right away.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Star className="h-12 w-12 text-blue-900 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Trusted Platform</h3>
            <p className="text-gray-600 text-sm">
              Thousands of satisfied hosts across India trust RideNow.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-b from-blue-50 to-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-10">
          How Hosting Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-blue-100">
            <h3 className="text-blue-900 font-semibold text-xl mb-3">1. List Your Vehicle</h3>
            <p className="text-gray-600">
              Upload your 2-wheeler details and documents — it only takes a few minutes.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 border border-blue-100">
            <h3 className="text-blue-900 font-semibold text-xl mb-3">2. Provide Availability</h3>
            <p className="text-gray-600">
              Choose your availability when you are not using it.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 border border-blue-100">
            <h3 className="text-blue-900 font-semibold text-xl mb-3">3. Earn Easily</h3>
            <p className="text-gray-600">
              Hand over your vehicle and start earning passive income every trip.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center bg-blue-900 text-white">
        <h2 className="text-4xl font-bold mb-4">Start Earning from Your Vehicle Today</h2>
        <p className="text-blue-100 text-lg mb-10">
          Join RideNow’s growing host community and make your 2-wheeler work for you.
        </p>
        <button
          onClick={handleNavigation}
          className="cursor-pointer bg-white text-blue-900 font-semibold px-8 py-3 rounded-xl shadow-md hover:bg-blue-100 transition-all duration-300"
        >
          List Your Vehicle Now
        </button>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} RideNow Host Platform. All rights reserved.
      </footer>
    </div>
  );
}