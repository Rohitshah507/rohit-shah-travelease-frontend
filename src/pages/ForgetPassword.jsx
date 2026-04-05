import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ForgetPassword = () => {
  const borderColor = "#ddd";
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${serverURL}/api/auth/send-otp`,
        { email },
        { withCredentials: true },
      );
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to send OTP. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${serverURL}/api/auth/verify-otp`,
        // Send both string and number forms — adjust based on your backend expectation
        { email, otp: otp.trim() },
        { withCredentials: true },
      );
      toast.success("OTP verified!");
      setStep(3);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Invalid OTP. Please check and try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${serverURL}/api/auth/reset-password`,
        { email, newPassword: password },
        { withCredentials: true },
      );
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to reset password. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full items-center bg-[#fff9f6] flex justify-center">
      {/* Toast container */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontWeight: "600", borderRadius: "10px" },
          success: { style: { background: "#fff", color: "#16a34a" } },
          error: { style: { background: "#fff", color: "#dc2626" } },
        }}
      />

      <div className="bg-white rounded-xl w-full shadow-lg max-w-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <IoArrowBack
            size={20}
            className="text-orange-600 cursor-pointer"
            onClick={() => navigate("/login")}
          />
          <h1 className="text-xl items-center font-bold text-red-500">
            Forget Password
          </h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-8 h-1 rounded transition-colors ${
                    step > s ? "bg-orange-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Email */}
        {step === 1 && (
          <div>
            <div className="m-4">
              <label className="block text-gray-500 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:border-orange-400"
                placeholder="Enter Your Email"
                style={{ border: `1px solid ${borderColor}` }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
              />
            </div>
            <div className="px-4">
              <button
                className="w-full cursor-pointer bg-orange-600 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSendOTP}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <div>
            <div className="m-4">
              <label className="block text-gray-500 font-bold mb-2">OTP</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:border-orange-400 tracking-widest text-center text-lg"
                placeholder="Enter OTP"
                style={{ border: `1px solid ${borderColor}` }}
                value={otp}
                onChange={(e) =>
                  setOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-1 text-center">
                OTP sent to <span className="font-semibold">{email}</span>
              </p>
            </div>
            <div className="px-4">
              <button
                className="w-full cursor-pointer bg-orange-600 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                className="w-full mt-2 text-orange-600 text-sm font-semibold hover:underline"
                onClick={() => {
                  setStep(1);
                  setOTP("");
                }}
              >
                Change Email
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Reset Password */}
        {step === 3 && (
          <div>
            <div className="m-4">
              <label className="block text-gray-500 font-bold mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border rounded-lg px-3 py-2 pr-10 shadow-sm focus:outline-none focus:border-orange-400"
                  placeholder="Enter New Password"
                  style={{ border: `1px solid ${borderColor}` }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="m-4">
              <label className="block text-gray-500 font-bold mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full border rounded-lg px-3 py-2 pr-10 shadow-sm focus:outline-none focus:border-orange-400"
                  placeholder="Confirm New Password"
                  style={{ border: `1px solid ${borderColor}` }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 cursor-pointer"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
              {/* Live mismatch warning */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="px-4">
              <button
                className="w-full bg-orange-600 cursor-pointer text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
