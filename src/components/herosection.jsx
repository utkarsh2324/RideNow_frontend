// src/components/herosection.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "lucide-react";
import toast from "react-hot-toast";

export default function HeroSection() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const [locating, setLocating] = useState(false);

  /* ---------------- USE GPS ---------------- */

  const handleUseGPS = () => {
    document.activeElement?.blur(); // close keyboard
  
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
  
    setLocating(true);
  
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = coords.latitude;
        const longitude = coords.longitude;
  
        setLat(latitude);
        setLng(longitude);
  
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}location/reverse?lat=${latitude}&lng=${longitude}`,
            { credentials: "include" }
          );
  
          const data = await res.json();
  
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "Your location";
  
          setLocation(city);
          toast.success(`Location set to ${city}`);
        } catch {
          toast.error("Failed to fetch location name");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast("📍 Please allow location access", { icon: "⚠️" });
        setLocating(false);
      }
    );
  };

  /* ---------------- SEARCH ---------------- */

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter a valid location.");
      return;
    }
  
    if (!fromDate || !toDate || !fromTime || !toTime) {
      toast.error("Please select date and time.");
      return;
    }
  
    let latitude = lat;
    let longitude = lng;
  
    // ✅ Convert typed location → lat/lng
    if (
      latitude === null ||
      longitude === null ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}location/reverse?lat=${latitude}&lng=${longitude}`,
          { credentials: "include" }
        );
  
        const data = await res.json();
  
        if (!data.length) {
          toast.error("Location not found");
          return;
        }
  
        latitude = Number(data[0].lat);
        longitude = Number(data[0].lon);
  
        setLat(latitude);
        setLng(longitude);
      } catch {
        toast.error("Failed to locate entered place");
        return;
      }
    }
  
    navigate(
      `/search?location=${encodeURIComponent(location)}` +
        `&lat=${latitude}` +
        `&lng=${longitude}` +
        `&fromDate=${fromDate}` +
        `&toDate=${toDate}` +
        `&fromTime=${fromTime}` +
        `&toTime=${toTime}`
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-scooty2.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 w-full">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Ride Your Freedom with{" "}
          <span className="text-blue-900">RideNow</span>
        </h1>

        <p className="text-lg md:text-xl mb-8 opacity-90">
          Rent or Host a Scooty with ease and flexibility.
        </p>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto bg-white/20 backdrop-blur-lg rounded-2xl p-6 space-y-4 shadow-lg">

          {/* Location */}
          {/* Location */}
<div className="text-left">
  <label className="block text-sm font-medium text-white mb-1">
    Location
  </label>

  <div className="flex gap-2 items-stretch">
  <input
    type="text"
    placeholder="Enter Location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-gray-800 text-base"
  />

  <button
    type="button"
    onClick={handleUseGPS}
    disabled={locating}
    className="min-w-[48px] min-h-[48px] flex items-center justify-center
               bg-blue-900 text-white rounded-xl
               active:scale-95 transition
               disabled:opacity-60"
    title="Use current location"
  >
    <Navigation size={20} />
  </button>
</div>

  {/* ✅ GPS status */}
  {lat && lng ? (
    <p className="text-green-200 text-sm mt-1">
      📍 Using your current location
    </p>
  ) : (
    <p className="text-yellow-200 text-sm mt-1">
      💡 Tip: Choose GPS for better nearby results
    </p>
  )}
</div>

          {/* Dates */}
          
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="text-left">
    <label className="block text-sm font-medium text-white mb-1">
      From Date
    </label>
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 appearance-none"
    />
  </div>

  <div className="text-left">
    <label className="block text-sm font-medium text-white mb-1">
      To Date
    </label>
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 appearance-none"
    />
  </div>
</div>

          {/* Times */}
          {/* Times */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="text-left">
    <label className="block text-sm font-medium text-white mb-1">
      From Time
    </label>
    <input
      type="time"
      value={fromTime}
      onChange={(e) => setFromTime(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 appearance-none"
    />
  </div>

  <div className="text-left">
    <label className="block text-sm font-medium text-white mb-1">
      To Time
    </label>
    <input
      type="time"
      value={toTime}
      onChange={(e) => setToTime(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 appearance-none"
    />
  </div>
</div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-md transition"
          >
            Search
          </button>
        </div>
      </div>
{/* Footer */}
<div className="absolute bottom-4 w-full text-center text-white text-sm opacity-90 px-4 z-10">
  <p className="font-medium">
    © 2026 RideNow. All rights reserved.
  </p>
  <p className="mt-1 text-l md:text-xl font-bold opacity-80">
    For support:{" "}
    <span className="font-medium">+91 8707230485</span> |{" "}
    <span className="font-medium">+91 6387634132</span>
  </p>
</div>
    </section>
  );
}