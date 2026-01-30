import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-6 sm:p-10">

        {/* HEADER */}
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
          RideNow – Terms & Conditions
        </h1>
        <p className="text-gray-600 mb-8">
          Please read these terms carefully before booking a vehicle.
        </p>

        {/* CONTENT */}
        <div className="space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">

          {/* SECTION 1 */}
          <section>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              1. Renter Eligibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be <strong>18 years or older</strong>.</li>
              <li>You must possess a <strong>valid Driving Licence</strong>.</li>
              <li>A valid government ID (Aadhaar / Passport) is mandatory.</li>
              <li>
                You agree to provide <strong>original documents</strong> for
                verification at pickup.
              </li>
              <li>
                The host may temporarily retain an original document (e.g.
                Driving Licence) until vehicle return.
              </li>
            </ul>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              2. Vehicle Usage & Safety
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Only the registered renter may use the vehicle.
                <strong> No sharing or sub-letting.</strong>
              </li>
              <li>No minors, intoxicated persons, or unlicensed riders.</li>
              <li>
                All <strong>Indian traffic laws</strong> must be followed.
              </li>
              <li>
                Wearing a <strong>helmet is mandatory</strong>.
              </li>
              <li>
                The vehicle is for <strong>personal use only</strong>.
              </li>
              <li>
                Prohibited activities include racing, stunts, illegal use,
                or overloading.
              </li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              3. Liability, Damage & Loss
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You are fully responsible for <strong>damage, theft, or loss</strong>
                during the rental period.
              </li>
              <li>
                All repair costs, fines, challans, tolls, cleaning charges,
                and late fees must be paid by the renter.
              </li>
              <li>
                Any accident or theft must be reported immediately to the
                host and police (if required).
              </li>
              <li>
                The vehicle must be returned in the same condition,
                excluding normal wear and tear.
              </li>
            </ul>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              4. Insurance & Financial Responsibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The vehicle may have <strong>third-party insurance only</strong>.
              </li>
              <li>
                Any additional coverage, excess, or uncovered loss is the
                renter’s responsibility.
              </li>
              <li>
                RideNow acts only as a platform and is not liable for disputes,
                losses, or damages.
              </li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              5. Acceptance of Terms
            </h2>
            <p>
              By booking a vehicle on RideNow, you confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>You have read and understood these terms.</li>
              <li>You agree to comply with all conditions listed above.</li>
              <li>You accept full responsibility during the rental period.</li>
            </ul>
          </section>
        </div>

        {/* ACTION */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}