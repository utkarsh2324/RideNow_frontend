import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DocumentVerification() {
  const [aadharFile, setAadharFile] = useState(null);
  const [dlFile, setDLFile] = useState(null);

  const [aadharStatus, setAadharStatus] = useState("pending");
  const [dlStatus, setDLStatus] = useState("pending");

  const [existingDocs, setExistingDocs] = useState({
    aadhar: null,
    dl: null,
  });

  /* ---------------- FETCH EXISTING DOCS ---------------- */

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
        toast.error("Failed to load document information");
      }
    };

    fetchDocs();
  }, []);

  /* ---------------- UPLOAD HANDLER ---------------- */

  const handleUpload = async (type) => {
    try {
      const file = type === "aadhar" ? aadharFile : dlFile;
      if (!file) {
        toast.error(`Please select a ${type.toUpperCase()} file`);
        return;
      }

      const formData = new FormData();
      formData.append(type, file);

      toast.loading("Uploading document...", { id: "upload" });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}users/verify-${type}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.dismiss("upload");

      if (res.data.success) {
        toast.success("Document uploaded successfully. Verification pending.");

        if (type === "aadhar") {
          setExistingDocs((prev) => ({
            ...prev,
            aadhar: res.data?.data?.docUrl,
          }));
          setAadharStatus("pending");
        } else {
          setExistingDocs((prev) => ({
            ...prev,
            dl: res.data?.data?.docUrl,
          }));
          setDLStatus("pending");
        }
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (err) {
      toast.dismiss("upload");
      console.error("Upload error:", err);
      toast.error("Error uploading document. Please try again.");
    }
  };

  /* ---------------- UI SECTION ---------------- */

  const renderUploadSection = (type, label, file, setFile, status) => {
    const docUrl = existingDocs[type];

    return (
      <div className="mb-8 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
        <h2 className="text-2xl font-semibold text-blue-900 mb-2">{label}</h2>

        <p className="text-gray-500 text-sm mb-4">
          Upload your {label}. Our team will manually review and verify it.
        </p>

        {/* Uploaded document */}
        {docUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm font-medium mb-1">
              📄 Uploaded document:
            </p>
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline break-all text-sm"
            >
              View document
            </a>
          </div>
        )}

        {/* File input */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer"
          />
          <button
            onClick={() => handleUpload(type)}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-800 transition"
          >
            {docUrl ? "Re-upload" : "Upload"}
          </button>
        </div>

        {/* Status */}
        <div className="mt-4 text-sm">
          {status === "pending" && (
            <p className="text-yellow-600 font-medium">
              ⏳ Verification pending (manual review)
            </p>
          )}
          {status === "approved" && (
            <p className="text-green-600 font-medium">
              ✅ Approved
            </p>
          )}
          {status === "rejected" && (
            <p className="text-red-600 font-medium">
              ❌ Rejected – please re-upload
            </p>
          )}
        </div>
      </div>
    );
  };

  /* ---------------- PAGE ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-16">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-3xl border">
        <h1 className="text-4xl font-bold text-blue-900 text-center mb-4">
          Document Upload
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Upload your documents. Our team will manually verify them.
        </p>

        {renderUploadSection(
          "aadhar",
          "Aadhaar Card",
          aadharFile,
          setAadharFile,
          aadharStatus
        )}

        {renderUploadSection(
          "dl",
          "Driving Licence",
          dlFile,
          setDLFile,
          dlStatus
        )}

        {(aadharStatus === "pending" || dlStatus === "pending") && (
          <div className="text-center bg-yellow-50 border border-yellow-200 rounded-xl py-4 mt-6">
            <p className="text-yellow-700 font-semibold">
              ⏳ Documents submitted. Verification will be completed manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}