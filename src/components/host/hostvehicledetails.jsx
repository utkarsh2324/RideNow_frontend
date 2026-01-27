import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Car,
  MapPin,
  ToggleRight,
  ToggleLeft,
  Trash2,
  User,
  Edit,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [updateData, setUpdateData] = useState({
    location: "",
    weekdayPrice: "",
    weekendPrice: "",
  });

  /* ---------------- FETCH VEHICLE DETAILS ---------------- */

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
      setUpdateData({
        location: data.data.location || "",
        weekdayPrice: data.data.pricing?.weekdayPrice || "",
        weekendPrice: data.data.pricing?.weekendPrice || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while loading details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  /* ---------------- UPDATE VEHICLE ---------------- */

  const handleUpdateVehicle = async () => {
    if (
      Number(updateData.weekendPrice) <
      Number(updateData.weekdayPrice)
    ) {
      toast.error("Weekend price cannot be less than weekday price");
      return;
    }
  
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/update/${vehicleId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );
  
      const data = await res.json();
  
      // ✅ SHOW BACKEND ERROR MESSAGE
      if (!res.ok) {
        toast.error(
          data.message || "Failed to update vehicle"
        );
        return;
      }
  
      toast.success(data.message || "Vehicle updated successfully");
      setVehicle(data.data);
      setEditing(false);
    } catch (error) {
      // ⚠️ Network / unexpected error
      toast.error(
        error?.message || "Something went wrong while updating vehicle"
      );
    }
  };

  /* ---------------- DELETE VEHICLE ---------------- */

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/delete/${vehicleId}`,
        { method: "DELETE", credentials: "include" }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Vehicle deleted successfully");
        navigate("/host/hostavehicle");
      } else {
        toast.error(data.message || "Failed to delete vehicle.");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting vehicle.");
    }
  };

  /* ---------------- UI STATES ---------------- */

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

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <Car className="w-7 h-7" /> {vehicle.scootyModel}
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() =>
                editing ? handleUpdateVehicle() : setEditing(true)
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
            >
              {editing ? (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" /> Edit
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="w-5 h-5" /> Delete
            </button>
          </div>
        </div>

        {/* Vehicle Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {vehicle.photos?.length > 0 ? (
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

        {/* Vehicle Details */}
        <div className="space-y-4 text-gray-800">
          {/* Location */}
          <p className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-800" />
            <strong>Location:</strong>
            {editing ? (
              <input
                type="text"
                value={updateData.location}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    location: e.target.value,
                  })
                }
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              vehicle.location
            )}
          </p>

          {/* Availability */}
          <p>
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

          {/* Pricing */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">
                  Weekday Price (₹ / day)
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={updateData.weekdayPrice}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        weekdayPrice: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                  />
                ) : (
                  <p className="font-semibold">
                    ₹{vehicle.pricing?.weekdayPrice}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Recommended range: ₹300–₹400
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Weekend Price (₹ / day)
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={updateData.weekendPrice}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        weekendPrice: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                  />
                ) : (
                  <p className="font-semibold">
                    ₹{vehicle.pricing?.weekendPrice}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Recommended range: ₹500–₹600
                </p>
              </div>
            </div>
          </div>

          {/* Host Info */}
          <div className="mt-6 border-t pt-4">
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