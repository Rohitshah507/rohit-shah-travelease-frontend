import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import LogIn from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import OtpVerification from "./pages/OtpVerification.jsx";
import useUser from "./hooks/useUser.jsx";
import { useSelector } from "react-redux";
import LandingPage from "./pages/landing.jsx";
import Hero from "./pages/landing.jsx";
import Destinations from "./pages/Destinations.jsx";

export const serverURL = "http://localhost:5000";
const App = () => {
  useUser();
  const { userData } = useSelector((state) => state.user);
  return (
    <div>
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/home"} />}
        />

        <Route
          path="/login"
          element={!userData ? <LogIn /> : <Navigate to={"/home"} />}
        />

        <Route
          path="/home"
          element={userData ? <Home /> : <Navigate to={"/login"} />}
        />

        <Route path="/" element={<Hero />} />

        <Route
          path="/otp-verification"
          element={!userData ? <OtpVerification /> : <Navigate to={"/home"} />}
        />

        <Route path="forget-password" element={<ForgetPassword />} />

        <Route path="/destinations" element={<Destinations />} />
      </Routes>
    </div>
  );
};

export default App;
