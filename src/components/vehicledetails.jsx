import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function VehicleDetails() {
  const { id } = useParams(); // vehicle ID from URL
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);

  // ✅ Extract query params
  const city = queryParams.get("city");
  const fromDate = queryParams.get("fromDate");
  const toDate = queryParams.get("toDate");
  const fromTime = queryParams.get("fromTime");
  const toTime = queryParams.get("toTime");

  const [vehicle, setVehicle] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // ✅ Fetch vehicle details
  const fetchVehicleDetails = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/userdetails/${id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to fetch vehicle details.");
        navigate("/search");
        return;
      }

      setVehicle(data.data);
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
      toast.error("Something went wrong while loading vehicle info.");
      navigate("/search");
    }
  };

  // ✅ Fetch pricing from FastAPI
  const fetchPricing = async (vehicleDetails) => {
    try {
      const payload = {
        city: city || vehicleDetails.location?.split(",")[0] || "Bangalore",
        model: vehicleDetails.scootyModel,
        vehicle_type: "Scooter",
        fuel_type: "Petrol",
        start_date: fromDate,
        end_date: toDate,
      };

      console.log("📤 Sending payload to FastAPI:", payload);

      const res = await fetch("https://arjun9036-pricingmodel.hf.space/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
    

      if (data?.total_price_estimate) {
        setPriceData(data);
      } else {
        toast.error("Failed to fetch predicted price.");
      }
    } catch (error) {
      console.error("Pricing API error:", error);
      toast.error("Error fetching price prediction.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchVehicleDetails();
    })();
  }, [id]);

  useEffect(() => {
    if (vehicle && fromDate && toDate) {
      fetchPricing(vehicle);
    }
  }, [vehicle]);

  // ✅ Handle booking
  // ✅ Handle booking
const handleBooking = async () => {
    if (!priceData) {
      toast.error("Unable to book — price data missing.");
      return;
    }
  
    try {
      setBooking(true);
      const totalPrice = priceData.pricing_details?.[0]?.predicted_price || 0;
  
      // ✅ Prepare payload exactly as backend expects
      const payload = {
        startDate: fromDate,
        endDate: toDate,
        totalPrice,
      };
  
      console.log("📦 Sending booking payload:", payload);
  
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/book/${id}`,
        {
          method: "POST",
          credentials: "include", // includes cookies (auth)
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
  
      const data = await res.json();
      console.log("📥 Booking response:", data);
  
      if (res.ok) {
        toast.success("Vehicle booked successfully!");
        navigate("/mybookings");
      } else {
        toast.error(data.message || "Failed to book vehicle.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Something went wrong while booking the vehicle.");
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-blue-900 font-semibold">
        Loading vehicle details...
      </div>
    );

  if (!vehicle)
    return (
      <div className="h-screen flex justify-center items-center text-gray-700">
        Vehicle not found.
      </div>
    );

  // ✅ Extract predicted price safely
  const predictedPrice = priceData?.pricing_details?.[0]?.predicted_price || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border">
        {/* Vehicle Image */}
        <img
          src={vehicle.photos?.[0] || "/placeholder.png"}
          alt={vehicle.scootyModel}
          className="w-full h-64 object-cover"
        />

        <div className="p-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">
            {vehicle.scootyModel}
          </h2>
          <p className="text-gray-600 mb-2">📍 City: {city}</p>
          <p className="text-gray-600 mb-2">
  📍 Location:{" "}
  <a
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vehicle.location)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-700 hover:underline hover:text-blue-900"
  >
    {vehicle.location}
  </a>
</p>
          <p className="text-gray-600 mb-2">
  👤 Host: {vehicle.host?.name || "Unknown Host"}
</p>
          <p className="text-gray-600 mb-2">
            📅 {fromDate} → {toDate}
          </p>
          <p className="text-gray-600 mb-4">
            ⏰ {fromTime || "10:00"} → {toTime || "18:00"}
          </p>

          {/* ✅ Pricing Details */}
          {/* ✅ Pricing Details */}
{priceData ? (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
    <h3 className="text-lg font-semibold text-blue-900 mb-2">
      💰 Estimated Price Details
    </h3>

    <p>
      <strong>City:</strong> {priceData.city}
    </p>
    <p>
      <strong>City Type:</strong> {priceData.city_type || "Non-Metro"}
    </p>
    <p>
      <strong>Model:</strong> {priceData.model}
    </p>
    <p>
      <strong>Total Days:</strong> {priceData.total_days}
    </p>

    <hr className="my-3 border-blue-200" />

    <p className="text-lg font-semibold text-blue-800">
      💵 Total Estimated Price: ₹{priceData.total_price_estimate.toFixed(2)}
    </p>

    <p className="text-sm text-gray-700">
      (Average Daily Price: ₹{priceData.average_daily_price.toFixed(2)})
    </p>
  </div>
) : (
  <p className="text-gray-500 mb-4">Fetching price details...</p>
)}

          {/* ✅ Book Button */}
          <button
            onClick={handleBooking}
            disabled={booking}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              booking
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {booking ? "Booking..." : "Book Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}