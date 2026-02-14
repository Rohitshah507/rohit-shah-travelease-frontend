import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import SignUp from "./pages/SignUp.jsx";
import LogIn from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import OtpVerification from "./pages/OtpVerification.jsx";
import Hero from "./pages/landing.jsx";
import Destinations from "./pages/Destinations.jsx";
import BookingPage from "./pages/Booking.jsx";

import useUser from "./hooks/useUser.jsx";

export const serverURL = "http://localhost:5000";

const App = () => {
  useUser();

  const { userData } = useSelector((state) => state.user);

  const token = localStorage.getItem("token");

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
          path="/destinations"
          element={token ? <Destinations /> : <Navigate to="/login" />}
        />

        <Route
          path="/booking/:id"
          element={token ? <BookingPage /> : <Navigate to="/login" />}
        />

      </Routes>
    </div>
  );
};

export default App;
