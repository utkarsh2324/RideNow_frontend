import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function HostDocumentVerification() {
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharStatus, setAadharStatus] = useState("pending");
  const [existingDoc, setExistingDoc] = useState(null);

  // 🔹 Fetch existing Aadhaar document on mount
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}hosts/get-documents`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setExistingDoc(res.data.document?.aadhar || null);
          setAadharStatus(res.data.document?.aadharStatus || "pending");
        }
      } catch (err) {
        console.error("Error fetching host document:", err);
        toast.error("Failed to load Aadhaar info");
      }
    };
    fetchDoc();
  }, []);

  // 🔹 Upload Handler
  const handleUpload = async () => {
    try {
      if (!aadharFile) {
        toast.error("Please upload an Aadhaar file first");
        return;
      }

      const formData = new FormData();
      formData.append("aadhar", aadharFile);

      toast.loading("Verifying Aadhaar...", { id: "verify" });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}hosts/verify-aadhar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.dismiss("verify");

      if (res.data.success) {
        toast.success(res.data.message || "Aadhaar verified successfully ✅");
        setAadharStatus("approved");
        setExistingDoc(res.data?.data?.docUrl || aadharFile.name);
      } else {
        toast.error(res.data.message || "Aadhaar not found ❌");
        setAadharStatus("rejected");
      }
    } catch (err) {
      toast.dismiss("verify");
      console.error("Aadhaar verification error:", err);
      toast.error("Error verifying Aadhaar. Please try again.");
    }
  };

  // 🔹 Upload Section Renderer
  const renderUploadSection = () => {
    const docUrl = existingDoc;

    return (
      <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
        <h2 className="text-2xl font-semibold text-blue-900 mb-3">
          Aadhaar Card Verification
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Upload your Aadhaar Card file (PDF, JPG, or PNG). Verification will
          happen automatically.
        </p>

        {/* ✅ Show existing Aadhaar link if available */}
        {docUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm font-medium">
              📄 Current Aadhaar URL:
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

        {/* ✅ Upload input */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <input
            type="file"
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={(e) => setAadharFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUpload}
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
          {aadharStatus === "approved" && (
            <p className="text-green-600 font-medium">✅ Verified</p>
          )}
          {aadharStatus === "pending" && (
            <p className="text-yellow-600 font-medium">⏳ Pending Verification</p>
          )}
          {aadharStatus === "rejected" && (
            <p className="text-red-600 font-medium">❌ Verification Failed</p>
          )}
        </div>
      </div>
    );
  };

  // 🔹 Main Page Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-16">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-2xl border border-gray-200">
        <h1 className="text-4xl font-bold text-blue-900 text-center mb-4">
          Host Document Verification
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload your Aadhaar Card to verify your host account securely.
        </p>

        {renderUploadSection()}

        {/* ✅ Success banner */}
        {aadharStatus === "approved" && (
          <div className="text-center bg-green-50 border border-green-200 rounded-xl py-4 mt-6">
            <p className="text-green-700 font-semibold">
              🎉 Aadhaar verified successfully! Your host account is verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}