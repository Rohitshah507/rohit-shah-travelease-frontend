import React, { useState, useEffect } from "react";
import { getToken } from "../pages/Login.jsx";
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
import { serverURL } from "../App";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useUser from "../hooks/useUser.jsx";

const BookingPage = () => {
  useUser();
  const { userData } = useSelector((state) => state.user);
  const { id } = useParams();

  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingId, setBookingId] = useState(null);
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

  // Auto-fill user data from Redux
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

  // Fetch package details + check if user already booked it
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
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          const existingBooking = bookingsRes.data.data?.find(
            (booking) =>
              (booking.tourPackageId?._id === id ||
                booking.tourPackageId === id) &&
              (booking.bookingStatus || "").toLowerCase() !== "cancelled",
          );

          if (existingBooking) {
            setBookingId(existingBooking._id);
          } else {
            setBookingId(null);
          }
        } catch (bookingErr) {
          console.log("No existing bookings found:", bookingErr.message);
        }
      } catch (err) {
        console.error(
          "FETCH ERROR:",
          err.response?.data?.message || err.message,
        );
        toast.error("Failed to load package details. Please try again.");
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

  // ─── CANCEL BOOKING ───
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

      toast.success("Booking cancelled successfully!", {
        icon: "🗑️",
        duration: 4000,
      });

      setBookingId(null);
      setCurrentStep(1);
      setShowSuccessModal(false);
    } catch (error) {
      console.error("CANCEL ERROR:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Cancellation failed. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ─── BOOK ONLY ───
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

      if (!createdBookingId) {
        throw new Error("Booking ID not returned from server");
      }

      setBookingId(createdBookingId);
      toast.success("Booking created successfully! 🎉", { duration: 3000 });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("BOOKING ERROR:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ✅ KHALTI PAYMENT — FIXED
  // ─────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!bookingId) {
      toast.error("No booking found. Please create a booking first.");
      return;
    }

    const loadingToast = toast.loading("Redirecting to Khalti...");

    try {
      setProcessingPayment(true);
      const token = getToken();

      const paymentResponse = await axios.post(
        `${serverURL}/api/payment/${bookingId}/khalti/initiate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("KHALTI RESPONSE:", paymentResponse.data);

      const khaltiPaymentUrl =
        (typeof paymentResponse.data?.paymentUrl === "string"
          ? paymentResponse.data.paymentUrl
          : null) ||
        paymentResponse.data?.paymentUrl?.payment_url ||
        paymentResponse.data?.payment_url;

      if (!khaltiPaymentUrl) {
        toast.dismiss(loadingToast);
        throw new Error(
          "Khalti payment URL not returned from server. Check backend response.",
        );
      }

      toast.dismiss(loadingToast);
      toast.success("Redirecting to Khalti payment...", { duration: 2000 });

      setTimeout(() => {
        window.location.href = khaltiPaymentUrl;
      }, 500);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error(
        "KHALTI PAYMENT ERROR:",
        error.response?.data || error.message,
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Payment initiation failed. Please try again.",
      );
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-semibold animate-pulse">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (!tourPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400">Package not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 8px 32px rgba(109,40,217,0.18)",
          },
          success: {
            style: {
              background: "#f5f3ff",
              color: "#5b21b6",
              border: "1.5px solid #c4b5fd",
            },
            iconTheme: { primary: "#7c3aed", secondary: "#fff" },
          },
          error: {
            style: {
              background: "#fff1f2",
              color: "#be123c",
              border: "1.5px solid #fecdd3",
            },
            iconTheme: { primary: "#e11d48", secondary: "#fff" },
          },
          loading: {
            style: {
              background: "#f5f3ff",
              color: "#5b21b6",
              border: "1.5px solid #c4b5fd",
            },
            iconTheme: { primary: "#7c3aed", secondary: "#fff" },
          },
        }}
      />

      {/* Custom Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border-2 border-red-100 animate-[slideUp_0.25s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <XCircle size={26} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Cancel Booking?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to cancel this booking? Your reservation
              will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all duration-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-green-200 animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-5 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-lg animate-[bounce_1s_ease-in-out]">
                  <CheckCircle size={36} className="text-green-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-1 flex items-center justify-center gap-2">
                  <Sparkles size={20} className="animate-pulse" />
                  Booking Confirmed!
                  <Sparkles size={20} className="animate-pulse" />
                </h3>
                <p className="text-green-100 text-xs">
                  Your adventure is reserved
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">
                  Booking ID
                </p>
                <p className="font-mono font-bold text-green-900 text-xs">
                  {bookingId}
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Package", value: tourPackage.title },
                  { label: "Location", value: tourPackage.destination },
                  {
                    label: "Dates",
                    value: `${new Date(formData.startDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )} - ${new Date(formData.endDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )}`,
                  },
                  {
                    label: "Guests",
                    value: `${formData.numberOfAdults} Adults, ${formData.numberOfChildren} Children`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-1.5 border-b border-gray-100"
                  >
                    <span className="text-xs text-gray-600 font-medium">
                      {row.label}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {row.value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                  <span className="text-sm text-green-700 font-bold">
                    Total Amount
                  </span>
                  <span className="text-xl font-black text-green-600">
                    Rs. {tourPackage.price}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 flex gap-3">
                <Shield
                  className="text-purple-500 flex-shrink-0 mt-0.5"
                  size={16}
                />
                <div className="text-xs text-purple-800">
                  <p className="font-semibold mb-0.5">Payment Required</p>
                  <p>
                    Complete payment via Khalti to confirm your booking. Click
                    "Pay Now" below.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all duration-300"
              >
                Pay Later
              </button>
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-xs hover:from-purple-600 hover:to-violet-600 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-300/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {processingPayment ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    Pay with Khalti
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40 border-b-2 border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors duration-300 font-semibold group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform duration-300"
              />
              Back to Destinations
            </button>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Shield className="text-green-500" size={18} />
                <span className="text-gray-600 font-medium">
                  Secure Booking
                </span>
              </div>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isFavorite
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-violet-50"
                }`}
              >
                <Heart size={20} className={isFavorite ? "fill-white" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Package Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24 border-2 border-violet-100">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={tourPackage.imageUrls?.[0]}
                  alt={tourPackage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-violet-600 capitalize">
                  {tourPackage.status}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                    {tourPackage.title}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin size={16} className="text-violet-500" />
                    <span>{tourPackage.destination}</span>
                  </div>
                </div>

                <div className="flex gap-7 py-3 border-t border-b border-gray-200">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-violet-500" />
                      <span className="font-medium">
                        {tourPackage.duration}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm flex items-center gap-1">
                      <Users size={16} className="text-violet-500" />
                      <span className="font-medium">{tourPackage.group}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                    <Star size={16} className="fill-yellow-500" />
                    <span>{tourPackage.rating}</span>
                    <span className="text-gray-400 font-normal">
                      ({tourPackage.reviews})
                    </span>
                  </div>
                </div>

                <div className="text-violet-500 text-sm font-bold">
                  <span>
                    <span className="text-gray-600 font-normal">
                      Started at:{" "}
                    </span>
                    {new Date(tourPackage.startDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="border-t-2 border-violet-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Rs. {tourPackage.price}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                  {[
                    "Free Cancellation",
                    "Best Price",
                    "24/7 Support",
                    "Instant Confirm",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <Check className="text-green-500" size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 mb-6 border-2 border-violet-100">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 ${
                          currentStep >= step
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-300/40 scale-110"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {currentStep > step ? <Check size={22} /> : step}
                      </div>
                      <p
                        className={`text-xs mt-2 font-semibold ${
                          currentStep >= step
                            ? "text-violet-600"
                            : "text-gray-400"
                        }`}
                      >
                        {["Trip Details", "Your Info", "Review"][step - 1]}
                      </p>
                    </div>
                    {step < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                          currentStep > step
                            ? "bg-gradient-to-r from-violet-600 to-purple-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* STEP 1: Trip Details */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 border-2 border-violet-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                      <Calendar className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Trip Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        When do you want to travel?
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300 outline-none font-medium cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        min={
                          formData.startDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300 outline-none font-medium cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Number of Adults *
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              numberOfAdults: Math.max(
                                1,
                                prev.numberOfAdults - 1,
                              ),
                            }))
                          }
                          className="w-12 h-12 bg-gray-100 hover:bg-violet-600 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          -
                        </button>
                        <div className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-xl">
                          {formData.numberOfAdults}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              numberOfAdults: prev.numberOfAdults + 1,
                            }))
                          }
                          className="w-12 h-12 bg-gray-100 hover:bg-violet-600 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Number of Children
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              numberOfChildren: Math.max(
                                0,
                                prev.numberOfChildren - 1,
                              ),
                            }))
                          }
                          className="w-12 h-12 bg-gray-100 hover:bg-violet-600 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          -
                        </button>
                        <div className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-xl">
                          {formData.numberOfChildren}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              numberOfChildren: prev.numberOfChildren + 1,
                            }))
                          }
                          className="w-12 h-12 bg-gray-100 hover:bg-violet-600 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal Info */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 border-2 border-violet-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Personal Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        Tell us about yourself
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="john@example.com"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="+977 98xxxxxxxx"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Country *
                      </label>
                      <div className="relative">
                        <Globe
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          placeholder="Nepal"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Special Requests
                      </label>
                      <div className="relative">
                        <MessageSquare
                          className="absolute left-4 top-4 text-gray-400"
                          size={20}
                        />
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Any special requirements or preferences..."
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-300 outline-none font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Confirm */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 border-2 border-violet-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                      <CheckCircle className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Review & Confirm
                      </h3>
                      <p className="text-sm text-gray-600">
                        Check your booking details
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 sm:p-6 border-2 border-violet-200">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-violet-500" />
                        Trip Summary
                      </h4>
                      <div className="space-y-2">
                        {[
                          { label: "Package", value: tourPackage.title },
                          {
                            label: "Destination",
                            value: tourPackage.destination,
                          },
                          { label: "Duration", value: tourPackage.duration },
                          {
                            label: "Dates",
                            value: `${new Date(
                              formData.startDate,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })} - ${new Date(
                              formData.endDate,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}`,
                          },
                          {
                            label: "Guests",
                            value: `${formData.numberOfAdults} Adults, ${formData.numberOfChildren} Children`,
                          },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {row.label}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex gap-3">
                      <Shield
                        className="text-green-500 flex-shrink-0"
                        size={20}
                      />
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-1">Ready to Book</p>
                        <p>
                          Click "Confirm Booking" below to reserve your spot.
                          You'll be able to pay via Khalti immediately or later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl shadow-lg p-5 sm:p-6 border-2 border-violet-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95"
                  }`}
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>

                {/* Pay / Cancel buttons — only on step 3 when already booked */}
                {bookingId && currentStep === 3 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={processingPayment}
                      className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-violet-600 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {processingPayment ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} />
                          Pay Rs. {tourPackage.price}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={cancelling}
                      className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-red-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <XCircle size={20} />
                      Cancel
                    </button>
                  </div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-violet-300/40"
                  >
                    Next Step
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBooking(e);
                    }}
                    disabled={submitting || !!bookingId}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Booking...
                      </>
                    ) : bookingId ? (
                      <>
                        <CheckCircle size={20} />
                        Already Booked ✓
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Confirm Booking
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
