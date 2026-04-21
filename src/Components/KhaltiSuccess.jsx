import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { getToken } from "../pages/Login.jsx";
import {
  CheckCircle,
  Home,
  Calendar,
  CreditCard,
  Hash,
  Sparkles,
  ArrowRight,
  MapPin,
} from "lucide-react";

export default function KhaltiSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10);

  // Extract Khalti callback params from URL
  const pidx = searchParams.get("pidx");
  const transactionId = searchParams.get("transaction_id");
  const amount = searchParams.get("amount");
  const totalAmount = searchParams.get("total_amount");
  const status = searchParams.get("status");
  const purchaseOrderId = searchParams.get("purchase_order_id");
  const mobile = searchParams.get("mobile");

  const displayAmount = totalAmount
    ? (Number(totalAmount) / 100).toLocaleString()
    : amount
      ? (Number(amount) / 100).toLocaleString()
      : "—";

  /* ── Verify payment with backend on mount ── */
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = getToken();

        // Call your backend to verify + update booking status
        await axios.get(`${serverURL}/api/payment/khalti/verify`, {
          params: {
            pidx,
            transaction_id: transactionId,
            purchase_order_id: purchaseOrderId,
            status,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        setVerified(true);
      } catch (err) {
        console.error(
          "Payment verify error:",
          err.response?.data || err.message,
        );
        setVerified(true);
      } finally {
        setVerifying(false);
      }
    };

    if (pidx) {
      verifyPayment();
    } else {
      setVerifying(false);
      setVerified(status === "Completed");
    }
  }, [pidx]);

  /* ── Auto-redirect countdown after verification ── */
  useEffect(() => {
    if (verifying) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate("/home");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [verifying, navigate]);

  /* ── Loading state ── */
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-5">
          {/* Spinning ring */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-3 border-4 border-purple-200 rounded-full" />
            <div
              className="absolute inset-3 border-4 border-purple-500 border-b-transparent rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.7s",
              }}
            />
          </div>
          <div>
            <p className="text-violet-900 font-black text-xl">
              Verifying Payment
            </p>
            <p className="text-violet-400 text-sm mt-1">
              Please wait while we confirm your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Background decorative blobs ── */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-fuchsia-200/20 rounded-full blur-2xl pointer-events-none" />

      {/* ── Floating confetti dots ── */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-60 pointer-events-none"
          style={{
            background: ["#7c3aed", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"][
              i % 5
            ],
            top: `${10 + ((i * 7.5) % 80)}%`,
            left: `${5 + ((i * 11) % 90)}%`,
            animation: `bounce ${1.5 + (i % 3) * 0.4}s ease-in-out ${i * 0.15}s infinite alternate`,
          }}
        />
      ))}

      {/* ── Main Card ── */}
      <div className="relative w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-emerald-400/20 rounded-3xl blur-xl scale-105" />

        <div className="relative bg-white rounded-3xl shadow-2xl shadow-violet-200/50 overflow-hidden border border-violet-100">
          {/* ── Header ── */}
          <div
            className="px-8 py-8 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #059669 0%, #10b981 40%, #34d399 100%)",
            }}
          >
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-emerald-300/20 rounded-full blur-xl" />

            <div className="relative">
              {/* Animated success icon */}
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div
                  className="absolute inset-0 bg-white/20 rounded-full animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle size={42} className="text-emerald-500" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles
                  size={16}
                  className="text-emerald-200 animate-pulse"
                />
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Payment Successful!
                </h1>
                <Sparkles
                  size={16}
                  className="text-emerald-200 animate-pulse"
                />
              </div>
              <p className="text-emerald-100 text-sm">
                Your booking has been confirmed
              </p>
            </div>
          </div>

          {/* ── Amount Hero ── */}
          <div className="px-8 py-5 bg-gradient-to-r from-violet-50 to-emerald-50 border-b border-violet-100 text-center">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">
              Amount Paid
            </p>
            <p className="text-4xl font-black text-violet-900">
              Rs. <span className="text-emerald-600">{displayAmount}</span>
            </p>
          </div>

          {/* ── Transaction Details ── */}
          <div className="px-8 py-5 space-y-3">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">
              Transaction Details
            </p>

            {[
              {
                icon: <Hash size={14} className="text-violet-500" />,
                label: "Transaction ID",
                value: transactionId ? `${transactionId.slice(0, 20)}...` : "—",
                mono: true,
              },
              {
                icon: <CreditCard size={14} className="text-violet-500" />,
                label: "Payment ID (pidx)",
                value: pidx ? `${pidx.slice(0, 20)}...` : "—",
                mono: true,
              },
              {
                icon: <CheckCircle size={14} className="text-emerald-500" />,
                label: "Status",
                value: status || "Completed",
                badge: true,
              },
              ...(mobile
                ? [
                    {
                      icon: <MapPin size={14} className="text-violet-500" />,
                      label: "Mobile",
                      value: mobile,
                    },
                  ]
                : []),
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-violet-50 last:border-0"
              >
                <div className="flex items-center gap-2 text-violet-500">
                  {row.icon}
                  <span className="text-xs font-semibold text-violet-500">
                    {row.label}
                  </span>
                </div>
                {row.badge ? (
                  <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {row.value}
                  </span>
                ) : (
                  <span
                    className={`text-xs font-bold text-violet-900 max-w-[160px] truncate text-right ${row.mono ? "font-mono" : ""}`}
                  >
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Info banner ── */}
          <div className="mx-6 mb-4 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <Calendar
              size={14}
              className="text-violet-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-violet-700 leading-relaxed">
              Your booking is now <strong>confirmed</strong>. The guide will
              contact you before the tour. Check your bookings for details.
            </p>
          </div>

          {/* ── Countdown bar ── */}
          <div className="mx-6 mb-4">
            <div className="flex justify-between text-[10px] text-violet-400 font-semibold mb-1">
              <span>Auto-redirecting to home</span>
              <span>{countdown}s</span>
            </div>
            <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* ── Buttons ── */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => navigate("/home")}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-black rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-violet-300/40"
            >
              <Home size={16} />
              Go to Home
            </button>
            <button
              onClick={() => navigate("/bookings")}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 text-violet-700 font-bold rounded-xl text-sm transition-all active:scale-95"
            >
              My Bookings
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-12px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
