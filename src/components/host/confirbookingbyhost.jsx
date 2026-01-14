import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function HostBookingsconfirmed() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(null); // bookingId

  /* ---------------- FETCH HOST BOOKINGS ---------------- */
  const fetchHostBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/bookings`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch bookings");
        return;
      }

      // ✅ Only keep pending bookings
      const pendingOnly = (data.data || []).filter(
        (b) => b.bookingStatus === "pending"
      );

      setBookings(pendingOnly);
    } catch (err) {
      toast.error("Something went wrong while loading bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostBookings();
  }, []);

  /* ---------------- CONFIRM BOOKING ---------------- */
  const confirmBooking = async (vehicleId, bookingId) => {
    try {
      setConfirming(bookingId);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/host/vehicles/${vehicleId}/bookings/${bookingId}/confirm`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to confirm booking");
        return;
      }

      toast.success("Booking confirmed successfully ✅");

      // Refresh pending bookings
      fetchHostBookings();
    } catch (err) {
      toast.error("Something went wrong while confirming booking");
    } finally {
      setConfirming(null);
    }
  };

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center font-semibold text-blue-900">
        Loading booking requests...
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          🛵 Pending Booking Requests
        </h2>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-600">
            No pending booking requests.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const renter = booking.renterDetails || {};
              const photo =
                booking.vehiclePhotos?.[0] || "/placeholder.png";

              return (
                <div
                  key={booking.bookingId}
                  className="bg-white border rounded-2xl shadow hover:shadow-lg transition"
                >
                  {/* Vehicle Image */}
                  <img
                    src={photo}
                    alt={booking.scootyModel}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />

                  <div className="p-5 space-y-3">
                    {/* Vehicle Info */}
                    <h3 className="text-xl font-semibold text-blue-900">
                      {booking.scootyModel}
                    </h3>

                    {/* Time */}
                    <p className="text-sm text-gray-700">
                      🕒{" "}
                      {new Date(booking.startDate).toLocaleString()} →{" "}
                      {new Date(booking.endDate).toLocaleString()}
                    </p>

                    {/* Price */}
                    <p className="text-sm text-gray-700">
                      💰 ₹{booking.totalPrice}
                    </p>

                    {/* Status */}
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-700 border-yellow-400">
                      PENDING
                    </span>

                    <hr />

                    {/* Renter Details */}
                    <div className="flex items-center gap-3">
                      <img
                        src={renter.photo || "/default-avatar.png"}
                        alt={renter.name}
                        className="w-10 h-10 rounded-full border"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {renter.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-600">
                          📧 {renter.email || "Not provided"}
                        </p>
                        <p className="text-xs text-gray-600">
                          📞 {renter.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={() =>
                        confirmBooking(
                          booking.vehicleId,
                          booking.bookingId
                        )
                      }
                      disabled={confirming === booking.bookingId}
                      className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                    >
                      {confirming === booking.bookingId
                        ? "Confirming..."
                        : "Confirm Booking"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}