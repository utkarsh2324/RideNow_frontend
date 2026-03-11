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
  const [previewUrl, setPreviewUrl] = useState(null);
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

  useEffect(() => {
    if (editSection === "photo" && !previewUrl) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setCameraStream(stream);
          const video = document.getElementById("hostVideo");
          if (video) video.srcObject = stream;
        })
        .catch(() => toast.error("Camera access denied"));
    }

    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    };
  }, [editSection, previewUrl]);

  const handleCapture = () => {
    const video = document.getElementById("hostVideo");
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(blob));

      cameraStream?.getTracks().forEach((t) => t.stop());
      setCameraStream(null);

      toast.success("Selfie captured");
    }, "image/jpeg");
  };

  const handleRetake = () => {
    setPhotoFile(null);
    setPreviewUrl(null);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return toast.error("Capture a selfie first");

    const fd = new FormData();
    fd.append("photo", photoFile);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}hosts/profile/upload-photo`,
      { method: "POST", credentials: "include", body: fd }
    );

    const json = await res.json();
    const payload = json?.data ?? json;

    if (res.ok) {
      setHost((p) => ({
        ...p,
        profile: { ...p.profile, photo: payload.photo },
      }));
      toast.success("Profile photo uploaded!");
      setEditSection(null);
      setPhotoFile(null);
      setPreviewUrl(null);
    } else {
      toast.error(payload.message || "Upload failed");
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
            {host.profile?.photo ? (
              <img
                src={host.profile.photo}
                alt="Host Profile"
                className="w-full h-full rounded-2xl object-cover shadow-[0_4px_20px_rgb(0,0,0,0.08)] border-4 border-white"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-2xl bg-slate-200 shadow-sm border-4 border-white">
                <User className="w-14 h-14 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center w-full space-y-2">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight">{host.name || "Unnamed Host"}</h2>
              <ShieldCheck
                className={`w-6 h-6 ${
                  isProfileVerified ? "text-emerald-500" : "text-slate-300"
                }`}
              />
            </div>
            <span className="text-slate-500 text-sm font-medium text-center sm:text-left">
              Joined on {new Date(host.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* 📸 Profile Photo Section */}
        <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 flex items-center gap-3">
              <Camera className="w-5 h-5 text-indigo-600" /> Profile Photo
            </h3>
            <button
              onClick={() =>
                setEditSection(editSection === "photo" ? null : "photo")
              }
              className="cursor-pointer px-4 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {editSection === "photo" ? "Cancel" : "Edit"}
            </button>
          </div>

        {editSection === "photo" && (
          <div className="mt-4 flex flex-col items-center gap-4">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  className="w-48 h-48 rounded-lg object-cover border"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleRetake}
                    className="cursor-pointer px-5 py-2.5 font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleUploadPhoto}
                    className="cursor-pointer px-5 py-2.5 font-medium bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
                  >
                    Upload Selfie
                  </button>
                </div>
              </>
            ) : (
              <>
                <video
                  id="hostVideo"
                  autoPlay
                  playsInline
                  className="w-48 h-48 rounded-2xl border"
                />
                <button
                  onClick={handleCapture}
                  className="cursor-pointer px-5 py-2.5 font-medium bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
                >
                  Capture Selfie
                </button>
              </>
            )}
          </div>
        )}
      </div>
        {/* 🏦 UPI ID Section */}
        <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-indigo-600" /> UPI ID
            </h3>
            <button
              onClick={() => setEditSection(editSection === "upi" ? null : "upi")}
              disabled={editSection && editSection !== "upi"}
              className="cursor-pointer px-4 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {editSection === "upi" ? "Cancel" : host.upiid ? "Edit" : "Add"}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">UPI ID</label>
            {editSection === "upi" ? (
              <input
                type="text"
                name="upiid"
                value={formData.upiid ?? ""}
                onChange={handleChange}
                placeholder="example@upi"
                className="w-full mt-1 p-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950/20"
              />
            ) : (
              <p className="text-slate-600 font-medium bg-slate-50 border border-slate-100 p-3 rounded-xl mt-1">
                {host.upiid ? host.upiid : "No UPI ID added yet. Add one to receive payouts."}
              </p>
            )}
          </div>
        </div>

        {editSection === "upi" && (
          <button
            onClick={handleSaveUpi}
            className="cursor-pointer mt-6 px-6 py-3 font-semibold bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        )}
      </div>

        {/* Basic Info Section */}
        <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 flex items-center gap-3">
              <User className="w-5 h-5 text-indigo-600" /> Basic Information
            </h3>
            <button
              onClick={() => setEditSection(editSection === "basic" ? null : "basic")}
              disabled={editSection && editSection !== "basic"}
              className="cursor-pointer px-4 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {editSection === "basic" ? "Cancel" : "Edit"}
            </button>
          </div>
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
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
            className="cursor-pointer mt-6 px-6 py-3 font-semibold bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Contact Info Section */}
      <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-6 sm:p-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-blue-950 flex items-center gap-3">
            <Phone className="w-5 h-5 text-indigo-600" /> Contact & Verification
          </h3>
          <button
            onClick={() => setEditSection(editSection === "contact" ? null : "contact")}
            disabled={editSection && editSection !== "contact"}
            className="cursor-pointer px-4 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {editSection === "contact" ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <div className="flex items-center gap-2 flex-wrap">
              <Mail className="w-5 h-5 text-slate-400" />
              <p className="text-slate-600 font-medium break-all">{host.email}</p>
              {host.isEmailVerified ? (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              ) : (
                <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Not Verified</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
            {editSection === "contact" ? (
              <input
                type="text"
                name="phone"
                value={formData.phone ?? ""}
                onChange={handleChange}
                className="cursor-pointer w-full mt-1 p-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950/20"
              />
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-5 h-5 text-slate-400" />
                <p className="text-slate-600 font-medium">{host.phone || "Not set"}</p>
                {host.isPhoneVerified ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Not Verified</span>
                )}
              </div>
            )}
          </div>
        </div>
        {editSection === "contact" && (
          <button
            onClick={handleSave}
            className="cursor-pointer mt-6 px-6 py-3 font-semibold bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Password Section */}
      {host.authProvider === "local" ? (
        <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-600" /> Change Password
            </h3>
            <button
              onClick={() =>
                setEditSection(editSection === "password" ? null : "password")
              }
              disabled={editSection && editSection !== "password"}
              className="cursor-pointer px-4 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {editSection === "password" ? "Cancel" : "Edit"}
            </button>
          </div>

            {editSection === "password" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full mt-1 p-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full mt-1 p-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full mt-1 p-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950/20"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="cursor-pointer mt-6 px-6 py-3 font-semibold bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
                >
                  Save New Password
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-8 text-center text-slate-500 font-medium">
            <Lock className="w-8 h-8 mx-auto mb-3 text-slate-400" />
            Password management is handled via Google account.
          </div>
        )}
      </div>
    </div>
  );
}