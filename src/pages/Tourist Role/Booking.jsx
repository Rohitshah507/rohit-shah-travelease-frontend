import React, { useState, useEffect } from "react";
import { getToken } from "../Login.jsx";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Heart,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  User,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Globe,
  CheckCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import { serverURL } from "../../App.jsx";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useUser from "../../hooks/useUser.jsx";

const BookingPage = () => {
  useUser();
  const { userData } = useSelector((state) => state.user);
  const { id } = useParams();

  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [existingBookingStatus, setExistingBookingStatus] = useState(null); // "pending" | "confirmed" | "completed" | etc.
  const [existingPaymentStatus, setExistingPaymentStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    numberOfAdults: 1,
    numberOfChildren: 0,
    fullName: "",
    email: "",
    phone: "",
    country: "",
    specialRequests: "",
  });

  // Derive isPaid from existing booking statuses
  const isPaid =
    ["success", "completed", "paid"].includes(
      existingPaymentStatus?.toLowerCase(),
    ) ||
    ["confirmed", "completed"].includes(existingBookingStatus?.toLowerCase());

  useEffect(() => {
    if (userData?.userDetails) {
      setFormData((prev) => ({
        ...prev,
        fullName: userData.userDetails.username || "",
        email: userData.userDetails.email || "",
        phone: userData.userDetails.phoneNumber || "",
        country: userData.userDetails.country || "",
      }));
    }
  }, [userData]);

  useEffect(() => {
    const fetchPackageAndBooking = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await axios.get(`${serverURL}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTourPackage(res.data.packageId);
        try {
          const bookingsRes = await axios.get(
            `${serverURL}/api/booking/tourist`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const existingBooking = bookingsRes.data.data?.find(
            (booking) =>
              (booking.tourPackageId?._id === id ||
                booking.tourPackageId === id) &&
              (booking.bookingStatus || "").toLowerCase() !== "cancelled",
          );
          if (existingBooking) {
            setBookingId(existingBooking._id);
            setExistingBookingStatus(existingBooking.bookingStatus || null);
            setExistingPaymentStatus(existingBooking.paymentStatus || null);
          } else {
            setBookingId(null);
            setExistingBookingStatus(null);
            setExistingPaymentStatus(null);
          }
        } catch {}
      } catch {
        toast.error("Failed to load package details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPackageAndBooking();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;
    setShowCancelConfirm(false);
    try {
      setCancelling(true);
      const token = getToken();
      await axios.put(
        `${serverURL}/api/booking/tourist/cancel/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Booking cancelled successfully!");
      setBookingId(null);
      setExistingBookingStatus(null);
      setExistingPaymentStatus(null);
      setCurrentStep(1);
      setShowSuccessModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      const token = getToken();
      const bookingResponse = await axios.post(
        `${serverURL}/api/booking/tourist`,
        {
          tourPackageId: tourPackage._id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          numberOfAdults: formData.numberOfAdults,
          numberOfChildren: formData.numberOfChildren,
          bookingStatus: "Pending",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const createdBookingId =
        bookingResponse.data.data?._id || bookingResponse.data._id;
      if (!createdBookingId) throw new Error("Booking ID not returned");
      setBookingId(createdBookingId);
      setExistingBookingStatus("pending");
      setExistingPaymentStatus("pending");
      toast.success("Booking created successfully! 🎉");
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) {
      toast.error("No booking found.");
      return;
    }
    const loadingToast = toast.loading("Redirecting to Khalti...");
    try {
      setProcessingPayment(true);
      const token = getToken();
      const paymentResponse = await axios.post(
        `${serverURL}/api/payment/${bookingId}/epayment/initiate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const khaltiPaymentUrl =
        (typeof paymentResponse.data?.paymentUrl === "string"
          ? paymentResponse.data.paymentUrl
          : null) ||
        paymentResponse.data?.paymentUrl?.payment_url ||
        paymentResponse.data?.payment_url;

      if (!khaltiPaymentUrl) {
        toast.dismiss(loadingToast);
        throw new Error("Khalti URL not returned.");
      }
      toast.dismiss(loadingToast);
      toast.success("Redirecting to Khalti...", { duration: 2000 });
      setTimeout(() => {
        window.location.href = khaltiPaymentUrl;
      }, 500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Payment failed.");
      setProcessingPayment(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#07030f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-[#6b5a8e] font-semibold text-sm sm:text-base">
            Loading booking details...
          </p>
        </div>
      </div>
    );

  if (!tourPackage)
    return (
      <div className="min-h-screen bg-[#07030f] flex items-center justify-center px-4">
        <p className="text-[#6b5a8e] text-lg sm:text-xl font-bold">
          Package not found
        </p>
      </div>
    );

  const inputClass =
    "w-full bg-violet-500/8 border border-violet-500/25 text-white rounded-[14px] px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-sm font-medium placeholder:text-violet-400/40 focus:border-violet-500/70 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50";

  return (
    <div className="min-h-screen bg-[#07030f] text-white font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[300px] sm:w-[540px] h-[300px] sm:h-[540px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16)_0%,transparent_70%)] blur-[70px]" />
        <div className="absolute top-[40%] right-[-5%] w-[200px] sm:w-[420px] h-[200px] sm:h-[420px] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.12)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[180px] sm:w-[360px] h-[180px] sm:h-[360px] rounded-full bg-[radial-gradient(circle,rgba(76,29,149,0.14)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a0a3e",
            color: "#e2d9f3",
            border: "1px solid rgba(139,92,246,0.35)",
            borderRadius: 14,
            fontWeight: 600,
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(139,92,246,0.25)",
          },
          success: { iconTheme: { primary: "#8b5cf6", secondary: "#1a0a3e" } },
          error: {
            style: {
              background: "#2d0a1e",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.35)",
            },
            iconTheme: { primary: "#ef4444", secondary: "#2d0a1e" },
          },
        }}
      />

      <div className="relative z-10">
        {/* Cancel Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-[10px] z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] rounded-[28px] overflow-hidden bg-gradient-to-br from-[#1a0a3e] to-[#0f0524] border border-violet-500/40 shadow-[0_0_80px_rgba(139,92,246,0.3)]">
              <div className="p-5 sm:p-7">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                    <XCircle size={22} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base sm:text-lg mb-0.5">
                      Cancel Booking?
                    </h3>
                    <p className="text-[#6b5a8e] text-xs sm:text-sm">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <p className="text-[#9e9ab5] text-xs sm:text-sm leading-[1.7] mb-5 sm:mb-6">
                  Are you sure you want to cancel? Your reservation will be
                  permanently removed.
                </p>
                <div className="flex gap-2 sm:gap-2.5">
                  <button
                    className="flex-1 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-violet-300 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 transition-all cursor-pointer"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Keep Booking
                  </button>
                  <button
                    className="flex-1 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-red-500 to-red-700 shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:scale-[1.02] disabled:opacity-55 transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />{" "}
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-[10px] z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-[460px] rounded-[28px] overflow-hidden bg-gradient-to-br from-[#1a0a3e] to-[#0f0524] border border-violet-500/40 shadow-[0_0_80px_rgba(139,92,246,0.3)]">
              <div className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-violet-700 to-violet-900 px-5 sm:px-7 py-5 sm:py-7 text-center">
                <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 bg-white/15 rounded-full border-2 border-white/30 flex items-center justify-center">
                    <CheckCircle size={30} className="text-white" />
                  </div>
                  <h3
                    className="font-black text-white text-xl sm:text-2xl mb-1 flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    <Sparkles size={16} className="animate-pulse" /> Booking
                    Confirmed! <Sparkles size={16} className="animate-pulse" />
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm">
                    Your adventure is reserved
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="bg-violet-500/12 border border-violet-500/30 rounded-[14px] px-3 sm:px-4 py-2.5 sm:py-3 mb-4">
                  <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-violet-400 mb-1">
                    Booking ID
                  </p>
                  <p className="font-mono font-bold text-white text-xs sm:text-sm break-all">
                    {bookingId}
                  </p>
                </div>
                <div>
                  {[
                    { label: "Package", value: tourPackage.title },
                    { label: "Location", value: tourPackage.destination },
                    {
                      label: "Dates",
                      value: `${new Date(formData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(formData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
                    },
                    {
                      label: "Guests",
                      value: `${formData.numberOfAdults} Adults, ${formData.numberOfChildren} Children`,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center py-2 sm:py-2.5 border-b border-violet-500/12 last:border-b-0"
                    >
                      <span className="text-[#6b5a8e] text-xs sm:text-sm">
                        {row.label}
                      </span>
                      <span className="text-white text-xs sm:text-sm font-bold text-right ml-2 truncate max-w-[55%]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-3 sm:px-4 py-3 bg-violet-500/12 border border-violet-500/25 rounded-[14px] mt-2">
                    <span className="text-violet-300 font-bold text-sm">
                      Total Amount
                    </span>
                    <span
                      className="text-xl sm:text-[1.6rem] font-black bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Rs.{tourPackage.price}
                    </span>
                  </div>
                </div>
                <div className="mt-3 bg-violet-500/10 border border-violet-500/25 rounded-[14px] px-3 sm:px-4 py-2.5 sm:py-3 flex gap-2">
                  <Shield
                    size={14}
                    className="text-violet-500 shrink-0 mt-0.5"
                  />
                  <div className="text-xs text-[#9e9ab5] leading-[1.6]">
                    <p className="font-bold text-violet-300 mb-0.5">
                      Payment Required
                    </p>
                    Complete payment via Khalti to confirm your booking.
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-5 sm:pb-6 flex gap-2 sm:gap-2.5">
                <button
                  className="flex-1 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-violet-300 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 transition-all cursor-pointer"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Pay Later
                </button>
                <button
                  className="flex-1 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.02] disabled:opacity-55 transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  onClick={handlePayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} /> Pay with Khalti
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-40 bg-[rgba(10,5,30,0.85)] backdrop-blur-[20px] border-b border-violet-500/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 sm:gap-2 bg-transparent border-none cursor-pointer text-violet-300 font-bold text-xs sm:text-sm hover:text-white transition-colors p-0"
            >
              <ArrowLeft size={16} />{" "}
              <span className="hidden xs:inline">Back to Destinations</span>
              <span className="xs:hidden">Back</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-1.5 text-sm text-[#6b5a8e]">
                <Shield size={14} className="text-emerald-500" /> Secure Booking
              </div>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border cursor-pointer transition-all ${isFavorite ? "bg-violet-500/30 border-violet-500/30" : "bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20"}`}
              >
                <Heart
                  size={15}
                  className={isFavorite ? "text-violet-300" : "text-[#6b5a8e]"}
                  fill={isFavorite ? "#c4b5fd" : "none"}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* LEFT: Summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-20">
            <div className="rounded-[24px] overflow-hidden bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/22">
              <div className="relative h-[200px] sm:h-[240px] overflow-hidden">
                <img
                  src={tourPackage.imageUrls?.[0]}
                  alt={tourPackage.title}
                  className="w-full h-full object-cover block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07030f]/85 via-[#07030f]/20 to-transparent" />
                <div className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-violet-500/12 text-violet-300 border border-violet-500/20">
                  {tourPackage.status}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#07030f]/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-500/25">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-amber-300 font-bold text-xs sm:text-sm">
                    {tourPackage.rating}
                  </span>
                  <span className="text-white/40 text-xs">
                    ({tourPackage.reviews})
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h2
                  className="text-lg sm:text-[1.4rem] font-black text-white mb-1.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {tourPackage.title}
                </h2>
                <div className="flex items-center gap-1.5 mb-4 sm:mb-5">
                  <MapPin size={13} className="text-violet-500" />
                  <span className="text-violet-400 text-xs sm:text-sm">
                    {tourPackage.destination}
                  </span>
                </div>
                <div className="flex gap-3 sm:gap-4 py-3 border-t border-b border-violet-500/15 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-violet-500" />
                    <span className="text-violet-300 text-xs sm:text-sm font-semibold">
                      {tourPackage.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-violet-500" />
                    <span className="text-violet-300 text-xs sm:text-sm font-semibold">
                      {tourPackage.group}
                    </span>
                  </div>
                </div>
                <div className="mb-4 sm:mb-5">
                  <span className="text-[#6b5a8e] text-xs">Starts: </span>
                  <span className="text-violet-400 text-xs sm:text-sm font-bold">
                    {new Date(tourPackage.startDate).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-t border-violet-500/15 mb-4 sm:mb-5">
                  <span className="font-bold text-violet-300 text-sm">
                    Total
                  </span>
                  <span
                    className="text-[1.6rem] sm:text-[2rem] font-black bg-gradient-to-r from-violet-300 to-violet-200 bg-clip-text text-transparent"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Rs.{tourPackage.price}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-violet-500/12">
                  {[
                    "Free Cancellation",
                    "Best Price",
                    "24/7 Support",
                    "Instant Confirm",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-1.5 text-xs text-[#9e9ab5]"
                    >
                      <Check size={11} className="text-emerald-500 shrink-0" />{" "}
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-2">
            {/* Progress */}
            <div className="bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/22 rounded-[24px] px-4 sm:px-7 py-4 sm:py-6 mb-4 sm:mb-6">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${currentStep > step ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.4)]" : currentStep === step ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-[0_4px_16px_rgba(139,92,246,0.5)] scale-110" : "bg-violet-500/10 text-[#6b5a8e] border border-violet-500/20"}`}
                      >
                        {currentStep > step ? <Check size={16} /> : step}
                      </div>
                      <p
                        className={`text-[0.6rem] sm:text-xs mt-1.5 sm:mt-2 font-bold text-center ${currentStep >= step ? "text-violet-400" : "text-[#4a3a6a]"}`}
                      >
                        {["Trip Details", "Your Info", "Review"][step - 1]}
                      </p>
                    </div>
                    {step < 3 && (
                      <div
                        className={`flex-1 h-[2px] sm:h-[3px] rounded-full mx-1 mb-[22px] sm:mb-[26px] transition-all ${currentStep > step ? "bg-gradient-to-r from-violet-500 to-violet-700" : "bg-violet-500/15"}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/22 rounded-[24px] px-4 sm:px-8 py-5 sm:py-7 mb-4 sm:mb-5">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.4)] shrink-0">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-lg sm:text-[1.35rem] font-black text-white leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Trip Details
                    </h3>
                    <p className="text-[#6b5a8e] text-xs sm:text-sm">
                      When do you want to travel?
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
                  {[
                    {
                      label: "Start Date",
                      name: "startDate",
                      min: new Date().toISOString().split("T")[0],
                    },
                    {
                      label: "End Date",
                      name: "endDate",
                      min:
                        formData.startDate ||
                        new Date().toISOString().split("T")[0],
                    },
                  ].map(({ label, name, min }) => (
                    <div key={name}>
                      <label className="block text-[0.65rem] sm:text-[0.68rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-1.5 sm:mb-2">
                        {label} *
                      </label>
                      <input
                        type="date"
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        required
                        min={min}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {[
                    { label: "Adults *", key: "numberOfAdults", min: 1 },
                    { label: "Children", key: "numberOfChildren", min: 0 },
                  ].map(({ label, key, min }) => (
                    <div key={key}>
                      <label className="block text-[0.65rem] sm:text-[0.68rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-1.5 sm:mb-2">
                        {label}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              [key]: Math.max(min, prev[key] - 1),
                            }))
                          }
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-[12px] border border-violet-500/30 bg-violet-500/10 text-violet-300 text-lg sm:text-xl font-bold cursor-pointer hover:bg-violet-500/25 hover:border-violet-500/60 transition-all flex items-center justify-center shrink-0"
                        >
                          −
                        </button>
                        <div className="flex-1 bg-violet-500/8 border border-violet-500/20 text-white rounded-[14px] text-center font-extrabold text-lg sm:text-xl py-2">
                          {formData[key]}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              [key]: prev[key] + 1,
                            }))
                          }
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-[12px] border border-violet-500/30 bg-violet-500/10 text-violet-300 text-lg sm:text-xl font-bold cursor-pointer hover:bg-violet-500/25 hover:border-violet-500/60 transition-all flex items-center justify-center shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/22 rounded-[24px] px-4 sm:px-8 py-5 sm:py-7 mb-4 sm:mb-5">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.4)] shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-lg sm:text-[1.35rem] font-black text-white leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Personal Information
                    </h3>
                    <p className="text-[#6b5a8e] text-xs sm:text-sm">
                      Tell us about yourself
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
                      />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-1.5">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="john@example.com"
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-1.5">
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="+977 98xxxxxxxx"
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-1.5">
                      Country *
                    </label>
                    <div className="relative">
                      <Globe
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
                      />
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        placeholder="Nepal"
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold text-violet-400 tracking-[0.18em] uppercase mb-1.5">
                      Special Requests
                    </label>
                    <div className="relative">
                      <MessageSquare
                        size={14}
                        className="absolute left-3 top-3.5 text-violet-500 pointer-events-none"
                      />
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Any special requirements..."
                        className={`${inputClass} pl-9 resize-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/22 rounded-[24px] px-4 sm:px-8 py-5 sm:py-7 mb-4 sm:mb-5">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.4)] shrink-0">
                    <CheckCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-lg sm:text-[1.35rem] font-black text-white leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Review & Confirm
                    </h3>
                    <p className="text-[#6b5a8e] text-xs sm:text-sm">
                      Check your booking details
                    </p>
                  </div>
                </div>
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-[18px] px-4 py-4 sm:px-5 sm:py-5 mb-4">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <MapPin size={14} className="text-violet-500" />
                    <span className="font-extrabold text-white text-xs sm:text-sm">
                      Trip Summary
                    </span>
                  </div>
                  {[
                    { label: "Package", value: tourPackage.title },
                    { label: "Destination", value: tourPackage.destination },
                    { label: "Duration", value: tourPackage.duration },
                    {
                      label: "Dates",
                      value: `${new Date(formData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(formData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                    },
                    {
                      label: "Guests",
                      value: `${formData.numberOfAdults} Adults, ${formData.numberOfChildren} Children`,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-start gap-2 py-2 border-b border-violet-500/12 last:border-b-0"
                    >
                      <span className="text-[#6b5a8e] text-xs sm:text-sm shrink-0">
                        {row.label}
                      </span>
                      <span className="text-white text-xs sm:text-sm font-bold text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Paid notice banner — shown when booking is already paid */}
                {bookingId && isPaid && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[14px] px-3 sm:px-4 py-3 flex gap-2 sm:gap-3 mb-4">
                    <CheckCircle
                      size={15}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />
                    <div className="text-xs sm:text-sm text-[#9e9ab5] leading-[1.65]">
                      <p className="font-bold text-emerald-400 mb-0.5">
                        Payment Complete
                      </p>
                      This booking has already been paid. No further action
                      needed.
                    </div>
                  </div>
                )}

                {/* Ready to book notice — only when booked but not paid */}
                {(!bookingId || !isPaid) && (
                  <div className="bg-emerald-500/8 border border-emerald-500/25 rounded-[14px] px-3 sm:px-4 py-3 flex gap-2 sm:gap-3">
                    <Shield
                      size={14}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    <div className="text-xs sm:text-sm text-[#9e9ab5] leading-[1.65]">
                      <p className="font-bold text-emerald-400 mb-1">
                        Ready to Book
                      </p>
                      Click "Confirm Booking" to reserve your spot. Pay via
                      Khalti immediately or later.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="bg-gradient-to-br from-[#1a0a3e] to-[#120630] border border-violet-500/22 rounded-[24px] px-4 sm:px-7 py-4 sm:py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-violet-300 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ArrowLeft size={15} /> Previous
              </button>

              <div className="flex flex-row xs:flex-row items-stretch xs:items-center gap-2 sm:gap-2.5">
                {bookingId && currentStep === 3 && (
                  <>
                    {/* Pay button — only shown when NOT paid */}
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={handlePayment}
                        disabled={processingPayment}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.03] disabled:opacity-55 disabled:cursor-not-allowed transition-all border-none cursor-pointer"
                      >
                        {processingPayment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard size={15} /> Pay $ {tourPackage.price}
                          </>
                        )}
                      </button>
                    )}

                    {/* Cancel button — only shown when NOT paid */}
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={cancelling}
                        className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-red-500 to-red-700 shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:scale-[1.03] disabled:opacity-55 disabled:cursor-not-allowed transition-all border-none cursor-pointer"
                      >
                        <XCircle size={15} /> Cancel
                      </button>
                    )}

                    {/* Paid badge — shown instead of buttons when paid */}
                    {isPaid && (
                      <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-[14px] text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                        <CheckCircle size={15} /> Payment Complete
                      </div>
                    )}
                  </>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
                    className="flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-500 to-violet-700 shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all border-none cursor-pointer"
                  >
                    Next Step <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={submitting || !!bookingId}
                    className="flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-[14px] font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:scale-[1.03] disabled:opacity-55 disabled:cursor-not-allowed transition-all border-none cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />{" "}
                        Booking...
                      </>
                    ) : bookingId ? (
                      <>
                        <CheckCircle size={15} /> Already Booked ✓
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} /> Confirm Booking
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
