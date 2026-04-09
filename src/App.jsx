import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import SignUp from "./pages/SignUp.jsx";
import LogIn from "./pages/Login.jsx";
import { getToken } from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import OtpVerification from "./pages/OtpVerification.jsx";
import Hero from "./pages/landing.jsx";
import Destinations from "./pages/Tourist Role/Destinations.jsx";
import BookingPage from "./pages/Tourist Role/Booking.jsx";
import KhaltiSuccess from "./Components/KhaltiSuccess.jsx";

import useUser from "./hooks/useUser.jsx";
import AdminDashboard from "./pages/Admin Role/AdminDashboard.jsx";
import Packages from "./pages/Tourist Role/Packages.jsx";
import MyBookings from "./pages/Tourist Role/MyBookings.jsx";
import PackageDetail from "./pages/Tourist Role/PackageDetail.jsx";
import Explore from "./pages/Tourist Role/Explore.jsx";

export const serverURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const App = () => {
  useUser();

  const { userData } = useSelector((state) => state.user);

  const token = getToken();

  return (
    <div>
      <Routes>
        {/* Signup Route */}
        <Route
          path="/signup"
          element={!token ? <SignUp /> : <Navigate to="/home" />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={!token ? <LogIn /> : <Navigate to="/home" />}
        />

        {/* Landing Page */}
        <Route path="/" element={<Hero />} />

        {/* Protected Home Route */}
        <Route
          path="/home"
          element={token ? <Home /> : <Navigate to="/login" />}
        />

        {/* OTP Verification */}
        <Route
          path="/otp-verification"
          element={!token ? <OtpVerification /> : <Navigate to="/home" />}
        />

        <Route path="/forget-password" element={<ForgetPassword />} />

        <Route
          path="/package"
          element={token ? <Packages /> : <Navigate to="/login" />}
        />

        <Route
          path="/places-to-visit"
          element={token ? <Explore /> : <Navigate to="/login" />}
        />

        <Route
          path="/booking/:id"
          element={token ? <BookingPage /> : <Navigate to="/login" />}
        />

        <Route path="/khalti/payment_success" element={<KhaltiSuccess />} />

        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route
          path="/explore"
          element={token ? <Explore /> : <Navigate to="/login" />}
        />

        <Route
          path="/mybookings"
          element={token ? <MyBookings /> : <Navigate to="/login" />}
        />

        <Route
          path="/package/:id"
          element={token ? <PackageDetail /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;
