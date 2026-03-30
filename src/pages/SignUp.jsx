import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";

// ─── Toast Notification System ───────────────────────────────────────────────

const TOAST_TYPES = {
  success: {
    bg: "#dcfce7",
    border: "#86efac",
    icon: "✓",
    iconBg: "#22c55e",
    textColor: "#15803d",
  },
  error: {
    bg: "#fee2e2",
    border: "#fca5a5",
    icon: "✕",
    iconBg: "#ef4444",
    textColor: "#b91c1c",
  },
  info: {
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: "i",
    iconBg: "#3b82f6",
    textColor: "#1d4ed8",
  },
};

const Toast = ({ toasts, removeToast }) => (
  <div
    style={{
      position: "fixed",
      top: "1rem",
      right: "1rem",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      maxWidth: "360px",
      width: "calc(100vw - 2rem)",
    }}
  >
    {toasts.map((toast) => {
      const t = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
      return (
        <div
          key={toast.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            background: t.bg,
            border: `1px solid ${t.border}`,
            borderRadius: "0.75rem",
            padding: "0.875rem 1rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            animation: "slideIn 0.3s ease",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: t.iconBg,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: "bold",
              marginTop: "1px",
            }}
          >
            {t.icon}
          </span>
          <p
            style={{
              flex: 1,
              margin: 0,
              color: t.textColor,
              fontSize: "0.875rem",
              lineHeight: 1.5,
            }}
          >
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.textColor,
              fontSize: "1rem",
              lineHeight: 1,
              padding: 0,
              opacity: 0.6,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      );
    })}
    <style>{`
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(40px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `}</style>
  </div>
);

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, removeToast };
};

// ─── Main SignUp Component ────────────────────────────────────────────────────

const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("TOURIST");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [guideDocument, setGuideDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Basic validation
    if (!username.trim())
      return addToast("Please enter your username.", "error");
    if (!email.trim())
      return addToast("Please enter your email address.", "error");
    if (!phoneNumber.trim())
      return addToast("Please enter your phone number.", "error");
    if (!password.trim()) return addToast("Please enter a password.", "error");
    if (role === "GUIDE" && !guideDocument)
      return addToast("Please upload your citizenship document.", "error");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("password", password);
      formData.append("role", role);
      if (role === "GUIDE" && guideDocument) {
        formData.append("guideDocument", guideDocument);
      }

      const res = await axios.post(`${serverURL}/api/auth/register`, formData, {
        withCredentials: true,
      });

      addToast(
        res.data.message || "Account created! Check your email.",
        "success",
      );
      setTimeout(
        () => navigate("/otp-verification", { state: { email } }),
        1500,
      );
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Sign Up failed. Please try again.";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input style ──
  const inputStyle = {
    width: "100%",
    border: "1.5px solid #e5e7eb",
    borderRadius: "0.6rem",
    padding: "0.6rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    background: "#fafafa",
  };

  const labelStyle = {
    display: "block",
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: "0.4rem",
    fontSize: "0.875rem",
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          background: "linear-gradient(135deg, #fff9f6 0%, #fff3ee 100%)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "1.25rem",
            boxShadow:
              "0 8px 32px rgba(255,77,45,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            width: "100%",
            maxWidth: "440px",
            padding: "clamp(1.5rem, 5vw, 2.25rem)",
            boxSizing: "border-box",
            border: "1px solid #ffe4dc",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 5vw, 1.875rem)",
                fontWeight: "800",
                color: primaryColor,
                margin: "0 0 0.25rem",
                letterSpacing: "-0.5px",
              }}
            >
              TravelEase
            </h1>
            <p
              style={{
                color: "#3b82f6",
                fontWeight: "600",
                margin: 0,
                fontSize: "0.95rem",
              }}
            >
              Create Your Account
            </p>
          </div>

          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>User Name</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Enter Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d2d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              style={inputStyle}
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d2d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              style={inputStyle}
              placeholder="Enter Your Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#ff4d2d")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: "2.75rem" }}
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#ff4d2d")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Role</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["TOURIST", "GUIDE", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: "1 1 auto",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border:
                      role === r
                        ? `1.5px solid ${primaryColor}`
                        : "1.5px solid #e5e7eb",
                    background: role === r ? primaryColor : "white",
                    color: role === r ? "white" : "#6b7280",
                    boxShadow:
                      role === r ? "0 2px 8px rgba(255,77,45,0.25)" : "none",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Guide Document */}
          {role === "GUIDE" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Upload Citizenship Document</label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1.5px dashed #fca5a5",
                  borderRadius: "0.6rem",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  background: "#fff5f5",
                  fontSize: "0.875rem",
                  color: "#ef4444",
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>📎</span>
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {guideDocument ? guideDocument.name : "Choose image or PDF…"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setGuideDocument(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              background: loading
                ? "#fdba74"
                : `linear-gradient(135deg, ${primaryColor}, #e64323)`,
              color: "white",
              fontWeight: "700",
              fontSize: "1rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(255,77,45,0.35)",
              transition: "opacity 0.2s, transform 0.1s",
              marginTop: "0.25rem",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            {loading ? "Creating Account…" : "Sign Up"}
          </button>

          {/* Sign In Link */}
          <p
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "#6b7280",
              cursor: "default",
            }}
          >
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{
                color: primaryColor,
                fontWeight: "700",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;
