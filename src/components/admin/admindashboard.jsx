import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const TABS = ["users", "hosts", "vehicles"];

/* ================= STATUS BADGE ================= */
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

/* ================= MAIN ================= */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [list, setList] = useState([]);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}admins/${activeTab}`,
        { withCredentials: true }
      );
      setList(res.data.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [activeTab]);

  const fetchDetails = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}admins/${activeTab}/${id}`,
        { withCredentials: true }
      );
      setDetails(res.data.data);
    } catch {
      toast.error("Failed to load details");
    }
  };

  /* ============== DOC ACTIONS ============== */

  const updateUserDoc = async (userId, docIndex, status) => {
    await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}admins/users/document`,
      { userId, docIndex, status },
      { withCredentials: true }
    );
    toast.success("User document updated");
    fetchDetails(userId);
    fetchList();
  };

  const updateHostDoc = async (hostId, status) => {
    await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}admins/hosts/document`,
      { hostId, status },
      { withCredentials: true }
    );
    toast.success("Host document updated");
    fetchDetails(hostId);
    fetchList();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 pt-28">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Manage users, hosts, and vehicles</p>
          </div>
          
          {/* TABS */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setDetails(null);
                }}
                className={`cursor-pointer px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
              <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Name / Model</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Email</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Stats / Status</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-500 font-medium">
                        No records found
                      </td>
                    </tr>
                  ) : list.map((i) => (
                    <tr key={i._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5 font-bold text-slate-800">{i.name || i.scootyModel}</td>
                      <td className="p-5 text-slate-600 font-medium">{i.email || i.host?.email}</td>
                      <td className="p-5 text-slate-600">
                        {activeTab === "users" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                            Total {i.totalRides} rides
                          </span>
                        )}
                        {activeTab === "hosts" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                            {i.totalVehicles} vehicles
                          </span>
                        )}
                        {activeTab === "vehicles" && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                            i.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {i.isVerified ? "Verified" : "Pending"}
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => fetchDetails(i._id)}
                          className="cursor-pointer px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-sm font-bold text-slate-700 shadow-sm transition-all active:scale-95 group-hover:shadow-md"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {details && (
          <DetailsModal
            tab={activeTab}
            data={details}
            onClose={() => setDetails(null)}
            onUserDoc={updateUserDoc}
            onHostDoc={updateHostDoc}
          />
        )}
      </div>
    </div>
  );
}

/* ================= DETAILS MODAL ================= */
function DetailsModal({ tab, data, onClose, onUserDoc, onHostDoc }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[92%] max-h-[92%] overflow-y-auto rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Details</h2>
          <button onClick={onClose} className="cursor-pointer text-red-600">✕</button>
        </div>

        {/* ========== USERS ========== */}
        {tab === "users" && (
          <>
            <UserHeader user={data.user} />

            <div className="grid grid-cols-2 gap-4 my-4">
              <SummaryCard title="Total Rides" value={data.totalRides} />
              <SummaryCard title="Total Spent" value={`₹${data.totalSpent}`} />
            </div>

            <h3 className="font-semibold mt-6 mb-2">Documents</h3>
            {data.documents.length === 0 && (
              <p className="text-gray-500 italic">No documents uploaded yet</p>
            )}

            {data.documents.map((d, i) => (
              <div key={i} className="border p-3 rounded mb-2 flex justify-between">
                <div className="flex gap-3 items-center">
                  <span>{d.docType}</span>

                  {d.docUrl ? (
                    <a href={d.docUrl} target="_blank" className="cursor-pointer text-blue-600">
                      View
                    </a>
                  ) : (
                    <span className="italic text-gray-500">
                      Not uploaded yet
                    </span>
                  )}

                  <StatusBadge status={d.status} />
                </div>

                {d.docUrl && d.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUserDoc(data.user._id, i, "approved")}
                      className="cursor-pointer bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onUserDoc(data.user._id, i, "rejected")}
                      className="cursor-pointer bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ========== HOSTS ========== */}
        {tab === "hosts" && (
          <>
            <HostHeader host={data.host} />

            <div className="grid grid-cols-3 gap-4 my-4">
              <SummaryCard title="Vehicles" value={data.vehicles.length} />
              <SummaryCard title="Bookings" value={data.totalBookings} />
              <SummaryCard title="Earnings" value={`₹${data.totalEarnings}`} />
            </div>

            <h3 className="font-semibold mt-6 mb-2">Aadhaar</h3>

            {!data.documents?.docUrl ? (
              <p className="italic text-gray-500">Aadhaar not uploaded yet</p>
            ) : (
              <div className="border p-3 rounded flex justify-between">
                <div className="flex gap-3 items-center">
                  <a
                    href={data.documents.docUrl}
                    target="_blank"
                    className="cursor-pointer text-blue-600"
                  >
                    View
                  </a>
                  <StatusBadge status={data.documents.status} />
                </div>

                {data.documents.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onHostDoc(data.host._id, "approved")}
                      className="cursor-pointer bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onHostDoc(data.host._id, "rejected")}
                      className="cursor-pointer bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========== VEHICLES ========== */}
        {tab === "vehicles" && (
          <>
            <h3 className="font-semibold mb-2">
              {data.scootyModel} — {data.city}
            </h3>

            <div className="grid grid-cols-3 gap-4 my-4">
              <SummaryCard title="Bookings" value={data.totalBookings} />
              <SummaryCard title="Earnings" value={`₹${data.totalEarnings}`} />
              <SummaryCard title="Host" value={data.host.email} />
            </div>

            <div className="flex gap-3 my-3">
              {data.photos.map((p, i) => (
                <img key={i} src={p} className="w-32 h-24 rounded object-cover" />
              ))}
            </div>

            {data.rc ? (
              <a href={data.rc} target="_blank" className="cursor-pointer text-blue-600">
                View RC
              </a>
            ) : (
              <p className="italic text-gray-500">RC not uploaded yet</p>
            )}

            <h3 className="font-semibold mt-6">Bookings</h3>
            {data.bookings.map((b, i) => (
              <div key={i} className="border p-3 rounded my-2">
                <p>User: {b.user?.email || "N/A"}</p>
                <p>₹{b.totalPrice}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */
const SummaryCard = ({ title, value }) => (
  <div className="bg-gray-100 rounded-lg p-4 text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const UserHeader = ({ user }) => (
  <div className="flex items-center gap-4">
    <img src={user.photo || "/avatar.png"} className="w-20 h-20 rounded-full" />
    <div>
      <p className="font-bold">{user.name}</p>
      <p>{user.email}</p>
      <p>📞 {user.phone || "N/A"}</p>
      <p>Profile: {user.profileCompletion}%</p>
    </div>
  </div>
);

const HostHeader = ({ host }) => (
  <div className="flex items-center gap-4">
    <img src={host.photo || "/avatar.png"} className="w-20 h-20 rounded-full" />
    <div>
      <p className="font-bold">{host.name}</p>
      <p>{host.email}</p>
      <p>📞 {host.phone || "N/A"}</p>
      <p>Profile: {host.profileCompletion}%</p>
    </div>
  </div>
);