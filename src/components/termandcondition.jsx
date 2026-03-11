import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-200/40 to-transparent rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="max-w-4xl mx-auto bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[3rem] p-8 sm:p-12 lg:p-16 relative z-10 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
            <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Please read these terms carefully before booking a vehicle or using the RideNow platform.
          </p>
        </div>

        {/* CONTENT */}
        <div className="space-y-10 text-slate-700 text-base leading-relaxed">

          {/* SECTION 1 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">1</span>
              Renter Eligibility
            </h2>
            <ul className="list-none space-y-3 pl-0 sm:pl-11">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>You must be <strong className="text-slate-900">18 years or older</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>You must possess a <strong className="text-slate-900">valid Driving Licence</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>A valid government ID (Aadhaar / Passport) is mandatory.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>You agree to provide <strong className="text-slate-900">original documents</strong> for verification at pickup.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-slate-600 italic">The host may temporarily retain an original document (e.g. Driving Licence) until vehicle return.</span>
              </li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* SECTION 2 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">2</span>
              Vehicle Usage & Safety
            </h2>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-4">
              <p className="font-bold text-rose-600 flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Strictly Prohibited
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 font-medium">
                <li>Only the registered renter may use the vehicle. <strong>No sharing or sub-letting.</strong></li>
                <li>No minors, intoxicated persons, or unlicensed riders.</li>
                <li>Racing, stunts, illegal use, or overloading.</li>
              </ul>
            </div>
            <ul className="list-disc pl-5 sm:pl-11 space-y-2 text-slate-700">
              <li>All <strong>Indian traffic laws</strong> must be followed strictly.</li>
              <li>Wearing a <strong>helmet is mandatory</strong> for rider and pillion.</li>
              <li>The vehicle is for <strong>personal use only</strong>.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* SECTION 3 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">3</span>
              Liability & Financial Responsibility
            </h2>
            <ul className="list-disc pl-5 sm:pl-11 space-y-3">
              <li>You are fully responsible for <strong className="text-rose-600">damage, theft, or loss</strong> during the rental period.</li>
              <li>All repair costs, fines, challans, tolls, cleaning charges, and late fees must be paid by the renter.</li>
              <li>Any accident or theft must be reported immediately to the host and police (if required).</li>
              <li>The vehicle must be returned in the same condition, excluding normal wear and tear.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* SECTION 4 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">4</span>
              Insurance & Platform Liability
            </h2>
            <ul className="list-disc pl-5 sm:pl-11 space-y-3">
              <li>The vehicle may have <strong>third-party insurance only</strong>.</li>
              <li>Any additional coverage, excess, or uncovered loss is the renter’s responsibility.</li>
              <li>RideNow acts only as a platform and is not liable for disputes, losses, or damages.</li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 sm:p-10 text-center mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-slate-600 mb-6 font-medium max-w-lg mx-auto">
              By booking a vehicle on RideNow, you confirm that you have read, understood, and agree to comply with all conditions listed above. You accept full responsibility during the rental period.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 w-full sm:w-auto"
            >
              I Understand & Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}