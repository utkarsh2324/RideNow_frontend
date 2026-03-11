import { useNavigate, NavLink } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ShieldCheck, Wallet, Timer, Star, Search, MapPin, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { HostAuthContext } from "./hostauth";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔥 Map Recenter Component
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 11, { animate: true });
  }, [lat, lng, map]);
  return null;
}

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

  const [days, setDays] = useState(7);
  const [vehicles, setVehicles] = useState([]);
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Default Hyderabad
  const [locationName, setLocationName] = useState("Hyderabad");
  const [avgPrice, setAvgPrice] = useState(400);
  const [locating, setLocating] = useState(false);

  // 🚀 Use GPS implementation
  const handleUseGPS = () => {
    document.activeElement?.blur();
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = coords.latitude;
        const longitude = coords.longitude;
        setMapCenter([latitude, longitude]);

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

          setLocationName(city);
          toast.success(`Location set to ${city}`);
          fetchMapVehicles(city, latitude, longitude);
        } catch {
          toast.error("Failed to fetch location name");
          fetchMapVehicles("", latitude, longitude);
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Please allow location access");
        setLocating(false);
      }
    );
  };

  // 🚀 Fetch nearby vehicles for the map
  const fetchMapVehicles = async (cityName, customLat = null, customLng = null) => {
    try {
      let searchLat = customLat;
      let searchLng = customLng;

      // 🌍 If we have a city name but no coordinates, geocode it first!
      // This ensures we always trigger the backend's 50km radius search instead of strict text matching.
      if (cityName && !searchLat && !searchLng) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            searchLat = parseFloat(geoData[0].lat);
            searchLng = parseFloat(geoData[0].lon);
            setMapCenter([searchLat, searchLng]);
          }
        } catch (geoErr) {
          console.error("Geocoding failed:", geoErr);
        }
      }

      // Use dummy far-future dates to get all available
      const fromDate = "2026-12-01";
      const toDate = "2026-12-02";
      const fromTime = "10:00";
      const toTime = "11:00";

      let url = `${import.meta.env.VITE_BACKEND_URL}vehicles/search?fromDate=${fromDate}&toDate=${toDate}&fromTime=${fromTime}&toTime=${toTime}`;

      // Send Coordinates if available to trigger the $geoNear 50km radius
      if (searchLat && searchLng) {
        url += `&lat=${searchLat}&lng=${searchLng}`;
      } else if (cityName) {
        url += `&location=${encodeURIComponent(cityName)}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (res.ok && data.data && data.data.length > 0) {
        setVehicles(data.data);

        let total = 0;
        data.data.forEach(v => {
          total += (v.pricing?.weekdayPrice || 400);
        });
        setAvgPrice(Math.round(total / data.data.length));

        // Recenter to the first vehicle if lat/lng are completely missing
        if (data.data[0]?.pickupLocation?.coordinates?.coordinates && (!searchLat || !searchLng)) {
          setMapCenter([
            data.data[0].pickupLocation.coordinates.coordinates[1],
            data.data[0].pickupLocation.coordinates.coordinates[0]
          ]);
        }
      } else {
        setVehicles([]);
        setAvgPrice(400); // fallback
      }
    } catch (error) {
      console.error("Map fetch error:", error);
    }
  };

  useEffect(() => {
    fetchMapVehicles(locationName);
  }, []);

  // 🚀 Map Custom Marker format (like Airbnb price tags)
  const createPriceMarker = (price) => {
    return L.divIcon({
      className: "custom-price-marker",
      html: `<div style="background: white; border-radius: 20px; padding: 6px 12px; font-weight: bold; font-size: 14px; box-shadow: 0px 4px 15px rgba(0,0,0,0.15); color: #1e3a8a; border: 1px solid #e2e8f0; display: inline-block; white-space: nowrap; transform: translate(-50%, -50%); transition: all 0.2s;">₹${price}</div>`,
      iconSize: [0, 0] // the CSS handles size
    });
  };

  const estimatedEarnings = (avgPrice * days).toLocaleString('en-IN');

  return (
    <div className="bg-slate-50 text-blue-950 font-sans selection:bg-indigo-200">
      {/* Hero Section (Airbnb Style) */}
      <section className="bg-white min-h-[calc(100vh-80px)] pt-32 pb-16 flex items-center relative overflow-hidden text-slate-900 border-b border-slate-100">
        <div className="max-w-[1300px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

            {/* Left Content (Estimator) */}
            <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-center text-center pt-4 lg:pt-0">
              <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-bold text-blue-950 leading-[1.05] tracking-tight mb-6 max-w-lg">
                Your 2-wheeler could make <span className="text-emerald-600 block mt-2">₹{estimatedEarnings}</span> on RideNow
              </h1>

              <div className="flex flex-col items-center mb-10 w-full max-w-sm">
                <p className="text-slate-500 font-bold mb-6 text-lg">
                  <span className="text-blue-950">{days} days</span> · ₹{avgPrice}/day
                </p>

                {/* Range Slider */}
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {/* Location Search Input */}
              <div className="bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full p-2 flex items-center w-full max-w-md focus-within:ring-2 focus-within:ring-blue-950 transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  placeholder="Enter a city to explore rates..."
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMapVehicles(locationName)}
                  className="flex-1 bg-transparent border-none text-blue-950 font-bold text-lg placeholder-slate-400 focus:outline-none w-full"
                />
                <button
                  onClick={handleUseGPS}
                  disabled={locating}
                  className="w-12 h-12 rounded-full bg-slate-100 text-blue-950 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0 m-1 disabled:opacity-50"
                  title="Use current location"
                >
                  <Navigation className={`w-5 h-5 ${locating ? "animate-pulse" : ""}`} />
                </button>
                <button
                  onClick={() => fetchMapVehicles(locationName)}
                  className="w-12 h-12 rounded-full bg-blue-950 text-white flex items-center justify-center hover:bg-blue-900 transition-colors shrink-0 m-1"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Map Image/Interactive */}
            <div className="w-full lg:w-[50%] flex justify-end relative h-[500px] lg:h-[650px] z-10">
              <div className="w-full h-full max-w-[600px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-slate-200 relative bg-slate-100">
                <MapContainer
                  center={mapCenter}
                  zoom={11}
                  scrollWheelZoom={false}
                  className="w-full h-full z-0"
                >
                  {/* Map Tiles */}
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <RecenterAutomatically lat={mapCenter[0]} lng={mapCenter[1]} />

                  {/* Render Custom Price Markers for local vehicles */}
                  {vehicles.map((v, idx) => {
                    const lat = v.pickupLocation?.coordinates?.coordinates?.[1];
                    const lng = v.pickupLocation?.coordinates?.coordinates?.[0];
                    if (lat && lng) {
                      return (
                        <Marker
                          key={v._id || idx}
                          position={[lat, lng]}
                          icon={createPriceMarker(v.pricing?.weekdayPrice || 400)}
                        />
                      );
                    }
                    return null;
                  })}

                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400]">
                    <div className="bg-white tracking-wide text-blue-950 font-bold px-6 py-3 rounded-full shadow-lg border border-slate-100 whitespace-nowrap">
                      Explore rates near you
                    </div>
                  </div>
                </MapContainer>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="py-24 px-6 md:px-16 bg-slate-50 text-center relative">
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-6 tracking-tight">
            Maximize your income potential
          </h2>
          <p className="text-xl text-slate-600 font-medium">
            Hosting your vehicle on RideNow helps you turn idle time into income.
            We handle bookings, insurance, and support — you simply share and earn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { amount: `₹${avgPrice}`, suffix: "/day", desc: "Average daily earning for local users", icon: "🏙️" },
            { amount: `₹${(avgPrice * 6).toLocaleString("en-IN")}+`, suffix: "/week", desc: "Average weekly earnings for active hosts", icon: "📈" },
            { amount: `₹${(avgPrice * 25).toLocaleString("en-IN")}+`, suffix: "/month", desc: "Top scooter hosts in your city", icon: "🏆" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <h3 className="text-blue-950 font-black text-3xl mb-3 flex items-baseline justify-center gap-1">
                {stat.amount}<span className="text-lg text-slate-500 font-medium">{stat.suffix}</span>
              </h3>
              <p className="text-slate-600 font-medium">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits & How It Works (Combined) */}
      <section className="py-24 px-6 md:px-16 bg-white relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 rounded-l-[4rem] -z-10 hidden lg:block"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Why Host */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-6 tracking-tight">
              Why partner with RideNow?
            </h2>
            <p className="text-xl text-slate-600 font-medium mb-12">
              We provide the tools and support you need to succeed as a host, absolutely risk-free.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950 mb-2">Comprehensive Insurance</h3>
                  <p className="text-slate-600 font-medium">Every trip is covered by our partner insurance, protecting your vehicle against damage and theft.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950 mb-2">Fast & Secure Payouts</h3>
                  <p className="text-slate-600 font-medium">Earnings are deposited directly into your bank account securely after every completed booking.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-950 mb-2">Verified Community</h3>
                  <p className="text-slate-600 font-medium">We rigorously verify every renter's identity and driving license before they can book your vehicle.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: How It Works Steps */}
          <div className="bg-blue-950 rounded-[3rem] p-10 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-50"></div>

            <h3 className="text-3xl font-extrabold mb-10 tracking-tight">How it works</h3>

            <div className="space-y-8 relative">
              {/* Connecting line */}
              <div className="absolute left-[1.15rem] top-4 bottom-4 w-px bg-slate-700"></div>

              {[
                { step: "1", title: "List Your Vehicle", desc: "Upload photos and details of your 2-wheeler. It's free and takes just 5 minutes." },
                { step: "2", title: "Set Availability", desc: "You're in control. Choose exactly when your vehicle is available for rent." },
                { step: "3", title: "Accept Bookings", desc: "Review and accept requests from verified renters." },
                { step: "4", title: "Earn & Repeat", desc: "Hand over the keys, sit back, and watch your earnings grow." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-white shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-4 border-blue-950">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                    <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Your vehicle.<br />Your rules. Your income.</h2>
          <p className="text-indigo-200 text-lg md:text-xl font-medium mb-10 max-w-2xl leading-relaxed">
            Join RideNow's growing host community today and turn your depreciation into appreciation.
          </p>
          <button
            onClick={handleNavigation}
            className="cursor-pointer bg-white text-blue-950 font-extrabold text-lg px-10 py-5 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Create Your Listing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="font-extrabold text-blue-950 text-xl tracking-tight">RideNow <span className="text-slate-400 font-medium">Host</span></span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
            <p className="text-slate-500 font-medium text-sm">
              © {new Date().getFullYear()} RideNow. All rights reserved.
            </p>
            <div className="flex gap-4 items-center">
              <span className="text-sm font-bold text-slate-700">Support:</span>
              <a href="tel:+918707230485" className="text-indigo-600 font-bold text-sm hover:underline">+91 8707230485/ 6387634132</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}