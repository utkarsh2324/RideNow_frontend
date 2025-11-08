import { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck, Lock, Wallet, Camera } from "lucide-react";
import toast from "react-hot-toast";

export default function HostProfile() {
  const [host, setHost] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🔹 Fetch host profile
  useEffect(() => {
    const fetchHostProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}hosts/current-host`,
          { credentials: "include" }
        );
        const data = await res.json();
        const payload = data?.data ?? data;
        setHost(payload);
        setFormData(payload);
      } catch (error) {
        console.error("Error fetching host profile:", error);
      }
    };
    fetchHostProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔹 Start/stop camera
  useEffect(() => {
    if (editSection === "photo") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setCameraStream(stream);
          const video = document.getElementById("hostVideo");
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

  // 🔹 Capture photo
  const handleCapture = () => {
    const video = document.getElementById("hostVideo");
    if (!video) return toast.error("Camera not active.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setPhotoFile(file);
      toast.success("Selfie captured!");
    }, "image/jpeg");
  };

  // 🔹 Upload captured photo
  const handleUploadPhoto = async () => {
    try {
      if (!photoFile) {
        toast.error("Please capture a selfie first.");
        return;
      }

      const formDataPhoto = new FormData();
      formDataPhoto.append("photo", photoFile);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/profile/upload-photo`,
        {
          method: "POST",
          credentials: "include",
          body: formDataPhoto,
        }
      );

      const data = await res.json();
      const payload = data?.data ?? data;

      if (res.ok && payload?.photo) {
        setHost((prev) => ({
          ...prev,
          profile: { ...prev.profile, photo: payload.photo },
        }));
        toast.success("Profile photo uploaded successfully!");
        setPhotoFile(null);
        setEditSection(null);
      } else {
        toast.error(data.message || "Failed to upload photo.");
      }
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      toast.error("Something went wrong. Try again later.");
    }
  };

  // 🔹 Change password
  const handleChangePassword = async () => {
    try {
      const { oldPassword, newPassword, confirmPassword } = passwordData;

      if (!oldPassword || !newPassword || !confirmPassword) {
        toast.error("Please fill all password fields.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/change-password`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setEditSection(null);
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // 🔹 Save UPI ID
  const handleSaveUpi = async () => {
    try {
      if (!formData.upiid || formData.upiid.trim() === "") {
        toast.error("Please enter a valid UPI ID.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}hosts/setupiid`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ upiid: formData.upiid }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("UPI ID saved successfully!");
        setHost((prev) => ({ ...prev, upiid: data.data.upiid }));
        setEditSection(null);
      } else {
        toast.error(data.message || "Failed to save UPI ID.");
      }
    } catch (err) {
      console.error("Error saving UPI ID:", err);
      toast.error("Something went wrong. Try again later.");
    }
  };

  // 🔹 Save basic/contact info
  const handleSave = async () => {
    try {
      let res, data, payload;

      if (editSection === "basic") {
        const basicData = { name: formData.name, dob: formData.dob };

        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}hosts/profile/update-basic`,
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
          setHost((prev) => ({
            ...prev,
            name: payload.name ?? prev.name,
            dob: payload.dob ?? prev.dob,
          }));
          setFormData((prev) => ({
            ...prev,
            name: payload.name ?? prev.name,
            dob: payload.dob ?? prev.dob,
          }));
          toast.success("Basic info updated!");
        }
      }

      if (editSection === "contact") {
        const contactData = { mobileNumber: formData.phone };

        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}hosts/profile/update-mobile`,
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
          const updatedPhone =
            payload.mobileNumber ||
            payload.phone ||
            payload.updatedPhone ||
            formData.phone;

          setHost((prev) => ({
            ...prev,
            phone: updatedPhone,
            isPhoneVerified:
              payload.isPhoneVerified !== undefined
                ? payload.isPhoneVerified
                : prev.isPhoneVerified,
          }));

          setFormData((prev) => ({
            ...prev,
            phone: updatedPhone,
          }));

          toast.success(
            `Mobile number updated to ${updatedPhone}. ${
              payload.isPhoneVerified ? "✅ Verified!" : "❌ Not Verified"
            }`
          );
        }
      }

      setEditSection(null);
      setPhotoFile(null);
    } catch (error) {
      console.error("Error updating host profile:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (!host) return <p className="text-center mt-10">Loading host profile...</p>;

  const isProfileVerified =
    host.name &&
    host.dob &&
    host.phone &&
    host.isEmailVerified &&
    host.isPhoneVerified;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
          {host.profile?.photo ? (
            <img
              src={host.profile.photo}
              alt="Host Profile"
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
            <h2 className="text-2xl font-bold">{host.name || "Unnamed Host"}</h2>
            <ShieldCheck
              className={`w-5 h-5 ${
                isProfileVerified ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
          <span className="text-gray-500 text-sm text-center sm:text-left">
            Joined on {new Date(host.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* 📸 Profile Photo Section */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-900" /> Profile Photo
          </h3>
          <button
            onClick={() =>
              setEditSection(editSection === "photo" ? null : "photo")
            }
            disabled={editSection && editSection !== "photo"}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            {editSection === "photo" ? "Cancel" : "Edit"}
          </button>
        </div>

        {editSection === "photo" && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <video
              id="hostVideo"
              autoPlay
              playsInline
              className="w-48 h-48 rounded-lg border shadow"
            ></video>

            <button
              onClick={handleCapture}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              Capture Selfie
            </button>

            <button
              onClick={handleUploadPhoto}
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

      {/* 🏦 UPI ID Section */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-900" /> UPI ID
          </h3>
          <button
            onClick={() => setEditSection(editSection === "upi" ? null : "upi")}
            disabled={editSection && editSection !== "upi"}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            {editSection === "upi" ? "Cancel" : host.upiid ? "Edit" : "Add"}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium">UPI ID</label>
            {editSection === "upi" ? (
              <input
                type="text"
                name="upiid"
                value={formData.upiid ?? ""}
                onChange={handleChange}
                placeholder="example@upi"
                className="w-full mt-1 p-2 border rounded-lg"
              />
            ) : (
              <p className="text-gray-700">
                {host.upiid ? host.upiid : "No UPI ID added yet."}
              </p>
            )}
          </div>
        </div>

        {editSection === "upi" && (
          <button
            onClick={handleSaveUpi}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Basic Info Section */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <button
            onClick={() => setEditSection(editSection === "basic" ? null : "basic")}
            disabled={editSection && editSection !== "basic"}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
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
                placeholder="Enter your full name"
                value={formData.name ?? ""}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            ) : (
              <p className="text-gray-700">{host.name || "Not set"}</p>
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
                {host.dob ? host.dob.split("T")[0] : "Not set"}
              </p>
            )}
          </div>
        </div>
        {editSection === "basic" && (
          <button
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Contact Info Section */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Contact & Verification</h3>
          <button
            onClick={() => setEditSection(editSection === "contact" ? null : "contact")}
            disabled={editSection && editSection !== "contact"}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            {editSection === "contact" ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="flex items-center gap-2 flex-wrap">
              <Mail className="w-5 h-5 text-gray-500" />
              <p className="text-gray-700 break-all">{host.email}</p>
              {host.isEmailVerified ? (
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
                <p className="text-gray-700">{host.phone || "Not set"}</p>
                {host.isPhoneVerified ? (
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Password Section */}
      {host.authProvider === "local" ? (
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
              className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
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
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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