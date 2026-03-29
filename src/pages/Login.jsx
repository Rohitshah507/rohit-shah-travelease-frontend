import React, { useState } from "react";

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

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
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
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
              padding: "14px 18px",
              minWidth: "280px",
              maxWidth: "360px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              animation: "slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              color: s.color,
            }}
          >
            <span style={{ fontSize: "20px", flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontWeight: "700",
                  fontSize: "14px",
                  margin: "0 0 2px",
                }}
              >
                {s.title}
              </p>
              <p style={{ fontSize: "13px", margin: 0, opacity: 0.9 }}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
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
// ─── Token helpers (7-day expiry) ─────────────────────────────────────────────
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Save JWT with expiry
export const saveTokenWithExpiry = (token) => {
  const payload = {
    value: token,
    expiry: Date.now() + TOKEN_TTL_MS,
  };
  localStorage.setItem("token", JSON.stringify(payload));
};

// Get JWT (returns raw token string or null if expired)
export const getToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  try {
    const { value, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem("token");
      return null; // expired
    }
    return value; // ✅ raw JWT for Authorization header
  } catch (err) {
    localStorage.removeItem("token");
    return null;
  }
};

// ─── SignIn Page ──────────────────────────────────────────────────────────────
const SignIn = () => {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  console.log("API URL:", serverURL); // Debug: Check API URL being used
  // Toast state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000); // auto-dismiss after 4s
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

      // Save token with 7-day expiry
      saveTokenWithExpiry(res.data.user.token);

      dispatch(
        setUserData({
          success: res.data.success,
          message: res.data.message,
          userDetails: res.data.user,
        }),
      );

      showToast(res.data.message || "Logged in successfully!", "success");

      // Brief delay so user sees the success toast before navigating
      setTimeout(() => navigate("/home"), 1200);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Sign In Failed. Please try again.";
      showToast(msg, "error");
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <div className="text-center">
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: primaryColor }}
            >
              TravelEase
            </h1>
            <p className="text-1xl font-bold text-blue-600">Log In</p>
          </div>

          {/* Email */}
          <div className="m-4">
            <label
              htmlFor="email"
              className="block text-gray-500 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              placeholder="Enter Your Email"
              style={{ border: `1px solid ${borderColor}` }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="m-4">
            <label
              htmlFor="password"
              className="block text-gray-500 font-bold mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter Your Password"
                style={{ border: `1px solid ${borderColor}` }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {!showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          <div
            className="text-orange-600 ml-50 text-bold font-medium mb-2 cursor-pointer"
            onClick={() => navigate("/forget-password")}
          >
            Forget Password
          </div>

          {/* Sign In Button */}
          <button
            className="ml-3 w-80 px-3 bg-orange-600 cursor-pointer text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 hover:text-white transition-colors"
            onClick={handleSignIn}
          >
            Sign In
          </button>

          <p
            className="ml-15 flex text-center gap-3 mt-2 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Create an account ?
            <span className="text-orange-600 font-bold">Sign Up</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignIn;
