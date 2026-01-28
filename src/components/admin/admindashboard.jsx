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
    <div className="p-6">
      {/* TABS */}
      <div className="flex gap-3 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setDetails(null);
            }}
            className={`px-5 py-2 rounded-lg font-semibold ${
              activeTab === tab
                ? "bg-blue-900 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name / Model</th>
              <th>Email</th>
              <th>Stats</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i._id} className="border-t text-center">
                <td className="p-3">{i.name || i.scootyModel}</td>
                <td>{i.email || i.host?.email}</td>
                <td>
                  {activeTab === "users" && `${i.totalRides} rides`}
                  {activeTab === "hosts" && `${i.totalVehicles} vehicles`}
                  {activeTab === "vehicles" &&
                    (i.isVerified ? "Verified" : "Pending")}
                </td>
                <td>
                  <button
                    onClick={() => fetchDetails(i._id)}
                    className="text-blue-700 font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
  );
}

/* ================= DETAILS MODAL ================= */
function DetailsModal({ tab, data, onClose, onUserDoc, onHostDoc }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[92%] max-h-[92%] overflow-y-auto rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Details</h2>
          <button onClick={onClose} className="text-red-600">✕</button>
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
                    <a href={d.docUrl} target="_blank" className="text-blue-600">
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
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onUserDoc(data.user._id, i, "rejected")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
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
                    className="text-blue-600"
                  >
                    View
                  </a>
                  <StatusBadge status={data.documents.status} />
                </div>

                {data.documents.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onHostDoc(data.host._id, "approved")}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onHostDoc(data.host._id, "rejected")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
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
              <a href={data.rc} target="_blank" className="text-blue-600">
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