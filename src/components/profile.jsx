import { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck,Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
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
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(blob));

      cameraStream?.getTracks().forEach((t) => t.stop());
      setCameraStream(null);

      toast.success("Photo captured");
    }, "image/jpeg");
  };

  const handleRetake = () => {
    setPhotoFile(null);
    setPreviewUrl(null);
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
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-slate-100 border-b border-slate-200"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center gap-8 mt-4 sm:mt-8">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
              {user.profile?.photo ? (
                <img
                  src={user.profile.photo}
                  alt="Profile"
                  className="relative w-full h-full rounded-full object-cover shadow-sm border-4 border-white bg-white"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center rounded-full bg-slate-100 border-4 border-white shadow-sm">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-black tracking-tight">
                  {user.name || "Unnamed User"}
                </h2>
                {isProfileVerified && (
                  <ShieldCheck
                    className="w-6 h-6 text-emerald-500 drop-shadow-sm"
                    title="Profile Verified"
                  />
                )}
              </div>
              
              {!isProfileVerified && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Profile Incomplete / Not Verified
                </div>
              )}
              
              <span className="text-slate-500 font-medium">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Photo Card */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-black">Profile Photo</h3>
            <button
              onClick={() =>
                setEditSection(editSection === "photo" ? null : "photo")
              }
              className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {editSection === "photo" ? "Cancel" : "Update Photo"}
            </button>
          </div>

          {editSection === "photo" && (
            <div className="mt-4 flex flex-col items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              {previewUrl ? (
                <>
                  <div className="relative p-2 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
                    <img
                      src={previewUrl}
                      className="w-48 h-48 rounded-xl object-cover"
                      alt="Preview"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleRetake}
                      className="px-5 py-2.5 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2.5 font-bold text-white bg-black rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Use This Photo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <video
                      id="video"
                      autoPlay
                      playsInline
                      className="w-48 h-48 rounded-xl object-cover bg-slate-900"
                    />
                  </div>
                  <button
                    onClick={handleCapture}
                    className="px-5 py-2.5 font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-md transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Take Selfie
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-black">Basic Information</h3>
            <button
              onClick={() =>
                setEditSection(editSection === "basic" ? null : "basic")
              }
              disabled={editSection && editSection !== "basic"}
              className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {editSection === "basic" ? "Cancel" : "Edit Details"}
            </button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Legal Name</label>
              {editSection === "basic" ? (
                <input
                  type="text"
                  name="name"
                  placeholder="As per Aadhaar card"
                  value={formData.name ?? ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all font-medium"
                />
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <p className="text-slate-800 font-medium">{user.name || "Not provided"}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Date of Birth</label>
              {editSection === "basic" ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? formData.dob.split("T")[0] : ""}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all font-medium"
                />
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <p className="text-slate-800 font-medium">
                    {user.dob ? user.dob.split("T")[0] : "Not provided"}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {editSection === "basic" && (
            <div className="mt-8 flex justify-end animate-in fade-in">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-black">Contact Details</h3>
            <button
              onClick={() =>
                setEditSection(editSection === "contact" ? null : "contact")
              }
              disabled={editSection && editSection !== "contact"}
              className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {editSection === "contact" ? "Cancel" : "Update Phone"}
            </button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Email Address</label>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <p className="text-slate-800 font-medium truncate">{user.email}</p>
                </div>
                {user.isEmailVerified ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" />
                ) : (
                  <span className="text-amber-500 text-xs font-bold uppercase tracking-wider bg-amber-50 px-2 py-1 rounded ml-2 flex-shrink-0">Unverified</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Phone Number</label>
              {editSection === "contact" ? (
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone ?? ""}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all font-medium"
                    placeholder="+91"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <p className="text-slate-800 font-medium">{user.phone || "Not provided"}</p>
                  </div>
                  {user.isPhoneVerified ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="text-amber-500 text-xs font-bold uppercase tracking-wider bg-amber-50 px-2 py-1 rounded">Unverified</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {editSection === "contact" && (
            <div className="mt-8 flex justify-end animate-in fade-in">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto"
              >
                Save Phone Number
              </button>
            </div>
          )}
        </div>

        {/* Password Section */}
        {user.authProvider === "local" ? (
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-black flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-400" /> Security
              </h3>
              <button
                onClick={() =>
                  setEditSection(editSection === "password" ? null : "password")
                }
                disabled={editSection && editSection !== "password"}
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {editSection === "password" ? "Cancel" : "Change Password"}
              </button>
            </div>

            {editSection === "password" && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, oldPassword: e.target.value }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
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
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Google Account</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Your account is linked with Google. Password management is handled through your Google account settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}