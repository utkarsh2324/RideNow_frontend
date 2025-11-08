// src/components/herosection.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function HeroSection() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const handleSearch = () => {
    if (!location.trim()) {
      toast.error("Please enter a valid location.");
      return;
    }

    // ✅ Build query string safely
    const query = new URLSearchParams({
      location,
      fromDate,
      toDate,
      fromTime,
      toTime,
    }).toString();

    navigate(`/search?${query}`);
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-scooty1.png')" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 text-center text-white px-6 w-full">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Ride Your Freedom with <span className="text-blue-900">RideNow</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Rent or Host a Scooty with ease and flexibility.
        </p>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto bg-white/20 backdrop-blur-lg rounded-2xl p-6 space-y-4 shadow-lg">
          {/* Location */}
          <div className="text-left">
            <label className="block text-sm font-medium text-white mb-1">Location</label>
            <input
              type="text"
              placeholder="Enter Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="block text-sm font-medium text-white mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800"
              />
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-white mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800"
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="block text-sm font-medium text-white mb-1">From Time</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800"
              />
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-white mb-1">To Time</label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="cursor-pointer w-full px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-md transition-all duration-300"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}