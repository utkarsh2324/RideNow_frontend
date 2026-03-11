import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight">
            My Bookings
          </h2>
          <p className="mt-2 text-slate-500 font-medium">Manage your upcoming and past rides</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookings.map((b, index) => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);

            // Status Badge Styling
            const isCompleted = b.bookingStatus === "completed";
            const isConfirmed = b.bookingStatus === "confirmed";
            const isCanceled = b.bookingStatus === "canceled";
            
            let statusClasses = "bg-white text-slate-700 border-slate-200";
            if (isCompleted) statusClasses = "bg-green-50 text-green-700 border-green-200";
            if (isConfirmed) statusClasses = "bg-black text-white border-black";
            if (isCanceled) statusClasses = "bg-red-50 text-red-700 border-red-200";

            return (
              <div
                key={index}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 flex flex-col"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {/* VEHICLE IMAGE */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                  <img
                    src={b.photos?.[0] || "/placeholder.png"}
                    alt={b.scootyModel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5"></div>
                  
                  {/* Status Badge overlay */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border shadow-sm backdrop-blur-md ${statusClasses}`}>
                      {b.bookingStatus}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-black bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-white/40">
                    <h3 className="text-xl font-bold truncate">
                      {b.scootyModel}
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 truncate flex items-center gap-1.5 mt-1">
                      <span>📍</span> {b.pickupLocation?.city}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  
                  {/* DATE & TIME WIDGET */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black"></div>
                    <div className="text-sm font-medium text-slate-700 flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-6 text-center text-slate-400">🕒</div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pickup</p>
                          <p className="text-slate-800">{formatIST(b.startDate)}</p>
                        </div>
                      </div>
                      <div className="w-px h-6 bg-slate-200 ml-[11px] my-1 hidden sm:block"></div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 text-center text-slate-400">🏁</div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Dropoff</p>
                          <p className="text-slate-800">{formatIST(b.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION DETAIL */}
                  <div className="mb-5 flex items-start gap-2 text-sm text-slate-600 px-1">
                    <span className="text-slate-400 mt-0.5">📍</span>
                    <span className="line-clamp-2 leading-relaxed">{b.pickupLocation?.address}</span>
                  </div>

                  {/* HOST & PRICE */}
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-200">
                    {b.host ? (
                      <div className="flex items-center gap-2.5 max-w-[50%]">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-black flex items-center justify-center font-bold text-xs flex-shrink-0 border border-slate-200">
                          {b.host.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-xs text-slate-500 font-medium leading-none mb-1">Host</p>
                          <p className="text-sm font-semibold text-slate-800 truncate leading-none">{b.host.name}</p>
                        </div>
                      </div>
                    ) : <div></div>}
                    
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium leading-none mb-1">Total Price</p>
                      <p className="font-extrabold text-xl text-black leading-none">₹{b.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="mt-6">
                    {isConfirmed ? (
                      <button
                        onClick={() => handleEndBooking(b.vehicleId)}
                        className="w-full py-3.5 rounded-lg bg-black hover:bg-slate-800 text-white font-bold active:scale-[0.98] transition-all cursor-pointer"
                      >
                        End Ride Now
                      </button>
                    ) : isCompleted ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-lg bg-slate-100 text-slate-500 font-bold border border-slate-200 cursor-not-allowed"
                      >
                        Ride Completed
                      </button>
                    ) : isCanceled ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-lg bg-red-50 text-red-500 font-bold border border-red-100 cursor-not-allowed"
                      >
                        Booking Cancelled
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-lg bg-amber-50 text-amber-600 font-bold border border-amber-200 cursor-not-allowed"
                      >
                        Pending Approval
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}