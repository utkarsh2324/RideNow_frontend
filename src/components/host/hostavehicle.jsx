import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, CheckCircle, AlertCircle, FileText, MapPin, Bike, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function HostVehicle() {
  const [formData, setFormData] = useState({
    scootyModel: "",
    location: "",
    city: "",
    photos: [],
    rc: null,
  });
  const navigate = useNavigate();
  const [rcVerified, setRcVerified] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);

  // ✅ Handle text input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "photos") {
      setFormData((prev) => ({ ...prev, photos: Array.from(files) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // ✅ Get Current Location
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
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
          const locationName =
            data?.display_name || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
          const cityName = data?.address?.city || data?.address?.town || data?.address?.village || "";

          setFormData((prev) => ({ ...prev, location: locationName, city: cityName }));
          toast.success("Location detected successfully!");
        } catch (error) {
          console.error("Error fetching address:", error);
          toast.error("Unable to fetch location name.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location access denied or unavailable.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ✅ Verify RC
  const handleVerifyRC = async () => {
    if (!formData.rc) {
      toast.error("Please upload RC PDF first.");
      return;
    }

    try {
      setUploading(true);
      const rcForm = new FormData();
      rcForm.append("rc", formData.rc);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}vehicles/verify-rc`,
        rcForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      const data = res.data;

      if (res.status === 200 && data.message?.includes("✅ RC verified")) {
        setRcVerified(true);
        toast.success("RC verified successfully!");
      } else {
        setRcVerified(false);
        toast.error(data.message || "RC verification failed. Please upload a valid RC.");
      }
    } catch (error) {
      console.error("Error verifying RC:", error);
      toast.error(error.response?.data?.message || "Something went wrong during RC verification.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Host Vehicle
  const handleHostVehicle = async () => {
    if (!formData.scootyModel || !formData.location || !formData.city) {
      toast.error("Please fill all details before hosting.");
      return;
    }

    if (!rcVerified) {
      toast.error("RC must be verified before hosting.");
      return;
    }

    try {
      setUploading(true);

      const vehicleForm = new FormData();
      vehicleForm.append("scootyModel", formData.scootyModel);
      vehicleForm.append("location", formData.location);
      vehicleForm.append("city", formData.city);

      formData.photos.forEach((photo) => {
        vehicleForm.append("photos", photo);
      });
      vehicleForm.append("rc", formData.rc);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}vehicles/add`, {
        method: "POST",
        credentials: "include",
        body: vehicleForm,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Vehicle hosted successfully!");
        setFormData({ scootyModel: "", location: "", city: "", photos: [], rc: null });
        setRcVerified(false);
        navigate("/host/hostavehicle");
      } else {
        toast.error(data.message || "Failed to host vehicle.");
      }
    } catch (error) {
      console.error("Error hosting vehicle:", error);
      toast.error("Something went wrong while hosting vehicle.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2 mb-6">
          <Bike className="w-7 h-7" /> Host Your Vehicle
        </h2>

        {/* Input fields */}
        <div className="space-y-5">
          {/* Scooty Model */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Scooty Model</label>
            <input
              type="text"
              name="scootyModel"
              value={formData.scootyModel}
              onChange={handleChange}
              placeholder="e.g. Honda Activa, Ola S1"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Location Field */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Location</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-900" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Koramangala, Bangalore"
                className="w-full p-2 border rounded-lg"
              />
              <button
                onClick={handleUseCurrentLocation}
                type="button"
                disabled={locating}
                className="px-3 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 text-sm flex items-center gap-1"
              >
                <Navigation className="w-4 h-4" />
                {locating ? "Locating..." : "Use My Location"}
              </button>
            </div>
          </div>

          {/* ✅ City Field */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Bangalore"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Upload Photos */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Vehicle Photos</label>
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full border p-2 rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Upload 2–5 clear photos of your vehicle.</p>
          </div>

          {/* Upload RC */}
          <div>
            <label className="block font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-900" /> RC Document (PDF)
            </label>
            <input
              type="file"
              name="rc"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border p-2 rounded-lg"
            />

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleVerifyRC}
                disabled={uploading || !formData.rc}
                className={`px-4 py-2 rounded-lg text-white ${
                  rcVerified
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-blue-900 hover:bg-blue-800"
                }`}
              >
                {rcVerified ? "RC Verified ✅" : uploading ? "Verifying..." : "Verify RC"}
              </button>
              {rcVerified ? (
                <CheckCircle className="text-green-600 w-6 h-6" />
              ) : (
                <AlertCircle className="text-red-500 w-6 h-6" />
              )}
            </div>
          </div>

          {/* Host Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleHostVehicle}
              disabled={!rcVerified || uploading}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
                rcVerified
                  ? "bg-blue-900 hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {uploading
                ? "Uploading..."
                : rcVerified
                ? "Host Vehicle"
                : "Verify RC to Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}