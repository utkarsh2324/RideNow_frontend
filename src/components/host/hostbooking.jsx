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

      setBookings(data.data || []);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          🛵 Your Vehicle Bookings
        </h2>

        {bookings.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-lg text-gray-600 mb-4">
              You don’t have any bookings yet.
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
                  ? "bg-green-100 text-green-700 border-green-400"
                  : booking.bookingStatus === "Completed"
                  ? "bg-blue-100 text-blue-700 border-blue-400"
                  : "bg-yellow-100 text-yellow-700 border-yellow-400";

              return (
                <div
                  key={booking.bookingId}
                  className="bg-white shadow-md border rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Vehicle Image */}
                  <img
                    src={vehiclePhoto}
                    alt={booking.scootyModel}
                    className="w-full h-48 object-cover"
                  />

                  {/* Vehicle + Renter Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-xl font-semibold text-blue-900">
                      {booking.scootyModel}
                    </h3>

                    <p className="text-sm text-gray-700">
                      📅 {new Date(booking.startDate).toLocaleDateString()} →{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      💰 Total Price: ₹{booking.totalPrice?.toFixed(2)}
                    </p>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
                    >
                      {booking.bookingStatus}
                    </span>

                    <hr className="my-2" />

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