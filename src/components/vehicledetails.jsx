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
    } catch (error) {
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
    } catch (error) {
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

  /* ---------------- BOOK VEHICLE ---------------- */

  const handleBooking = async () => {
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
        toast.success(
          data.message || "Booking request sent to host successfully"
        );
        navigate("/rides");
      } else {
        toast.error(data.message || "Booking failed.");
      }
    } catch (error) {
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

          {/* ================= LEFT : PHOTOS ================= */}
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

          {/* ================= RIGHT : DETAILS ================= */}
          <div className="p-5 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">
              {vehicle.scootyModel}
            </h2>

            {/* ✅ UPDATED LOCATION DISPLAY */}
            <p className="text-gray-600 mt-1">
  📍 {vehicle.pickupLocation?.address}
</p>

{vehicle.pickupLocation?.landmark && (
  <p className="text-sm text-gray-500">
    🧭 Near {vehicle.pickupLocation.landmark}
  </p>
)}

<p className="text-sm text-gray-500">
  🏙️ {vehicle.pickupLocation?.city}
</p>
            <p className="text-sm text-gray-500">
              🏙️ {vehicle.pickupLocation?.city}
            </p>

            {/* DATE & TIME */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
              <p>📅 {fromDate} → {toDate}</p>
              <p>⏰ {fromTime} → {toTime}</p>
            </div>

            {/* HOST CARD */}
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
                  <p className="text-sm text-gray-600">
                    {vehicle.host.email}
                  </p>
                  {vehicle.host.phone && (
                    <p className="text-sm text-gray-600">
                      📞 {vehicle.host.phone}
                    </p>
                  )}
                </div>

                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Host
                </span>
              </div>
            )}

            {/* VERIFIED STATUS */}
            <div className="mt-6 bg-gray-50 border rounded-2xl p-4 text-sm">
              {vehicle.isVerified ? (
                <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs">
                  ✅ Verified Vehicle
                </span>
              ) : (
                <span className="text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs">
                  ⏳ Verification Pending
                </span>
              )}
            </div>

            {/* PAYMENT INFO */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-800 mb-1">
                💳 Payment Information
              </p>
              <p>
                Payment will be collected directly by the host at pickup.
              </p>
              <p className="mt-1 text-gray-600">
                Cash or direct payment is currently supported.
              </p>
            </div>

            {/* PRICE CARD */}
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

            {/* BOOK BUTTON */}
            <button
              onClick={handleBooking}
              disabled={booking}
              className={`w-full mt-6 py-4 rounded-2xl text-white font-semibold text-lg transition ${
                booking
                  ? "bg-gray-400"
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