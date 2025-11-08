import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DocumentVerification() {
  const [aadharFile, setAadharFile] = useState(null);
  const [dlFile, setDLFile] = useState(null);
  const [aadharStatus, setAadharStatus] = useState("pending");
  const [dlStatus, setDLStatus] = useState("pending");
  const [existingDocs, setExistingDocs] = useState({ aadhar: null, dl: null });

  // 🔹 Fetch existing documents on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}users/get-documents`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setExistingDocs({
            aadhar: res.data.documents?.aadhar || null,
            dl: res.data.documents?.dl || null,
          });
          setAadharStatus(res.data.documents?.aadharStatus || "pending");
          setDLStatus(res.data.documents?.dlStatus || "pending");
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        toast.error("Failed to load document info");
      }
    };
    fetchDocs();
  }, []);

  // 🔹 Upload Handler (Generic for Aadhar/DL)
  const handleUpload = async (type) => {
    try {
      const file = type === "aadhar" ? aadharFile : dlFile;
      if (!file) {
        toast.error(`Please upload a ${type.toUpperCase()} file first`);
        return;
      }

      const formData = new FormData();
      formData.append(type, file);

      toast.loading(`Verifying ${type.toUpperCase()}...`, { id: "verify" });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}users/verify-${type}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.dismiss("verify");

      if (res.data.success) {
        toast.success(res.data.message || `${type.toUpperCase()} verified! ✅`);

        if (type === "aadhar") {
          setAadharStatus("approved");
          setExistingDocs((prev) => ({
            ...prev,
            aadhar: res.data?.data?.docUrl || file.name,
          }));
        } else {
          setDLStatus("approved");
          setExistingDocs((prev) => ({
            ...prev,
            dl: res.data?.data?.docUrl || file.name,
          }));
        }
      } else {
        toast.error(res.data.message || `${type.toUpperCase()} not found ❌`);
        if (type === "aadhar") setAadharStatus("rejected");
        else setDLStatus("rejected");
      }
    } catch (err) {
      toast.dismiss("verify");
      console.error(`${type} verification error:`, err);
      toast.error(`Error verifying ${type.toUpperCase()}. Please try again.`);
    }
  };

  // 🔹 Upload Section Renderer (Simplified)
  const renderUploadSection = (type, label, file, setFile, status) => {
    const docUrl = existingDocs[type];

    return (
      <div className="mb-8 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
        <h2 className="text-2xl font-semibold text-blue-900 mb-3">{label}</h2>
        <p className="text-gray-500 text-sm mb-4">
          Upload your {label} file (PDF, JPG, or PNG). Verification will happen automatically.
        </p>

        {/* ✅ Show document link if already uploaded */}
        {docUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm font-medium">
              📄 Current {label} URL:
            </p>
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline break-all text-sm"
            >
              {docUrl}
            </a>
          </div>
        )}

        {/* ✅ File Upload Input */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <input
            type="file"
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleUpload(type)}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition duration-300 ${
              docUrl
                ? "bg-blue-800 hover:bg-blue-900"
                : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {docUrl ? "Re-upload & Verify" : "Upload & Verify"}
          </button>
        </div>

        {/* ✅ Status Display */}
        <div className="mt-4 text-sm">
          {status === "approved" && (
            <p className="text-green-600 font-medium">✅ Verified</p>
          )}
          {status === "pending" && (
            <p className="text-yellow-600 font-medium">⏳ Pending Verification</p>
          )}
          {status === "rejected" && (
            <p className="text-red-600 font-medium">❌ Verification Failed</p>
          )}
        </div>
      </div>
    );
  };

  // 🔹 Main Page Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-16">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-3xl border border-gray-200">
        <h1 className="text-4xl font-bold text-blue-900 text-center mb-4">
          Document Verification
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload your Aadhaar and Driving Licence documents for secure verification.
        </p>

        {renderUploadSection(
          "aadhar",
          "Aadhaar Card",
          aadharFile,
          setAadharFile,
          aadharStatus
        )}
        {renderUploadSection("dl", "Driving Licence", dlFile, setDLFile, dlStatus)}

        {/* ✅ Show success message if both verified */}
        {aadharStatus === "approved" && dlStatus === "approved" && (
          <div className="text-center bg-green-50 border border-green-200 rounded-xl py-4 mt-6">
            <p className="text-green-700 font-semibold">
              🎉 All documents verified successfully! Your account is now verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}