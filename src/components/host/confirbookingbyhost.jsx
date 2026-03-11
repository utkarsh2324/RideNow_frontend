import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ================= TIME FORMATTER ================= */
/* ================= TIME FORMATTER (IST CORRECT) ================= */
const formatIST = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function HostBookingsconfirmed() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [cancelling, setCancelling] = useState(null);

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

      // ✅ Only pending bookings
      const pendingOnly = (data.data || []).filter(
        (b) => b.bookingStatus === "pending"
      );

      setBookings(pendingOnly);
    } catch {
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

      toast.success("Booking confirmed ✅");
      fetchHostBookings();
    } catch {
      toast.error("Something went wrong while confirming booking");
    } finally {
      setConfirming(null);
    }
  };

  /* ---------------- CANCEL BOOKING ---------------- */
  const cancelBooking = async (vehicleId, bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmCancel) return;

    try {
      setCancelling(bookingId);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/host/vehicles/${vehicleId}/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to cancel booking");
        return;
      }

      toast.success("Booking cancelled ❌");
      fetchHostBookings();
    } catch {
      toast.error("Something went wrong while cancelling booking");
    } finally {
      setCancelling(null);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center font-semibold text-blue-900">
        Loading booking requests...
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-blue-950 mb-8 flex items-center gap-3">
          <span className="text-4xl">🛵</span> Pending Booking Requests
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
                  className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Vehicle Image */}
                  <img
                    src={photo}
                    alt={booking.scootyModel}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-blue-950 leading-tight">
                        {booking.scootyModel}
                      </h3>
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 uppercase tracking-wide">
                        Pending
                      </span>
                    </div>

                    {/* TIME */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 text-sm text-slate-700 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="text-slate-400">🕒</span> {formatIST(booking.startDate)} <span className="text-slate-400 text-xs">to</span> {formatIST(booking.endDate)}
                      </p>
                    </div>

                    <p className="text-lg font-black text-blue-950 mb-6 flex items-center gap-1">
                      <span className="text-slate-500 font-medium text-sm">Total Price:</span> 
                      ₹{booking.totalPrice}
                    </p>

                    <hr className="border-slate-100 mb-4" />

                    {/* RENTER */}
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

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() =>
                          confirmBooking(
                            booking.vehicleId,
                            booking.bookingId
                          )
                        }
                        disabled={confirming === booking.bookingId}
                        className="flex-1 bg-blue-950 hover:bg-blue-900 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {confirming === booking.bookingId
                          ? "Confirming..."
                          : "Confirm Booking"}
                      </button>

                      <button
                        onClick={() =>
                          cancelBooking(
                            booking.vehicleId,
                            booking.bookingId
                          )
                        }
                        disabled={cancelling === booking.bookingId}
                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
                      >
                        {cancelling === booking.bookingId
                          ? "Cancelling..."
                          : "Decline"}
                      </button>
                    </div>
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