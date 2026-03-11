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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
      <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 rounded-3xl p-8 sm:p-10 w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-blue-950 text-center mb-4 tracking-tight">
          Host Document Upload
        </h1>

        <p className="text-center text-slate-500 mb-10 font-medium">
          Upload your Aadhaar Card. Our team will manually verify it.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-blue-950 mb-1">
            Aadhaar Card
          </h2>

          <p className="text-slate-500 text-sm mb-6 font-medium">
            Accepted formats: PDF, JPG, PNG
          </p>

          {/* Existing document */}
          {existingDoc && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
              <p className="text-indigo-800 text-sm font-semibold mb-2">
                📄 Uploaded document:
              </p>
              <a
                href={existingDoc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline break-all text-sm font-medium transition-colors"
              >
                View Aadhaar
              </a>
            </div>
          )}

          {/* Upload */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setAadharFile(e.target.files[0])}
              className="w-full border border-slate-300 bg-white rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-950/20"
            />

            <button
              onClick={handleUpload}
              className="px-8 py-3 rounded-xl font-bold text-white bg-blue-950 hover:bg-blue-900 transition-all shadow-sm active:scale-95 shrink-0"
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