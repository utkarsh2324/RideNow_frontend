import { useEffect, useState } from "react";
import { Car, MapPin, Trash2, ToggleRight, ToggleLeft, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch all vehicles hosted by the current host
  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}hosts/gethostvehicle`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load vehicles.");
        return;
      }

      // ✅ Even if data.data = [], treat it as valid
      setVehicles(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      toast.error("Something went wrong while fetching vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ✅ Toggle vehicle availability
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
        toast.success(`Vehicle is now ${!currentStatus ? "Available ✅" : "Unavailable 🚫"}`);
        setVehicles((prev) =>
          prev.map((v) => (v._id === vehicleId ? { ...v, isAvailable: !currentStatus } : v))
        );
      } else {
        toast.error(data.message || "Failed to update availability.");
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Something went wrong.");
    }
  };

  // ✅ Delete vehicle
  const handleDelete = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}vehicles/delete/${vehicleId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Vehicle deleted successfully 🗑️");
        setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
      } else {
        toast.error(data.message || "Failed to delete vehicle.");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Something went wrong while deleting.");
    }
  };

  // ✅ Handle Host New Vehicle
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <Car className="w-7 h-7" /> My Hosted Vehicles
          </h2>
          <button
            onClick={handleHostNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
          >
            <PlusCircle className="w-5 h-5" /> Host New Vehicle
          </button>
        </div>

        {/* No vehicles yet */}
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
              className="px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              Host a Vehicle Now
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white shadow-lg rounded-2xl overflow-hidden border hover:shadow-xl transition"
              >
                <img
                  src={vehicle.photos?.[0] || "/placeholder.png"}
                  alt={vehicle.scootyModel}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {vehicle.scootyModel}
                  </h3>
                  <div className="text-gray-700 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" /> {vehicle.location}
                  </div>

                  {/* ✅ Availability display */}
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

                  <div className="flex justify-between items-center mt-3">
  {/* ✅ Details Button */}
  <button
    onClick={() => navigate(`/host/vehicle/${vehicle._id}`)}
    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200"
  >
    <Car className="w-4 h-4" /> Details
  </button>

  {/* ✅ Availability Toggle Button */}
  <button
    onClick={() =>
      handleToggleAvailability(vehicle._id, vehicle.isAvailable)
    }
    className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition ${
      vehicle.isAvailable
        ? "bg-green-100 text-green-700 hover:bg-green-200"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    {vehicle.isAvailable ? "Set Unavailable" : "Set Available"}
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}