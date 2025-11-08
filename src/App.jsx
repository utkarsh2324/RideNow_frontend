import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import HeroSection from "./components/herosection";
import Login from "./components/login";
import Signup from "./components/signup";
import Profile from "./components/profile";
import DocumentVerification from "./components/documentverification";
import HostApp from "./HostApp"; // ✅ same directory
import SearchResults from "./components/searchresult";
import { Toaster } from "react-hot-toast";
import VehicleDetails from "./components/vehicledetails";
import MyBookings from "./components/mybookings";
import "./App.css";

function App() {
  const location = useLocation();
  const isHostRoute = location.pathname.startsWith("/host");

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {!isHostRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/document-verification" element={<DocumentVerification />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/vehicle/:id" element={<VehicleDetails />} />
        <Route path="/rides" element={<MyBookings />} />


        <Route path="/host/*" element={<HostApp />} />
        
      </Routes>
    </>
  );
}

export default App;