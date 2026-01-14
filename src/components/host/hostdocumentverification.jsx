import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function HostDocumentVerification() {
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharStatus, setAadharStatus] = useState("pending");
  const [existingDoc, setExistingDoc] = useState(null);

  /* ---------------- FETCH EXISTING DOC ---------------- */
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

  /* ---------------- UPLOAD HANDLER ---------------- */
  const handleUpload = async () => {
    try {
      if (!aadharFile) {
        toast.error("Please select an Aadhaar file first");
        return;
      }

      const formData = new FormData();
      formData.append("aadhar", aadharFile);

      toast.loading("Uploading Aadhaar...", { id: "upload" });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}hosts/verify-aadhar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.dismiss("upload");

      if (res.data.success) {
        toast.success("Aadhaar uploaded successfully. Verification pending.");

        setExistingDoc(res.data.data?.docUrl);
        setAadharStatus("pending");
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (err) {
      toast.dismiss("upload");
      console.error("Aadhaar upload error:", err);
      toast.error("Error uploading Aadhaar. Please try again.");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-16">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-2xl border">
        <h1 className="text-4xl font-bold text-blue-900 text-center mb-4">
          Host Document Upload
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Upload your Aadhaar Card. Our team will manually verify it.
        </p>

        <div className="border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-2">
            Aadhaar Card
          </h2>

          <p className="text-gray-500 text-sm mb-4">
            Accepted formats: PDF, JPG, PNG
          </p>

          {/* Existing document */}
          {existingDoc && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium mb-1">
                📄 Uploaded document:
              </p>
              <a
                href={existingDoc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline break-all text-sm"
              >
                View Aadhaar
              </a>
            </div>
          )}

          {/* Upload */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setAadharFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg p-2"
            />

            <button
              onClick={handleUpload}
              className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-800 transition"
            >
              {existingDoc ? "Re-upload" : "Upload"}
            </button>
          </div>

          {/* Status */}
          <div className="mt-4 text-sm">
            {aadharStatus === "pending" && (
              <p className="text-yellow-600 font-medium">
                ⏳ Verification pending (manual review)
              </p>
            )}
            {aadharStatus === "approved" && (
              <p className="text-green-600 font-medium">
                ✅ Approved
              </p>
            )}
            {aadharStatus === "rejected" && (
              <p className="text-red-600 font-medium">
                ❌ Rejected – please re-upload
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}