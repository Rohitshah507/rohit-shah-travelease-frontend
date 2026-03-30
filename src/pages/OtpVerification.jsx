import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { serverURL } from "../App";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Go back on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 5);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < newOtp.length) newOtp[i] = char;
    });
    setOtp(newOtp);
    const lastFilledIndex = Math.min(pasted.length - 1, otp.length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = otp.join("");
    if (verificationCode.length < 5) {
      alert("Please enter all 5 digits");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverURL}/api/auth/verify-email`,
        { email, verificationCode },
        { withCredentials: true },
      );
      alert("Email verified successfully!");
      navigate("/login");
      console.log(result);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(
        error.response?.data?.message ||
          "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const result = await axios.post(
        `${serverURL}/api/auth/resend-otp`,
        { email },
        { withCredentials: true },
      );
      alert("OTP resent successfully!");
      console.log(result);
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-[420px] sm:max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4 sm:mb-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl sm:text-3xl">
            📧
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Check your email
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-sm sm:text-base mb-1">
          Enter the verification code sent to
        </p>
        <p className="font-medium text-gray-700 text-sm sm:text-base mb-5 sm:mb-6 break-all px-2">
          {email || "your email address"}
        </p>

        {/* OTP Inputs */}
        <div
          className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-5"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all select-none ${
                digit
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-900"
              }`}
            />
          ))}
        </div>

        {/* Resend */}
        <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
          Didn't get a code?{" "}
          <button
            onClick={handleResendOTP}
            disabled={resending}
            className="text-blue-600 font-medium hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </p>

        {/* Verify Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all cursor-pointer text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleVerify}
          disabled={loading || otp.join("").length < 5}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify email"
          )}
        </button>

        {/* Back to login */}
        <button
          className="mt-4 text-xs sm:text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          onClick={() => navigate("/login")}
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
