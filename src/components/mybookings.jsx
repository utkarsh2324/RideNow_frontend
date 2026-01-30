import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const cleanDateTime = (isoString) => {
    if (!isoString) return "";
    return isoString
      .replace("T", " ")
      .replace(":00.000Z", "");
  };
  /* ---------------- FETCH BOOKINGS ---------------- */
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/mybookings`,
        { credentials: "include" }
      );

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

  /* ---------------- END BOOKING ---------------- */
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
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to end booking.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while ending booking.");
    }
  };

  /* ---------------- UI STATES ---------------- */
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
          {bookings.map((b, index) => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);

            return (
              <div
                key={index}
                className="bg-white border shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all"
              >
                {/* VEHICLE IMAGE */}
                <img
                  src={b.photos?.[0] || "/placeholder.png"}
                  alt={b.scootyModel}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5 space-y-1">
                  {/* VEHICLE */}
                  <h3 className="text-xl font-bold text-blue-900">
                    {b.scootyModel}
                  </h3>

                  {/* LOCATION */}
                  <p className="text-gray-600 text-sm">
                    📍 {b.pickupLocation?.address}
                  </p>
                  <p className="text-gray-600 text-sm">
                    🏙️ {b.pickupLocation?.city}
                  </p>

                  {/* HOST */}
                  {b.host && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                      <p className="font-semibold text-gray-800">
                        👤 {b.host.name}
                      </p>
                      <p className="text-gray-600">✉️ {b.host.email}</p>
                      {b.host.phone && (
                        <p className="text-gray-600">📞 {b.host.phone}</p>
                      )}
                    </div>
                  )}

                  {/* PRICE */}
                  <p className="text-gray-600 text-sm mt-2">
                    💰 ₹{b.totalPrice.toFixed(2)}
                  </p>

                  {/* DATE */}
                  <p className="text-sm text-gray-700">
  🕒 {cleanDateTime(b.startDate)} →{" "}
  {cleanDateTime(b.endDate)}
</p>


                  {/* STATUS */}
                  <p
                    className={`font-semibold mt-2 ${
                      b.bookingStatus === "completed"
                        ? "text-green-700"
                        : b.bookingStatus === "confirmed"
                        ? "text-blue-700"
                        : b.bookingStatus === "canceled"
                        ? "text-red-700"
                        : "text-yellow-700"
                    }`}
                  >
                    Status: {b.bookingStatus}
                  </p>

                  {/* ACTION */}
                  {b.bookingStatus === "confirmed" ? (
                    <button
                      onClick={() => handleEndBooking(b.vehicleId)}
                      className="cursor-pointer w-full mt-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold"
                    >
                      End Ride
                    </button>
                  ) : b.bookingStatus === "completed" ? (
                    <button
                      disabled
                      className="w-full mt-3 py-2 rounded-xl bg-gray-300 text-gray-700 font-semibold cursor-not-allowed"
                    >
                      Ride Completed
                    </button>
                  ) : b.bookingStatus === "canceled" ? (
                    <button
                      disabled
                      className="w-full mt-3 py-2 rounded-xl bg-red-200 text-red-700 font-semibold cursor-not-allowed"
                    >
                      Booking Cancelled
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full mt-3 py-2 rounded-xl bg-yellow-400 text-gray-800 font-semibold cursor-not-allowed"
                    >
                      Pending Approval
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}