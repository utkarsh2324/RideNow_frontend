import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHostBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/bookings`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch host bookings.");
        return;
      }

      // ✅ Only confirmed & completed bookings
      const filtered = (data.data || []).filter(
        (b) =>
          b.bookingStatus === "confirmed" ||
          b.bookingStatus === "completed"
      );

      setBookings(filtered);
    } catch (error) {
      console.error("Error fetching host bookings:", error);
      toast.error("Something went wrong while loading bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostBookings();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-blue-900 font-semibold">
        Loading your bookings...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-blue-950 mb-8 flex items-center justify-center gap-3">
          <span className="text-4xl">🛵</span> Active & Completed Bookings
        </h2>

        {bookings.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-lg text-gray-600 mb-4">
              No confirmed or completed bookings yet.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const renter = booking.renterDetails || {};
              const vehiclePhoto =
                booking.vehiclePhotos?.[0] || "/placeholder.png";

              const statusColor =
                booking.bookingStatus === "confirmed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200/60";

              return (
                <div
                  key={booking.bookingId}
                  className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Vehicle Image */}
                  <img
                    src={vehiclePhoto}
                    alt={booking.scootyModel}
                    className="w-full h-48 object-cover"
                  />

                  {/* Vehicle + Renter Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-blue-950 leading-tight mb-4">
                      {booking.scootyModel}
                    </h3>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 text-sm text-slate-700 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="text-slate-400">📅</span>
                        {new Date(booking.startDate).toLocaleDateString()} <span className="text-slate-400 text-xs">to</span> {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-lg font-black text-blue-950 mb-4 flex items-center gap-1">
                      <span className="text-slate-500 font-medium text-sm">Total Price:</span> 
                      ₹{booking.totalPrice?.toFixed(2)}
                    </p>

                    <div>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${statusColor}`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <hr className="border-slate-100 my-5" />

                    {/* Renter Details */}
                    <div className="flex items-center gap-3">
                      <img
                        src={renter.photo || "/default-avatar.png"}
                        alt={renter.name || "Renter"}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <p className="text-gray-800 font-medium">
                          {renter.name || "Unknown Renter"}
                        </p>
                        <p className="text-xs text-gray-600">
                          📧 {renter.email || "No email"}
                        </p>
                        <p className="text-xs text-gray-600">
                          📞 {renter.phone || "No phone"}
                        </p>
                      </div>
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