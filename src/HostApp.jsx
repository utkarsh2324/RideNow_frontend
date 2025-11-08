import { Routes, Route } from "react-router-dom";
import HostNavbar from "./components/host/hostnav";
import HostHome from "./components/host/hosthome";
import HostLogin from "./components/host/hostlogin";
import HostSignup from "./components/host/hostsingup";
import HostProfile from "./components/host/hostprofile";
import HostDocumentVerification from "./components/host/hostdocumentverification";
import MyVehicles from "./components/host/hostavailble";
import HostVehicle from "./components/host/hostavehicle";
import VehicleDetail from "./components/host/hostvehicledetails";
import HostBookings from "./components/host/hostbooking";
import { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

function HostApp() {
  
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <HostNavbar />
      <Routes>
      <Route
          path="/"
          element={
            <>
              <HostNavbar />
              <HostHome />
            </>
          }
        />
        <Route path="login" element={<HostLogin />} />
        <Route path="signup" element={<HostSignup />} />
        <Route path="profile" element={<HostProfile />} />
        <Route path="document-verification" element={<HostDocumentVerification />} />
        <Route path="hostavehicle" element={<MyVehicles />} />
        <Route path="add" element={<HostVehicle />} />
        <Route path="bookings" element={<HostBookings />} />
<Route path="vehicle/:vehicleId" element={<VehicleDetail />} />
      </Routes>
    </>
  );
}

export default HostApp;