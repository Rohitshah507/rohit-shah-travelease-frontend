import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { serverURL } from "../App.jsx";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", ""]);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = otp.join("");
    try {
      const result = await axios.post(
        `${serverURL}/api/auth/verify-email`,
        {
          email,
          verificationCode,
        },
        { withCredentials: true }
      );
      alert("Email verified successfully!");
      navigate("/login");
      console.log(result);
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await axios.post(
        `${serverURL}/api/auth/resend-otp`,
        {
          email,
        },
        { withCredentials: true }
      );
      alert("Resent OTP sent successfully!");
      console.log(result);
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            📧
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">
          Check your email
        </h2>

        <p className="text-gray-500 mt-2 text-sm">
          Enter the verification code sent to <br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mt-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* Resend */}
        <p className="text-sm text-gray-500 mt-4">
          Didn't get a code?{" "}
          <button onClick={handleResendOTP} className="text-blue-600 font-medium hover:underline cursor-pointer">
            resend
          </button>
        </p>

        {/* Button */}
        <button
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition cursor-pointer"
          onClick={handleVerify}
        >
          Verify email
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
