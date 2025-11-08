// src/components/searchresult.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SearchResults() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);

  // ✅ Extract all query params
  const locationParam = queryParams.get("location");
  const fromDate = queryParams.get("fromDate");
  const toDate = queryParams.get("toDate");
  const fromTime = queryParams.get("fromTime");
  const toTime = queryParams.get("toTime");

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch vehicles from backend
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/search?location=${encodeURIComponent(locationParam)}`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to fetch vehicles.");
        return;
      }

      setVehicles(data.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Something went wrong while fetching vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationParam) fetchVehicles();
  }, [locationParam]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-blue-900 font-semibold">
        Loading available vehicles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* ✅ Search Summary */}
        <div className="bg-white shadow-md rounded-2xl p-5 mb-8 border text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            Scooties available near <span className="text-blue-800">{locationParam}</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-6 text-gray-700 text-sm">
            {fromDate && toDate && (
              <p>
                📅 <strong>Date:</strong> {fromDate} → {toDate}
              </p>
            )}
            {fromTime && toTime && (
              <p>
                ⏰ <strong>Time:</strong> {fromTime} → {toTime}
              </p>
            )}
          </div>
        </div>

        {/* ✅ Results */}
        {vehicles.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-lg text-gray-600 mb-4">
              No available vehicles found in this area.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v._id}
                className="bg-white shadow-lg rounded-2xl overflow-hidden border hover:shadow-xl transition"
              >
                <img
                  src={v.photos?.[0] || "/placeholder.png"}
                  alt={v.scootyModel}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {v.scootyModel}
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">📍 {v.location}</p>
                  <p className="text-gray-600 text-sm mb-3">
                    👤 Host: {v.host?.name || "Anonymous"}
                  </p>
                  <button
  onClick={() =>
    navigate(
        `/vehicle/${v._id}?city=${encodeURIComponent(
          v.city || "Bangalore"
        )}&fromDate=${fromDate}&toDate=${toDate}&fromTime=${fromTime}&toTime=${toTime}`
      )
  }
  className="w-full bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium"
>
  View Details
</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}