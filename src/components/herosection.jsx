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
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
        );
  
        const data = await res.json();
  
        if (!data || data.length === 0) {
          toast.error("Location not found. Please try a different area.");
          return;
        }
  
        latitude = Number(data[0].lat);
        longitude = Number(data[0].lon);
  
        setLat(latitude);
        setLng(longitude);
      } catch {
        toast.error("Failed to locate entered place. Check your connection.");
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

  return (
    <>
    <section className="bg-white min-h-[calc(100vh-80px)] pt-24 pb-12 flex items-center relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Left Content Form */}
          <div className="w-full lg:w-[45%] flex flex-col pt-4 lg:pt-0">
            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-blue-950 leading-[1.05] tracking-tight mb-8">
              Request a ride for now or later
            </h1>
            
            {/* Form */}
            <div className="w-full max-w-md relative z-10">
              {/* Input Group */}
              <div className="relative flex flex-col gap-3 mb-8">
                {/* Connecting Line */}
                <div className="absolute left-[20px] top-[40px] bottom-[110px] w-0.5 bg-slate-300 z-0 hidden sm:block"></div>

                {/* Location */}
                <div className="relative flex items-center bg-slate-100 rounded-lg px-4 py-3.5 z-10 hover:bg-slate-200 transition-colors focus-within:ring-2 focus-within:ring-blue-950">
                  {/* GPS Helper Text */}
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-950 shrink-0 mr-4"></div>
                  <input
                    type="text"
                    placeholder="Pickup location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 bg-transparent border-none text-blue-950 font-medium text-lg placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={handleUseGPS}
                    disabled={locating}
                    className="ml-2 text-blue-950 hover:text-slate-600 transition-colors shrink-0 p-1.5 rounded-full hover:bg-slate-300"
                    title="Use current location"
                  >
                    <Navigation size={20} className={locating ? "animate-pulse" : ""} />
           
                  </button>
                  <p className="text-xs text-slate-500 ml-2 mt-1">
  Tip: Use GPS for more accurate results
</p>
                </div>

                {/* Pickup Date & Time */}
                <div className="flex flex-col gap-1 z-10">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1">Pickup</span>
                  <div className="relative flex flex-col sm:flex-row gap-3">
                     <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3.5 flex-1 hover:bg-slate-200 transition-colors focus-within:ring-2 focus-within:ring-blue-950">
                        <div className="w-2.5 h-2.5 bg-blue-950 shrink-0 mr-4 sm:hidden"></div>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full bg-transparent border-none text-blue-950 font-medium text-lg focus:outline-none"
                          required
                        />
                     </div>
                     <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3.5 sm:w-1/3 hover:bg-slate-200 transition-colors focus-within:ring-2 focus-within:ring-blue-950">
                        <input
                          type="time"
                          value={fromTime}
                          onChange={(e) => setFromTime(e.target.value)}
                          className="w-full bg-transparent border-none text-blue-950 font-medium text-lg focus:outline-none"
                          required
                        />
                     </div>
                  </div>
                </div>
                
                {/* Dropoff Date & Time */}
                <div className="flex flex-col gap-1 z-10 mt-2 sm:mt-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1">Return</span>
                  <div className="relative flex flex-col sm:flex-row gap-3">
                     <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3.5 flex-1 hover:bg-slate-200 transition-colors focus-within:ring-2 focus-within:ring-blue-950">
                        <div className="w-2.5 h-2.5 border-2 border-blue-950 shrink-0 mr-4 sm:hidden"></div>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full bg-transparent border-none text-blue-950 font-medium text-lg focus:outline-none"
                          title="Return Date"
                          required
                        />
                     </div>
                     <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3.5 sm:w-1/3 hover:bg-slate-200 transition-colors focus-within:ring-2 focus-within:ring-blue-950">
                        <input
                          type="time"
                          value={toTime}
                          onChange={(e) => setToTime(e.target.value)}
                          className="w-full bg-transparent border-none text-blue-950 font-medium text-lg focus:outline-none"
                          title="Return Time"
                          required
                        />
                     </div>
                  </div>
                </div>

              </div>

              <button
                onClick={handleSearch}
                className="bg-blue-950 hover:bg-blue-900 text-white font-bold tracking-wide text-lg px-8 py-4 rounded-lg transition-all cursor-pointer w-max active:scale-[0.98]"
              >
                Search Vehicles
              </button>
            </div>
            
          </div>

          {/* Right Map Embed */}
          <div className="w-full lg:w-[50%] flex justify-end relative h-[500px] lg:h-[600px]">
            <div className="w-full h-full max-w-[600px] overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl border border-slate-100 relative">
               <iframe
                 title="Google Map"
                 src={
                   lat && lng
                     ? `https://maps.google.com/maps?q=${lat},${lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                     : "https://maps.google.com/maps?q=India&t=&z=5&ie=UTF8&iwloc=&output=embed"
                 }
                 width="100%"
                 height="100%"
                 style={{ border: 0 }}
                 allowFullScreen=""
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
                 className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
               ></iframe>
            </div>
          </div>
          
        </div>
      </div>
    </section>

    {/* Footer / Support */}
    <footer className="bg-white border-t border-slate-200 py-8 px-6">
      <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2">
          <div className="bg-blue-950 rounded-lg p-1.5 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-blue-950 text-xl tracking-tight">RideNow</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
          <p className="text-slate-500 font-medium text-sm">
            © {new Date().getFullYear()} RideNow. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-bold text-slate-700">Support:</span>
            <a href="tel:+918707230485" className="text-blue-600 font-bold text-sm hover:underline">+91 8707230485 / 6387634132</a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}