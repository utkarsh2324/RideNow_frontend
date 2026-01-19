import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function VehicleDetails() {
  const { id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);

  const city = queryParams.get("city");
  const fromDate = queryParams.get("fromDate");
  const toDate = queryParams.get("toDate");
  const fromTime = queryParams.get("fromTime");
  const toTime = queryParams.get("toTime");

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

  /* ---------------- FETCH PRICE ---------------- */

  const fetchPricing = async (vehicleDetails) => {
    try {
      const payload = {
        city: city || vehicleDetails.city,
        model: vehicleDetails.scootyModel,
        vehicle_type: "Scooter",
        fuel_type: "Petrol",
        start_date: fromDate,
        end_date: toDate,
      };

      const res = await fetch(
        "https://arjun9036-pricingmodel.hf.space/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (data?.total_price_estimate) {
        setPriceData(data);
      } else {
        toast.error("Failed to fetch price.");
      }
    } catch (error) {
      toast.error("Pricing service error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  useEffect(() => {
    if (vehicle && fromDate && toDate) {
      fetchPricing(vehicle);
    }
  }, [vehicle]);

  /* ---------------- BOOK VEHICLE ---------------- */

  const handleBooking = async () => {
    if (!priceData) {
      toast.error("Price not available.");
      return;
    }

    try {
      setBooking(true);
      const payload = {
        fromDate,
        toDate,
        fromTime,
        toTime,
        totalPrice: priceData.total_price_estimate,
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/book/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Vehicle booked successfully!");
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

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        Loading vehicle details...
      </div>
    );

  if (!vehicle)
    return <div className="h-screen flex justify-center">Vehicle not found</div>;

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

            <p className="text-gray-600 mt-1">
              📍 {vehicle.location}
            </p>

            {/* 🔹 DATE & TIME */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
              <p>📅 {fromDate} → {toDate}</p>
              <p>⏰ {fromTime || "10:00"} → {toTime || "18:00"}</p>
            </div>

            {/* 🔹 HOST CARD */}
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

            {/* 🔹 VERIFIED STATUS ONLY */}
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
              {/* 🔹 PAYMENT INSTRUCTION */}
<div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-gray-700">
  <p className="font-semibold text-gray-800 mb-1">
    💳 Payment Information
  </p>

  <p>
    Payment will be collected directly by the host when you receive the vehicle.
  </p>

  <p className="mt-1 text-gray-600">
    Currently, <span className="font-medium">cash or direct payment</span> is supported at pickup.
  </p>
</div>
            {/* 🔹 PRICE CARD */}
            {priceData && (
              <div className="mt-6 bg-blue-900 text-white rounded-2xl p-5">
                <p className="text-sm opacity-80">
                  Total for {priceData.total_days} days
                </p>
                <p className="text-2xl font-bold mt-1">
                  ₹{priceData.total_price_estimate.toFixed(2)}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  Avg/day ₹{priceData.average_daily_price?.toFixed(2)}
                </p>
              </div>
            )}

            {/* 🔹 BOOK BUTTON */}
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