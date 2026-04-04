import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { serverURL } from "../App.jsx";
import { setUserData } from "../redux/userSlice.js";

// ─── Token helpers (7-day expiry) ─────────────────────────────────────────────
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const saveTokenWithExpiry = (token) => {
  const payload = {
    value: token,
    expiry: Date.now() + TOKEN_TTL_MS,
  };
  localStorage.setItem("token", JSON.stringify(payload));
};

export const getToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  try {
    const { value, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem("token");
      return null;
    }
    return value;
  } catch (err) {
    localStorage.removeItem("token");
    return null;
  }
};

// ─── SignIn Page ──────────────────────────────────────────────────────────────
const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const res = await axios.post(
        `${serverURL}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      saveTokenWithExpiry(res.data.user.token);

      dispatch(
        setUserData({
          success: res.data.success,
          message: res.data.message,
          userDetails: res.data.user,
        }),
      );

      toast.success(res.data.message || "Logged in successfully!");
      setTimeout(() => navigate("/home"), 1200);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Sign In Failed. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "10px",
            fontWeight: "500",
            fontSize: "14px",
          },
          success: {
            style: {
              background: "#fff7ed",
              border: "1px solid #fdba74",
              color: "#9a3412",
            },
            iconTheme: { primary: "#ea580c", secondary: "#fff7ed" },
          },
          error: {
            style: {
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
            },
            iconTheme: { primary: "#ef4444", secondary: "#fef2f2" },
          },
        }}
      />

      <div className="min-h-screen min-h-dvh w-full flex items-center justify-center p-3 xs:p-4 bg-[#fff9f6]">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-[95vw] xs:max-w-[380px] sm:max-w-sm p-4 xs:p-5 sm:p-6 border border-gray-200">

          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 text-[#ff4d2d]">
              TravelEase
            </h1>
            <p className="text-base sm:text-lg font-bold text-blue-600">
              Log In
            </p>
          </div>

          {/* Email */}
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="email"
              className="block text-gray-500 font-bold mb-1.5 text-sm"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 text-sm transition-colors min-h-[44px]"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
          </div>

          {/* Password */}
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="password"
              className="block text-gray-500 font-bold mb-1.5 text-sm"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-orange-500 text-sm transition-colors min-h-[44px]"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {!showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mb-3 sm:mb-4">
            <button
              className="text-orange-600 font-medium text-xs sm:text-sm cursor-pointer hover:text-orange-700 transition-colors min-h-[44px] flex items-center"
              onClick={() => navigate("/forget-password")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            className="w-full bg-orange-600 cursor-pointer text-white font-bold py-3 rounded-lg shadow-lg hover:bg-orange-500 transition-colors text-sm sm:text-base active:scale-95 min-h-[48px]"
            onClick={handleSignIn}
          >
            Sign In
          </button>

          {/* Sign Up Link */}
          <p
            className="flex justify-center items-center gap-1.5 mt-3 sm:mt-4 cursor-pointer text-xs xs:text-sm text-gray-600 min-h-[44px]"
            onClick={() => navigate("/signup")}
          >
            Don't have an account?{" "}
            <span className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignIn;