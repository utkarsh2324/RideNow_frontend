import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function VehicleDetails() {
  const { id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);

  const fromDate = queryParams.get("fromDate");
  const toDate = queryParams.get("toDate");
  const fromTime = queryParams.get("fromTime") || "10:00";
  const toTime = queryParams.get("toTime") || "18:00";

  const [vehicle, setVehicle] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // ✅ CONSENT STATE
  const [agreed, setAgreed] = useState(false);

  /* ================= CHECK EXISTING CONSENT ================= */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}users/current-user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.termsConsent?.accepted) {
          setAgreed(true);
        }
      })
      .catch(() => {});
  }, []);

  /* ---------------- FETCH VEHICLE ---------------- */
  const fetchVehicleDetails = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/userdetails/${id}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch vehicle.");
        navigate("/search");
        return;
      }

      setVehicle(data.data);
    } catch {
      toast.error("Error loading vehicle.");
      navigate("/search");
    }
  };

  /* ---------------- PRICE PREVIEW ---------------- */
  const fetchPricePreview = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/price-preview/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromDate,
            toDate,
            fromTime,
            toTime,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to calculate price");
        return;
      }

      setPriceData(data.data);
    } catch {
      toast.error("Price preview failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  useEffect(() => {
    if (vehicle && fromDate && toDate) {
      fetchPricePreview();
    }
  }, [vehicle, fromDate, toDate]);

  /* ================= ACCEPT TERMS ================= */
  const handleConsentChange = async (checked) => {
    setAgreed(checked);

    if (!checked) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}users/accept-terms`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save consent");
        setAgreed(false);
      } else {
        toast.success("Terms & Conditions accepted");
      }
    } catch {
      toast.error("Failed to save consent");
      setAgreed(false);
    }
  };

  /* ---------------- BOOK VEHICLE ---------------- */
  const handleBooking = async () => {
    if (!agreed) {
      toast.error("Please agree to Terms & Conditions before booking.");
      return;
    }

    if (!priceData) {
      toast.error("Price not available.");
      return;
    }

    try {
      setBooking(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/book/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromDate,
            toDate,
            fromTime,
            toTime,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        navigate("/rides");
      } else {
        toast.error(data.message, {
          duration: 5000, // keep it visible
        });
      }
    } catch {
      toast.error("Booking error.");
    } finally {
      setBooking(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading vehicle details...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="h-screen flex justify-center">
        Vehicle not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Search
        </button>

        <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">

            {/* LEFT : PHOTOS GALLERY */}
            <div className="lg:p-8 p-4 bg-slate-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:sticky lg:top-32">
                {vehicle.photos?.length > 0 ? (
                  vehicle.photos.map((photo, i) => (
                    <div 
                      key={i} 
                      className={`overflow-hidden rounded-2xl shadow-sm border border-slate-200/60 ${i === 0 ? 'sm:col-span-2 sm:h-80' : 'h-48'}`}
                    >
                      <img
                        src={photo}
                        alt={`scooty-${i}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-2 h-80 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                    No images available
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT : DETAILS & BOOKING */}
            <div className="p-6 sm:p-10 lg:p-12 lg:pl-4 flex flex-col">
              
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-slate-100 text-black text-xs font-bold px-3 py-1 rounded border border-slate-200 uppercase tracking-wider">
                    Ready to Ride
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight mb-4">
                  {vehicle.scootyModel}
                </h2>
                
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 mt-0.5">📍</span>
                    <div>
                      <p className="text-black font-medium leading-snug">{vehicle.pickupLocation?.address}</p>
                      {vehicle.pickupLocation?.landmark?.trim() !== "" && (
                        <p className="text-sm text-slate-500 mt-0.5">Near {vehicle.pickupLocation.landmark}</p>
                      )}
                      <p className="text-sm text-slate-500 mt-0.5">{vehicle.pickupLocation?.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DATE & TIME WIDGET */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pickup</p>
                  <p className="text-black font-semibold">{fromDate}</p>
                  <p className="text-sm text-slate-500">{fromTime}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Dropoff</p>
                  <p className="text-black font-semibold">{toDate}</p>
                  <p className="text-sm text-slate-500">{toTime}</p>
                </div>
              </div>

              {/* HOST INFO */}
              {vehicle.host && (
                <div className="mb-8 flex items-center justify-between border-y border-slate-200 py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={vehicle.host.photo || "/avatar.png"}
                        alt="Host"
                        className="w-14 h-14 rounded-full object-cover border border-slate-200"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Hosted by</p>
                      <p className="font-bold text-black">{vehicle.host.name || "Unknown Host"}</p>
                    </div>
                  </div>
                  <button className="text-black font-semibold text-sm hover:underline transition-all">
                    Contact Host
                  </button>
                </div>
              )}

              {/* PRICE CALCULATION WIDGET */}
              <div className="mt-auto">
                {priceData ? (
                  <div className="bg-slate-50 rounded-xl p-6 md:p-8 text-black border border-slate-200 shadow-sm relative overflow-hidden">
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <p className="text-slate-600 font-medium mb-1">Total ({priceData.totalDays} days)</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-600">₹</span>
                            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{priceData.totalPrice}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Average</p>
                          <p className="font-medium text-black">₹{priceData.averagePerDay}/day</p>
                        </div>
                      </div>

                      {/* CONSENT */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input
                              type="checkbox"
                              checked={agreed}
                              onChange={(e) => handleConsentChange(e.target.checked)}
                              className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-black checked:bg-black checked:border-black transition-all cursor-pointer"
                            />
                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-slate-800 leading-tight">
                            I agree to the{" "}
                            <span
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate("/terms"); }}
                              className="text-black underline decoration-slate-400 underline-offset-2 hover:text-slate-600 transition-colors font-semibold cursor-pointer"
                            >
                              Terms & Conditions
                            </span>
                          </span>
                        </label>
                      </div>

                      {/* BOOK BUTTON */}
                      <button
                        onClick={handleBooking}
                        disabled={booking || !agreed}
                        className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all duration-300 active:scale-[0.98] ${
                          booking || !agreed
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                            : "bg-black text-white hover:bg-slate-800"
                        }`}
                      >
                        {booking ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5 text-current" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Confirming...
                          </span>
                        ) : "Book This Vehicle"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-500 animate-pulse h-40 flex items-center justify-center border border-slate-200">
                    Calculating pricing details...
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}