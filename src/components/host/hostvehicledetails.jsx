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
      setEditing(false);
  
      // 🔥 REFRESH DATA FROM DETAILS API
      fetchVehicleDetails();
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
    <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-8 sm:p-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            {vehicle.scootyModel}
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => (editing ? handleUpdateVehicle() : setEditing(true))}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95 ${
                editing ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-950 hover:bg-blue-900 text-white"
              }`}
            >
              {editing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              {editing ? "Save" : "Edit"}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 font-bold transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-5 h-5" /> Delete
            </button>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-blue-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> Pickup Location
            </h3>

            {editing && (
              <button
                onClick={handleUseGPS}
                disabled={locating}
                className="flex items-center gap-2 text-sm px-4 py-2 h-10 bg-blue-50 text-blue-800 font-bold rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                {locating ? "Locating..." : "Use GPS"}
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {["address", "landmark", "city"].map((field) => (
              <div key={field} className={field === "address" ? "col-span-full" : ""}>
                <label className="block text-sm font-semibold text-slate-500 capitalize mb-1">
                  {field}
                </label>
                {editing ? (
                  <input
                    value={updateData[field]}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, [field]: e.target.value })
                    }
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-950/20"
                  />
                ) : (
                  <p className="font-bold text-slate-800 text-lg">
                    {vehicle.pickupLocation?.[field] || "—"}
                  </p>
                )}
              </div>
            ))}
          </div>

          {updateData.lat && updateData.lng && (
            <p className="text-emerald-600 text-sm font-bold flex items-center gap-1.5 mt-2">
              📍 GPS coordinates updated
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
            Pricing
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {["weekdayPrice", "weekendPrice"].map((p) => (
              <div key={p} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <label className="block text-sm font-semibold text-slate-500 mb-2">
                  {p === "weekdayPrice" ? "Weekday Price (₹)" : "Weekend Price (₹)"}
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={updateData[p]}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, [p]: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-950/20"
                  />
                ) : (
                  <p className="text-2xl font-black text-blue-950">
                    ₹{vehicle.pricing?.[p]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Host */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Host Info
          </h3>
          <div className="space-y-1">
            <p className="text-slate-700 text-lg"><strong className="font-bold text-blue-950">Name:</strong> {vehicle.host?.name}</p>
            <p className="text-slate-700 text-lg"><strong className="font-bold text-blue-950">Email:</strong> {vehicle.host?.email}</p>
            <p className="text-slate-700 text-lg"><strong className="font-bold text-blue-950">Phone:</strong> {vehicle.host?.phone}</p>
          </div>
        </div>

        {/* RC DOCUMENT */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-xl font-bold text-blue-950 mb-3">
            📄 Vehicle Documents
          </h3>

          {vehicle.rcDocument ? (
            <a
              href={vehicle.rcDocument}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-800 font-bold border border-blue-100 rounded-xl hover:bg-blue-100 transition shadow-sm"
            >
              📄 View RC Document
            </a>
          ) : (
            <p className="text-slate-500 font-medium">
              RC document not available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}