import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Car, MapPin, ToggleRight, ToggleLeft, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch vehicle details
  const fetchVehicleDetails = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/details/${vehicleId}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load vehicle details.");
        return;
      }

      setVehicle(data.data);
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Something went wrong while loading details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  // ✅ Delete vehicle
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/delete/${vehicleId}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Vehicle deleted successfully 🗑️");
        navigate("/host/hostavehicle"); // Go back to host vehicle list
      } else {
        toast.error(data.message || "Failed to delete vehicle.");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Something went wrong while deleting.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-900 font-semibold">
        Loading vehicle details...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Vehicle not found or deleted.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <Car className="w-7 h-7" /> {vehicle.scootyModel}
          </h2>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 className="w-5 h-5" /> Delete Vehicle
          </button>
        </div>

        {/* Vehicle Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {vehicle.photos && vehicle.photos.length > 0 ? (
            vehicle.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Vehicle ${index + 1}`}
                className="w-full h-40 object-cover rounded-xl border"
              />
            ))
          ) : (
            <p className="text-gray-500">No photos available</p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 text-gray-800">
          <p className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-800" /> <strong>Location:</strong>{" "}
            {vehicle.location}
          </p>

          <p className="flex items-center gap-2">
            {vehicle.isAvailable ? (
              <span className="text-green-700 font-semibold flex items-center gap-2">
                <ToggleRight className="w-5 h-5" /> Available
              </span>
            ) : (
              <span className="text-red-700 font-semibold flex items-center gap-2">
                <ToggleLeft className="w-5 h-5" /> Unavailable
              </span>
            )}
          </p>

          <p>
            <strong>RC Document:</strong>{" "}
            {vehicle.rcDocument ? (
              <a
                href={vehicle.rcDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                View RC
              </a>
            ) : (
              "Not uploaded"
            )}
          </p>

          <div className="mt-4 border-t pt-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-2">
              <User className="w-5 h-5" /> Host Information
            </h3>
            <p>
              <strong>Name:</strong> {vehicle.host?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {vehicle.host?.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {vehicle.host?.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}