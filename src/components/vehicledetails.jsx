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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT : PHOTOS */}
          <div className="p-4 lg:p-6 lg:sticky lg:top-24 h-fit">
            <div className="grid grid-cols-2 gap-3">
              {vehicle.photos?.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`scooty-${i}`}
                  className="h-48 sm:h-56 w-full object-cover rounded-2xl shadow"
                />
              ))}
            </div>
          </div>

          {/* RIGHT : DETAILS */}
          <div className="p-5 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">
              {vehicle.scootyModel}
            </h2>

            <p className="text-gray-600 mt-1">
              📍 {vehicle.pickupLocation?.address}
            </p>

            {vehicle.pickupLocation?.landmark?.trim() !== "" && (
              <p className="text-sm text-gray-500">
                🧭 Near {vehicle.pickupLocation.landmark}
              </p>
            )}

            <p className="text-sm text-gray-500">
              🏙️ {vehicle.pickupLocation?.city}
            </p>

            {/* DATE & TIME */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
              <p>📅 {fromDate} → {toDate}</p>
              <p>⏰ {fromTime} → {toTime}</p>
            </div>

            {/* HOST CARD (UNCHANGED) */}
            {vehicle.host && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
                <img
                  src={vehicle.host.photo || "/avatar.png"}
                  alt="Host"
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {vehicle.host.name || "Unknown Host"}
                  </p>
                  
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Host
                </span>
              </div>
            )}

            {/* PRICE */}
            {priceData && (
              <div className="mt-6 bg-blue-900 text-white rounded-2xl p-5">
                <p className="text-sm opacity-80">
                  Total for {priceData.totalDays} days
                </p>
                <p className="text-2xl font-bold mt-1">
                  ₹{priceData.totalPrice}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  Avg/day ₹{priceData.averagePerDay}
                </p>
              </div>
            )}

            {/* ✅ CONSENT SECTION (ADDED) */}
            <div className="mt-6 bg-gray-50 border rounded-xl p-4 text-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => handleConsentChange(e.target.checked)}
                  className="mt-1 w-4 h-4"
                />
                <span>
                  I agree to the{" "}
                  <span
                    onClick={() => navigate("/terms")}
                    className="text-blue-900 underline font-medium cursor-pointer"
                  >
                    Terms & Conditions. <br/>
                  </span>
                  Please read it carefully before accepting the terms and condition.
                </span>
              </label>
            </div>

            {/* BOOK BUTTON */}
            <button
              onClick={handleBooking}
              disabled={booking || !agreed}
              className={`cursor-pointer w-full mt-6 py-4 rounded-2xl text-white font-semibold text-lg transition ${
                booking || !agreed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-900 to-blue-700 hover:opacity-90"
              }`}
            >
              {booking ? "Booking..." : "Book Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}