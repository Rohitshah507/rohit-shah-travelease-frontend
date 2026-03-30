import React, { useState } from "react";

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverURL } from "../App.jsx";
import { setUserData } from "../redux/userSlice.js";

// ─── Toast Notification Component ────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => {
  const styles = {
    success: {
      bg: "linear-gradient(135deg, #d4edda, #c3e6cb)",
      border: "#28a745",
      icon: "✅",
      title: "Success",
      color: "#155724",
    },
    error: {
      bg: "linear-gradient(135deg, #f8d7da, #f5c6cb)",
      border: "#dc3545",
      icon: "❌",
      title: "Error",
      color: "#721c24",
    },
    info: {
      bg: "linear-gradient(135deg, #d1ecf1, #bee5eb)",
      border: "#17a2b8",
      icon: "ℹ️",
      title: "Info",
      color: "#0c5460",
    },
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-[360px]">
      {toasts.map((toast) => {
        const s = styles[toast.type] || styles.info;
        return (
          <div
            key={toast.id}
            style={{
              background: s.bg,
              border: `1.5px solid ${s.border}`,
              borderLeft: `5px solid ${s.border}`,
              borderRadius: "10px",
              padding: "12px 14px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              animation: "slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              color: s.color,
            }}
          >
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontWeight: "700",
                  fontSize: "13px",
                  margin: "0 0 2px",
                }}
              >
                {s.title}
              </p>
              <p style={{ fontSize: "12px", margin: 0, opacity: 0.9 }}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                color: s.color,
                opacity: 0.6,
                lineHeight: 1,
                padding: 0,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0)   scale(1);   }
        }
      `}</style>
    </div>
  );
};

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
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSignIn = async () => {
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

      showToast(res.data.message || "Logged in successfully!", "success");
      setTimeout(() => navigate("/home"), 1200);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Sign In Failed. Please try again.";
      showToast(msg, "error");
    }
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#fff9f6]">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-[380px] sm:max-w-sm p-5 sm:p-6 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 text-[#ff4d2d]">
              TravelEase
            </h1>
            <p className="text-base sm:text-lg font-bold text-blue-600">
              Log In
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-500 font-bold mb-1.5 text-sm"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500 text-sm transition-colors"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-orange-500 text-sm transition-colors"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {!showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mb-4">
            <button
              className="text-orange-600 font-medium text-xs sm:text-sm cursor-pointer hover:text-orange-700 transition-colors"
              onClick={() => navigate("/forget-password")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            className="w-full bg-orange-600 cursor-pointer text-white font-bold py-2.5 sm:py-3 rounded-lg shadow-lg hover:bg-orange-500 transition-colors text-sm sm:text-base active:scale-95"
            onClick={handleSignIn}
          >
            Sign In
          </button>

          {/* Sign Up Link */}
          <p
            className="flex justify-center items-center gap-2 mt-4 cursor-pointer text-sm text-gray-600"
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
