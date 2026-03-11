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

    const isPending = status === "pending";
    const isApproved = status === "approved";
    const isRejected = status === "rejected";

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-950 flex items-center gap-3">
              <span className="text-blue-950">📄</span>
              {label}
            </h2>
            
            {/* Status Badge */}
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase border flex items-center gap-2 shadow-sm ${
              isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
              isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' : 
              isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : 
              'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {isApproved && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
              {isRejected && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
              {isPending && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
              {!status && <span className="w-2 h-2 rounded-full bg-slate-400"></span>}
              {status || "Not Uploaded"}
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-6 max-w-lg">
            Ensure the document is clear and all details are legible. Fast processing requires high-quality images.
          </p>

          {docUrl && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-950">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <p className="text-slate-800 text-sm font-bold">Document Uploaded</p>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-950 font-medium text-xs hover:text-blue-800 transition-colors underline underline-offset-2"
                  >
                    View securely
                  </a>
                </div>
              </div>
              {isApproved && (
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          )}

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <div className="relative w-full overflow-hidden">
              <input
                type="file"
                id={`file-${type}`}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full border-2 border-dashed rounded-2xl p-4 text-center text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                file ? 'bg-blue-50 border-blue-300 text-blue-950' : 'bg-white border-slate-300 text-slate-500 hover:border-blue-950'
              }`}>
                {file ? (
                  <>
                    <svg className="w-5 h-5 text-blue-950" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {file.name}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Choose file or drag & drop
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleUpload(type)}
              disabled={!file}
              className={`px-8 py-4 sm:py-4 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${
                !file 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-950 hover:bg-blue-900 text-white active:scale-95 cursor-pointer'
              }`}
            >
              {docUrl ? "Update doc" : "Upload secure"}
            </button>
          </div>
          
          {isRejected && (
            <p className="mt-4 text-sm text-rose-600 font-medium bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Verification failed. Please ensure the document is clearly legible and upload again.
            </p>
          )}
        </div>
      </div>
    );
  };

  /* ---------------- PAGE ---------------- */

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-28 relative">
      <div className="bg-white rounded-[2rem] p-8 sm:p-12 w-full max-w-3xl border border-slate-200 relative z-10 shadow-sm animate-in fade-in duration-500">
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-100 rotate-3">
            <svg className="w-10 h-10 text-blue-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-950 tracking-tight mb-4">
            Identity Verification
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
            To unlock the full potential of RideNow, please securely submit your documents. Your data is encrypted and safe.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
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
        </div>

        {(aadharStatus === "pending" || dlStatus === "pending") && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm animate-in fade-in zoom-in-95">
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-amber-500 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-800 mb-1">Verification in Progress</h3>
            <p className="text-sm font-medium text-amber-700/80">
              Your documents are securely submitted. Our team is reviewing them manually. This usually takes less than 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}