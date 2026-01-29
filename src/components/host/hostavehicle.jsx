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
    address: "",
    landmark: "",
    city: "",
    lat: "",
    lng: "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  /* ---------------- GPS LOCATION ---------------- */

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
            address:
              data?.display_name ||
              `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
            city:
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              "",
            lat: latitude,
            lng: longitude,
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

  /* ---------------- SUBMIT ---------------- */

  const handleHostVehicle = async () => {
    if (!formData.scootyModel || !formData.address || !formData.city) {
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
      vehicleForm.append("address", formData.address);
      vehicleForm.append("landmark", formData.landmark);
      vehicleForm.append("city", formData.city);

      if (formData.lat && formData.lng) {
        vehicleForm.append("lat", formData.lat);
        vehicleForm.append("lng", formData.lng);
      }

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
        address: "",
        landmark: "",
        city: "",
        lat: "",
        lng: "",
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

          {/* Address */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Pickup Address
            </label>
            <div className="flex gap-2 items-center">
              <MapPin className="text-blue-900" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street / Area"
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

          {/* Landmark */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Landmark (optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Near metro / mall"
              className="w-full p-2 border rounded-lg"
            />
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
              placeholder="Bangalore / Vijayawada"
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
                  min="1"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
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
                  min="1"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
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
          </div>

          {/* RC */}
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