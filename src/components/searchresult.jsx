import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SearchResults() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);

  // 🔍 Query params
  const locationParam = queryParams.get("location");
  const lat = queryParams.get("lat");
  const lng = queryParams.get("lng");
  const fromDate = queryParams.get("fromDate");
  const toDate = queryParams.get("toDate");
  const fromTime = queryParams.get("fromTime");
  const toTime = queryParams.get("toTime");

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH VEHICLES ---------------- */

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      let url =
        `${import.meta.env.VITE_BACKEND_URL}vehicles/search?` +
        `fromDate=${fromDate}&toDate=${toDate}` +
        `&fromTime=${fromTime}&toTime=${toTime}`;

      if (locationParam) {
        url += `&location=${encodeURIComponent(locationParam)}`;
      }

      if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}`;
      }
      
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch vehicles.");
        return;
      }

      // 🔥 Optional: sort by nearest first
      const sorted = (data.data || []).sort(
        (a, b) =>
          (a.distanceInMeters ?? Infinity) -
          (b.distanceInMeters ?? Infinity)
      );

      setVehicles(sorted);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Something went wrong while fetching vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-blue-900 font-semibold">
        Loading available vehicles...
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* 🔎 Search Summary */}
        <div className="bg-white rounded-xl p-6 md:p-8 mb-10 border border-slate-200 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 text-center">
            Scooties available near{" "}
            <span className="text-black">
              {locationParam || "your location"}
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-slate-800 text-sm md:text-base font-semibold">
            {fromDate && toDate && (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg">
                <span className="text-lg">📅</span> {fromDate} <span className="text-slate-400">→</span> {toDate}
              </div>
            )}
            {fromTime && toTime && (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg">
                <span className="text-lg">⏰</span> {fromTime} <span className="text-slate-400">→</span> {toTime}
              </div>
            )}
            {lat && lng && (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg">
                <span className="text-lg">📍</span> Within 20 km
              </div>
            )}
          </div>
        </div>

        {/* 🚗 Results */}
        {vehicles.length === 0 ? (
          <div className="text-center mt-20 p-10 bg-white rounded-xl border border-slate-200 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="text-6xl mb-4">🏜️</div>
            <h3 className="text-2xl font-bold text-black mb-2">No Vehicles Found</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              We couldn't find any available rides in this area for the selected dates.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3.5 bg-black hover:bg-slate-800 text-white rounded-lg font-bold transition-all active:scale-95"
            >
              Modify Search
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v, idx) => (
              <div
                key={v._id}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                {/* 📸 Image */}
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={v.photos?.[0] || "/placeholder.png"}
                    alt={v.scootyModel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 right-4 bg-white text-black font-bold px-3 py-1.5 rounded text-xs tracking-wider border border-slate-200 uppercase">
                    Premium
                  </div>
                </div>

                {/* 📄 Details */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-black mb-2 line-clamp-1">
                    {v.scootyModel}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <p className="text-slate-700 text-sm flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">📍</span> 
                      <span className="line-clamp-1 font-medium">{v.pickupLocation?.address}</span>
                    </p>
                    <p className="text-slate-700 text-sm flex items-center gap-2">
                      <span className="text-slate-400">🏙️</span> 
                      <span className="font-medium">{v.pickupLocation?.city}</span>
                    </p>
                    
                    {/* 📏 Distance badge */}
                    {typeof v.distanceInMeters === "number" && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-black border border-slate-200 mt-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {(v.distanceInMeters / 1000).toFixed(1)} km away
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-black font-bold text-xs border border-slate-200">
                        {v.host?.name?.charAt(0)?.toUpperCase() || "H"}
                      </div>
                      <p className="text-black text-sm font-semibold line-clamp-1 max-w-[100px]">
                        {v.host?.name || "Anonymous"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/vehicle/${v._id}?fromDate=${fromDate}&toDate=${toDate}&fromTime=${fromTime}&toTime=${toTime}`
                        )
                      }
                      className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}