import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MapPin,
  Bike,
  Navigation,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";

export default function HostVehicle() {
  const [formData, setFormData] = useState({
    scootyModel: "",
    location: "",
    city: "",
    weekdayPrice: "",
    weekendPrice: "",
    photos: [],
    rc: null,
  });

  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);

  /* ---------------- INPUT HANDLERS ---------------- */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "photos") {
      setFormData((prev) => ({
        ...prev,
        photos: Array.from(files),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  /* ---------------- LOCATION ---------------- */

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          setFormData((prev) => ({
            ...prev,
            location:
              data?.display_name ||
              `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
            city:
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              "",
          }));

          toast.success("Location detected");
        } catch {
          toast.error("Failed to fetch location");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Location access denied");
        setLocating(false);
      }
    );
  };

  /* ---------------- HOST VEHICLE ---------------- */

  const handleHostVehicle = async () => {
    if (
      !formData.scootyModel ||
      !formData.location ||
      !formData.city
    ) {
      toast.error("Please fill all required details");
      return;
    }

    if (!formData.weekdayPrice || !formData.weekendPrice) {
      toast.error("Please enter weekday and weekend price");
      return;
    }

    if (
      Number(formData.weekendPrice) <
      Number(formData.weekdayPrice)
    ) {
      toast.error("Weekend price cannot be less than weekday price");
      return;
    }

    if (!formData.rc) {
      toast.error("Please upload RC document");
      return;
    }

    try {
      setUploading(true);

      const vehicleForm = new FormData();
      vehicleForm.append("scootyModel", formData.scootyModel);
      vehicleForm.append("location", formData.location);
      vehicleForm.append("city", formData.city);
      vehicleForm.append("weekdayPrice", formData.weekdayPrice);
      vehicleForm.append("weekendPrice", formData.weekendPrice);
      vehicleForm.append("rc", formData.rc);

      formData.photos.forEach((photo) => {
        vehicleForm.append("photos", photo);
      });

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/add`,
        {
          method: "POST",
          credentials: "include",
          body: vehicleForm,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to host vehicle");
        return;
      }

      toast.success("Vehicle hosted successfully!");

      setFormData({
        scootyModel: "",
        location: "",
        city: "",
        weekdayPrice: "",
        weekendPrice: "",
        photos: [],
        rc: null,
      });

      navigate("/host/hostavehicle");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2 mb-6">
          <Bike className="w-7 h-7" />
          Host Your Vehicle
        </h2>

        <div className="space-y-5">
          {/* Scooty Model */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Scooty Model
            </label>
            <input
              type="text"
              name="scootyModel"
              value={formData.scootyModel}
              onChange={handleChange}
              placeholder="Honda Activa, Ola S1"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="flex gap-2 items-center">
              <MapPin className="text-blue-900" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Area / Street"
                className="w-full p-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="px-3 py-2 bg-blue-900 text-white rounded-lg text-sm"
              >
                <Navigation className="w-4 h-4 inline" />{" "}
                {locating ? "Locating..." : "Use GPS"}
              </button>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Vijayawada / Guntur"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Pricing */}
         
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block font-medium text-gray-700 mb-1">
      Weekday Price (₹ / day)
    </label>
    <div className="flex items-center gap-2">
      <IndianRupee className="w-4 h-4 text-gray-500" />
      <input
        type="number"
        name="weekdayPrice"
        value={formData.weekdayPrice}
        onChange={handleChange}
        placeholder="e.g. 350"
        min="1"
        className="w-full p-2 border rounded-lg"
      />
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Recommended range: ₹300–₹400 per day. Vehicles priced in this range tend to receive higher weekday bookings.
    </p>
  </div>

  <div>
    <label className="block font-medium text-gray-700 mb-1">
      Weekend Price (₹ / day)
    </label>
    <div className="flex items-center gap-2">
      <IndianRupee className="w-4 h-4 text-gray-500" />
      <input
        type="number"
        name="weekendPrice"
        value={formData.weekendPrice}
        onChange={handleChange}
        placeholder="e.g. 550"
        min="1"
        className="w-full p-2 border rounded-lg"
      />
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Recommended range: ₹500–₹600 per day. Weekend demand is typically higher, allowing for better pricing.
    </p>
  </div>
</div>

          {/* Photos */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Vehicle Photos
            </label>
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full border p-2 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload 2–5 clear photos
            </p>
          </div>

          {/* RC Upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText className="text-blue-900" />
              RC Document (PDF)
            </label>
            <input
              type="file"
              name="rc"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border p-2 rounded-lg"
            />
            {formData.rc && (
              <p className="text-yellow-700 text-sm mt-2">
                ⏳ RC uploaded. Verification pending.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              onClick={handleHostVehicle}
              disabled={uploading}
              className="px-6 py-3 rounded-xl text-white font-semibold bg-blue-900 hover:bg-blue-800 transition"
            >
              {uploading ? "Uploading..." : "Host Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}