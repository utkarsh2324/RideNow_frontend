import { useEffect, useState } from "react";
import {
  Car,
  MapPin,
  ToggleRight,
  ToggleLeft,
  PlusCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------------- FETCH HOST VEHICLES ---------------- */

  const fetchVehicles = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/gethostvehicle`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load vehicles.");
        return;
      }

      setVehicles(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while fetching vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* ---------------- TOGGLE AVAILABILITY ---------------- */

  const handleToggleAvailability = async (vehicleId, currentStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/${vehicleId}/toggle-availability`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !currentStatus }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Vehicle is now ${!currentStatus ? "Available ✅" : "Unavailable 🚫"}`
        );
        setVehicles((prev) =>
          prev.map((v) =>
            v._id === vehicleId
              ? { ...v, isAvailable: !currentStatus }
              : v
          )
        );
      } else {
        toast.error(data.message || "Failed to update availability.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  /* ---------------- ADD NEW VEHICLE ---------------- */

  const handleHostNew = () => {
    navigate("/host/add");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-900 font-semibold">
        Loading your vehicles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight flex items-center gap-3">
            <Car className="w-8 h-8 text-indigo-600" /> My Hosted Vehicles
          </h2>

          <button
            onClick={handleHostNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-950 text-white font-medium rounded-xl hover:bg-blue-900 hover:shadow-md active:scale-95 transition-all"
          >
            <PlusCircle className="w-5 h-5" /> Host New Vehicle
          </button>
        </div>

        {/* Empty State */}
        {vehicles.length === 0 ? (
          <div className="text-center mt-20">
            <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              You haven't hosted any vehicles yet.
            </h3>
            <p className="text-gray-500 mb-6">
              Start earning by hosting your first vehicle today!
            </p>
            <button
              onClick={handleHostNew}
              className="px-6 py-3 bg-blue-950 text-white font-medium rounded-xl hover:bg-blue-900 shadow-sm transition-all"
            >
              Host a Vehicle Now
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => {
              const pickup = vehicle.pickupLocation;

              const locationText =
                pickup?.landmark ||
                pickup?.address ||
                pickup?.city ||
                "Location not set";

              return (
                <div
                  key={vehicle._id}
                  className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                >
                  <img
                    src={vehicle.photos?.[0] || "/placeholder.png"}
                    alt={vehicle.scootyModel}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-950 mb-3 tracking-tight">
                      {vehicle.scootyModel}
                    </h3>

                    {/* ✅ FIXED LOCATION */}
                    <div className="text-slate-600 font-medium text-sm flex items-start gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{locationText}</span>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2 mb-4">
                      {vehicle.isAvailable ? (
                        <span className="text-green-700 font-medium flex items-center gap-1">
                          <ToggleRight className="w-5 h-5" /> Available
                        </span>
                      ) : (
                        <span className="text-red-700 font-medium flex items-center gap-1">
                          <ToggleLeft className="w-5 h-5" /> Unavailable
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                      {/* Details */}
                      <button
                        onClick={() =>
                          navigate(`/host/vehicle/${vehicle._id}`)
                        }
                        className="px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Details
                      </button>

                      {/* Toggle */}
                      <button
                        onClick={() =>
                          handleToggleAvailability(
                            vehicle._id,
                            vehicle.isAvailable
                          )
                        }
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                          vehicle.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {vehicle.isAvailable
                          ? "Set Unavailable"
                          : "Set Available"}
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