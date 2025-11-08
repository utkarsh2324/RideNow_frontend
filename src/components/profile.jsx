import { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck,Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}users/current-user`,
          { credentials: "include" }
        );
        const data = await res.json();
        const payload = data?.data ?? data;
        setUser(payload);
        setFormData(payload);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Capture photo from camera
  useEffect(() => {
    if (editSection === "photo") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setCameraStream(stream);
          const video = document.getElementById("video");
          if (video) video.srcObject = stream;
        })
        .catch((err) => console.error("Camera access denied:", err));
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
    }
  }, [editSection]);

  const handleCapture = () => {
    const video = document.getElementById("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setPhotoFile(file);
    }, "image/jpeg");
  };

  // Save changes for each section
  const handleSave = async () => {
    try {
      let res, data, payload;

      if (editSection === "photo" && photoFile) {
        const formDataPhoto = new FormData();
        formDataPhoto.append("photo", photoFile);

        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}users/profile/upload-photo`,
          { method: "POST", credentials: "include", body: formDataPhoto }
        );
        data = await res.json();
        payload = data?.data ?? data;

        if (payload?.photo) {
          setUser((prev) => ({
            ...prev,
            profile: { ...prev.profile, photo: payload.photo },
          }));
          toast.success("Profile photo updated! Refresh the page to see changes.");
        }
      }

      if (editSection === "basic") {
        const basicData = { name: formData.name, dob: formData.dob };

        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}users/profile/update-basic`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(basicData),
          }
        );
        data = await res.json();
        payload = data?.data ?? data;

        if (payload) {
          setUser((prev) => ({
            ...prev,
            name: payload.name ?? prev.name,
            dob: payload.dob ?? prev.dob,
          }));
          setFormData((prev) => ({
            ...prev,
            name: payload.name ?? prev.name,
            dob: payload.dob ?? prev.dob,
          }));
          toast.success("Basic info updated! Refresh the page to see changes.");
        }
      }

      if (editSection === "contact") {
        const contactData = { mobileNumber: formData.phone }; // 👈 match backend key
      
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}users/profile/update-mobile`, // 👈 backend route
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactData),
          }
        );
        data = await res.json();
        payload = data?.data ?? data;
      
        if (payload) {
          setUser((prev) => ({
            ...prev,
            phone: payload.mobileNumber ?? prev.phone,
          }));
          setFormData((prev) => ({
            ...prev,
            phone: payload.mobileNumber ?? prev.phone,
          }));
          toast.success("Mobile number updated successfully!");
        }
      }

      setEditSection(null);
      setPhotoFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  const isProfileVerified =
    user.name &&
    user.dob &&
    user.phone &&
    user.isEmailVerified &&
    user.isPhoneVerified;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
          {user.profile?.photo ? (
            <img
              src={user.profile.photo}
              alt="Profile"
              className="w-full h-full rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-200 shadow-lg">
              <User className="w-12 h-12 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center w-full space-y-2">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-2xl font-bold">{user.name || "Unnamed User"}</h2>
            <ShieldCheck
              className={`w-5 h-5 ${
                isProfileVerified ? "text-green-500" : "text-red-500"
              }`}
              title={
                isProfileVerified
                  ? "Profile Verified"
                  : "Profile Incomplete / Not Verified"
              }
            />
          </div>
          <span className="text-gray-500 text-sm text-center sm:text-left">
            Created on {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Profile Photo</h3>
          <button
            onClick={() =>
              setEditSection(editSection === "photo" ? null : "photo")
            }
            disabled={editSection && editSection !== "photo"}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
          >
            {editSection === "photo" ? "Cancel" : "Edit"}
          </button>
        </div>
        {editSection === "photo" && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <video
              id="video"
              autoPlay
              playsInline
              className="w-40 h-40 rounded-lg border shadow"
            ></video>
            <button
              onClick={handleCapture}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 cursor-pointer"
            >
              Capture Selfie
            </button>
            <button
  onClick={handleSave}
  disabled={!photoFile}
  className={`px-4 py-2 rounded-lg w-full sm:w-auto border-2 ${
    photoFile
      ? "border-blue-800 text-blue-900 hover:bg-blue-50 cursor-pointer"
      : "border-gray-400 text-gray-500 cursor-not-allowed"
  }`}
>
  Upload Selfie
</button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <button
            onClick={() =>
              setEditSection(editSection === "basic" ? null : "basic")
            }
            disabled={editSection && editSection !== "basic"}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            {editSection === "basic" ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            {editSection === "basic" ? (
              <input
                type="text"
                name="name"
                placeholder="Enter your full name as per Aadhaar card "
                value={formData.name ?? ""}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            ) : (
              <p className="text-gray-700">{user.name || "Not set"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Date of Birth</label>
            {editSection === "basic" ? (
              <input
                type="date"
                name="dob"
                value={formData.dob ? formData.dob.split("T")[0] : ""}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            ) : (
              <p className="text-gray-700">
                {user.dob ? user.dob.split("T")[0] : "Not set"}
              </p>
            )}
          </div>
        </div>
        {editSection === "basic" && (
          <button
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Contact & Verification</h3>
          <button
            onClick={() =>
              setEditSection(editSection === "contact" ? null : "contact")
            }
            disabled={editSection && editSection !== "contact"}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            {editSection === "contact" ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="flex items-center gap-2 flex-wrap">
              <Mail className="w-5 h-5 text-gray-500" />
              <p className="text-gray-700 break-all">{user.email}</p>
              {user.isEmailVerified ? (
                <ShieldCheck className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-red-500 text-sm">Not Verified</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            {editSection === "contact" ? (
              <input
                type="text"
                name="phone"
                value={formData.phone ?? ""}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-5 h-5 text-gray-500" />
                <p className="text-gray-700">{user.phone || "Not set"}</p>
                {user.isPhoneVerified ? (
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-red-500 text-sm">Not Verified</span>
                )}
              </div>
            )}
          </div>
        </div>
        {editSection === "contact" && (
          <button
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            Save Changes
          </button>
        )}
      </div>
      {/* Password Section */}
{user.authProvider === "local" ? (
  <div className="bg-white shadow-md rounded-2xl p-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Lock className="w-5 h-5 text-gray-600" /> Change Password
      </h3>
      <button
        onClick={() =>
          setEditSection(editSection === "password" ? null : "password")
        }
        disabled={editSection && editSection !== "password"}
        className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
      >
        {editSection === "password" ? "Cancel" : "Edit"}
      </button>
    </div>

    {editSection === "password" && (
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium">Old Password</label>
          <input
            type="password"
            name="oldPassword"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, oldPassword: e.target.value }))
            }
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            name="newPassword"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        <button
          onClick={async () => {
            try {
              const { oldPassword, newPassword, confirmPassword } = formData;
              if (!oldPassword || !newPassword || !confirmPassword)
                return toast.error("All fields are required.");
              if (newPassword !== confirmPassword)
                return toast.error("New passwords do not match.");

              const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}users/change-password`,
                {
                  method: "PATCH",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ oldPassword, newPassword }),
                }
              );

              const data = await res.json();
              if (res.ok) {
                toast.success("Password changed successfully!");
                setEditSection(null);
              } else {
                toast.error(data.message || "Failed to change password.");
              }
            } catch (err) {
              console.error("Password change error:", err);
              toast.error("Something went wrong.");
            }
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          Save New Password
        </button>
      </div>
    )}
  </div>
) : (
  <div className="bg-white shadow-md rounded-2xl p-6 text-center text-gray-600">
    <Lock className="w-5 h-5 mx-auto mb-2 text-gray-500" />
    Password management is handled via Google account.
  </div>
)}
    </div>
  );
}