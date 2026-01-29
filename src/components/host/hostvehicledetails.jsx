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
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [locating, setLocating] = useState(false);

  const [updateData, setUpdateData] = useState({
    address: "",
    landmark: "",
    city: "",
    lat: null,
    lng: null,
    weekdayPrice: "",
    weekendPrice: "",
  });

  /* ---------------- FETCH VEHICLE ---------------- */

  const fetchVehicleDetails = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/details/${vehicleId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to load vehicle details");
        return;
      }

      const v = data.data;

      setVehicle(v);
      setUpdateData({
        address: v.pickupLocation?.address || "",
        landmark: v.pickupLocation?.landmark || "",
        city: v.pickupLocation?.city || "",
        lat: v.pickupLocation?.coordinates?.coordinates?.[1] ?? null,
        lng: v.pickupLocation?.coordinates?.coordinates?.[0] ?? null,
        weekdayPrice: v.pricing?.weekdayPrice || "",
        weekendPrice: v.pricing?.weekendPrice || "",
      });
    } catch {
      toast.error("Error loading vehicle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  /* ---------------- GPS AUTO-FILL ---------------- */

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const data = await res.json();

          setUpdateData((prev) => ({
            ...prev,
            address:
              data?.display_name ||
              `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
            city:
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              prev.city,
            lat: coords.latitude,
            lng: coords.longitude,
          }));

          toast.success("Location updated using GPS");
        } catch {
          toast.error("Failed to fetch address");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Please allow location access for better search");
        setLocating(false);
      }
    );
  };

  /* ---------------- UPDATE VEHICLE ---------------- */

  const handleUpdateVehicle = async () => {
    if (Number(updateData.weekendPrice) < Number(updateData.weekdayPrice)) {
      toast.error("Weekend price cannot be less than weekday price");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/update/${vehicleId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickupLocation: {
              address: updateData.address,
              landmark: updateData.landmark,
              city: updateData.city,
            },
            lat: updateData.lat,
            lng: updateData.lng,
            pricing: {
              weekdayPrice: Number(updateData.weekdayPrice),
              weekendPrice: Number(updateData.weekendPrice),
            },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update vehicle");
        return;
      }

      toast.success("Vehicle updated successfully");
      setVehicle(data.data);
      setEditing(false);
    } catch {
      toast.error("Update failed");
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
        toast.error(data.message || "Failed to delete vehicle");
      }
    } catch {
      toast.error("Delete failed");
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
        Vehicle not found
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <Car className="w-7 h-7" /> {vehicle.scootyModel}
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => (editing ? handleUpdateVehicle() : setEditing(true))}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg"
            >
              {editing ? <Save size={18} /> : <Edit size={18} />}
              {editing ? "Save" : "Edit"}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              <MapPin /> Pickup Location
            </h3>

            {editing && (
              <button
                onClick={handleUseGPS}
                disabled={locating}
                className="flex items-center gap-2 text-sm px-3 py-2 bg-blue-100 text-blue-900 rounded-lg"
              >
                <Navigation size={16} />
                {locating ? "Locating..." : "Use GPS"}
              </button>
            )}
          </div>

          {["address", "landmark", "city"].map((field) => (
            <div key={field}>
              <label className="text-sm text-gray-600 capitalize">
                {field}
              </label>
              {editing ? (
                <input
                  value={updateData[field]}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, [field]: e.target.value })
                  }
                  className="w-full border rounded p-2"
                />
              ) : (
                <p className="font-medium">
                  {vehicle.pickupLocation?.[field] || "—"}
                </p>
              )}
            </div>
          ))}

          {updateData.lat && updateData.lng && (
            <p className="text-green-600 text-sm">
              📍 GPS coordinates updated
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Pricing</h3>

          {["weekdayPrice", "weekendPrice"].map((p) => (
            <div key={p} className="mb-3">
              <label className="text-sm text-gray-600">{p}</label>
              {editing ? (
                <input
                  type="number"
                  value={updateData[p]}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, [p]: e.target.value })
                  }
                  className="w-full border rounded p-2"
                />
              ) : (
                <p className="font-semibold">
                  ₹{vehicle.pricing?.[p]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Host */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <User /> Host Info
          </h3>
          <p><strong>Name:</strong> {vehicle.host?.name}</p>
          <p><strong>Email:</strong> {vehicle.host?.email}</p>
          <p><strong>Phone:</strong> {vehicle.host?.phone}</p>
        </div>

      </div>
    </div>
  );
}