import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch bookings of the logged-in user
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}vehicles/mybookings`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setBookings(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch bookings.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Handle manual booking end
  const handleEndBooking = async (vehicleId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/end/${vehicleId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Booking ended successfully!");
        fetchBookings(); // refresh list
      } else {
        toast.error(data.message || "Failed to end booking.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while ending booking.");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-blue-900 font-semibold">
        Loading your bookings...
      </div>
    );

  if (bookings.length === 0)
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        You haven’t booked any vehicles yet.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          My Bookings
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b, index) => (
            <div
              key={index}
              className="bg-white border shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all"
            >
              <img
                src={b.photos?.[0] || "/placeholder.png"}
                alt={b.scootyModel}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  {b.scootyModel}
                </h3>
                <p className="text-gray-600 text-sm mb-1">📍 {b.location}</p>
                <p className="text-gray-600 text-sm mb-1">🏙️ {b.city}</p>
                <p className="text-gray-600 text-sm mb-1">
                  💰 ₹{b.totalPrice.toFixed(2)}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  📅 {new Date(b.startDate).toLocaleDateString()} →{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </p>

                {/* ✅ Booking status */}
                <p
                  className={`font-semibold mb-3 ${
                    b.bookingStatus === "Completed"
                      ? "text-green-700"
                      : b.bookingStatus === "confirmed"
                      ? "text-blue-700"
                      : "text-yellow-700"
                  }`}
                >
                  Status: {b.bookingStatus}
                </p>

                {/* ✅ End Ride button only if confirmed */}
                {b.bookingStatus === "confirmed" ? (
                  <button
                    onClick={() => handleEndBooking(b.vehicleId)}
                    className="w-full py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold"
                  >
                    End Ride
                  </button>
                ) : b.bookingStatus === "Completed" ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-gray-300 text-gray-700 font-semibold cursor-not-allowed"
                  >
                    Ride Completed
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-yellow-400 text-gray-800 font-semibold cursor-not-allowed"
                  >
                    Pending Approval
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}