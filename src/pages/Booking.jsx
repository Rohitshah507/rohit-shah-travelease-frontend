import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
} from "lucide-react";
import { serverURL } from "../App";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useUser from "../hooks/useUser.jsx";

const BookingPage = () => {
  useUser();
  const { userData } = useSelector((state) => state.user);
  const { id } = useParams();
  const esewaFormRef = useRef(null);

  const [tourPackage, setTourPackage]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [currentStep, setCurrentStep]     = useState(1);
  const [isFavorite, setIsFavorite]       = useState(false);
  const [bookingId, setBookingId]         = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [esewaData, setEsewaData]         = useState(null);

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

  console.log("USER DATA FROM REDUX:", userData);

  // Auto-fill user data from Redux
  useEffect(() => {
    if (userData?.userDetails) {
      setFormData((prev) => ({
        ...prev,
        fullName: userData.userDetails.username || "",
        email:    userData.userDetails.email || "",
        phone:    userData.userDetails.phoneNumber || "",
        country:  userData.userDetails.country || "",
      }));
    }
  }, [userData]);

  // Fetch package details
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${serverURL}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("PACKAGE FROM API:", res.data.packageId);
        setTourPackage(res.data.packageId);
      } catch (err) {
        console.error("FETCH ERROR:", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPackage();
  }, [id]);

  // Auto-submit hidden eSewa form when esewaData is set
  useEffect(() => {
    if (esewaData && esewaFormRef.current) {
      console.log("AUTO-SUBMITTING ESEWA FORM WITH DATA:", esewaData);
      esewaFormRef.current.submit();
    }
  }, [esewaData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ─────────────────────────────────────────────────────────────
  // ✅ STEP 1: Create booking
  // ✅ STEP 2: Initiate eSewa payment
  // ✅ STEP 3: Auto-redirect to eSewa
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      // ✅ STEP 1: Create booking in database
      console.log("Creating booking with data:", {
        tourPackageId: tourPackage._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfAdults: formData.numberOfAdults,
        numberOfChildren: formData.numberOfChildren,
        bookingStatus: "Pending",
      });

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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("BOOKING CREATED:", bookingResponse.data);
      const createdBookingId = bookingResponse.data.data?._id || bookingResponse.data._id;
      setBookingId(createdBookingId);

      if (!createdBookingId) {
        throw new Error("Booking ID not returned from server");
      }

      // ✅ STEP 2: Initiate eSewa payment
      console.log("Initiating eSewa payment for booking:", createdBookingId);
      const paymentResponse = await axios.post(
        `${serverURL}/api/payment/esewa/initiate`,
        { bookingId: createdBookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("ESEWA PAYMENT INITIATED:", paymentResponse.data);
      const esewaPaymentData = paymentResponse.data.data?.esewaData || paymentResponse.data.esewaData;

      if (!esewaPaymentData) {
        throw new Error("eSewa payment data not returned from server");
      }

      // ✅ STEP 3: Set eSewa data → triggers auto-submit via useEffect
      setEsewaData(esewaPaymentData);

    } catch (error) {
      console.error("BOOKING/PAYMENT ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || error.message || "Booking failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-semibold animate-pulse">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!tourPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400">Package not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">

      {/* ─────────────────────────────────────────────────────── */}
      {/* ✅ HIDDEN ESEWA FORM — auto-submits when esewaData is set */}
      {/* ─────────────────────────────────────────────────────── */}
      {esewaData && (
        <form
          ref={esewaFormRef}
          method="POST"
          action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
          style={{ display: "none" }}
        >
          {Object.keys(esewaData).map((key) => (
            <input key={key} type="hidden" name={key} value={esewaData[key]} />
          ))}
        </form>
      )}

      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-orange-100">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors duration-300 font-semibold group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Destinations
            </button>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Shield className="text-green-500" size={18} />
                <span className="text-gray-600 font-medium">Secure Booking</span>
              </div>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-all duration-300 ${isFavorite ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-orange-50"}`}
              >
                <Heart size={20} className={isFavorite ? "fill-white" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Side - Package Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24 border-2 border-orange-100">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={tourPackage.imageUrls?.[0]}
                  alt={tourPackage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-orange-500 capitalize">
                  {tourPackage.status}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{tourPackage.title}</h2>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin size={16} className="text-orange-500" />
                    <span>{tourPackage.destination}</span>
                  </div>
                </div>

                <div className="flex gap-7 py-3 border-t border-b border-gray-200">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-orange-500" />
                      <span className="font-medium">{tourPackage.duration}</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      <Users size={16} className="text-orange-500" />
                      <span className="font-medium">{tourPackage.group}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                    <Star size={16} className="fill-yellow-500" />
                    <span>{tourPackage.rating}</span>
                    <span className="text-gray-400 font-normal">({tourPackage.reviews})</span>
                  </div>
                </div>

                <div className="items-center gap-1 text-yellow-500 text-sm font-bold ml-auto">
                  <span>
                    <span>Started at: </span>
                    {new Date(tourPackage.startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-2">
                  <div className="border-t-2 border-orange-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                      ${tourPackage.price}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                  {["Free Cancellation", "Best Price", "24/7 Support", "Instant Confirm"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <Check className="text-green-500" size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="lg:col-span-2">

            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-100">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        currentStep >= step
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-110"
                          : "bg-gray-200 text-gray-500"
                      }`}>
                        {currentStep > step ? <Check size={24} /> : step}
                      </div>
                      <p className={`text-xs mt-2 font-semibold ${currentStep >= step ? "text-orange-500" : "text-gray-400"}`}>
                        {["Trip Details", "Your Info", "Payment"][step - 1]}
                      </p>
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                        currentStep > step ? "bg-gradient-to-r from-orange-500 to-yellow-500" : "bg-gray-200"
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* STEP 1: Trip Details */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border-2 border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                      <Calendar className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Trip Details</h3>
                      <p className="text-sm text-gray-600">When do you want to travel?</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block cursor-pointer text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border-2 cursor-pointer border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block cursor-pointer text-sm font-bold text-gray-700 mb-2">End Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        min={formData.startDate || new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border-2 cursor-pointer border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block cursor-pointer text-sm font-bold text-gray-700 mb-2">Number of Adults *</label>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, numberOfAdults: Math.max(1, prev.numberOfAdults - 1) }))}
                          className="w-12 h-12 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          -
                        </button>
                        <div className="flex-1 px-4 py-3 border-2 cursor-pointer border-gray-200 rounded-xl text-center font-bold text-xl">
                          {formData.numberOfAdults}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, numberOfAdults: prev.numberOfAdults + 1 }))}
                          className="w-12 h-12 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cursor-pointer">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Number of Children</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, numberOfChildren: Math.max(0, prev.numberOfChildren - 1) }))}
                          className="w-12 h-12 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          -
                        </button>
                        <div className="flex-1 cursor-pointer px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-xl">
                          {formData.numberOfChildren}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, numberOfChildren: prev.numberOfChildren + 1 }))}
                          className="w-12 h-12 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
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
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border-2 border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                      <p className="text-sm text-gray-600">Tell us about yourself</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="john@example.com"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="+1 234 567 8900"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Country *</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          placeholder="United States"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Special Requests</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 text-gray-400" size={20} />
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Any special requirements or preferences..."
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment (eSewa) */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border-2 border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                      <CreditCard className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Payment via eSewa</h3>
                      <p className="text-sm text-gray-600">Secure payment with eSewa</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* eSewa info box */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                          <img
                            src="https://esewa.com.np/common/images/esewa_logo.png"
                            alt="eSewa"
                            className="w-10 h-10 object-contain"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">Pay with eSewa</p>
                          <p className="text-sm text-gray-600">Nepal's #1 digital wallet</p>
                        </div>
                      </div>

                      <div className="bg-white/60 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Package Price</span>
                          <span className="font-bold text-gray-900">Rs. {tourPackage.price}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-bold text-gray-900">Total Amount</span>
                          <span className="text-xl font-black text-green-600">Rs. {tourPackage.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms checkbox */}
                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label className="text-sm text-gray-700">
                        I agree to the{" "}
                        <span className="text-orange-500 font-semibold cursor-pointer hover:underline">Terms & Conditions</span>
                        {" "}and{" "}
                        <span className="text-orange-500 font-semibold cursor-pointer hover:underline">Privacy Policy</span>
                      </label>
                    </div>

                    {/* Secure notice */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex gap-3">
                      <Shield className="text-green-500 flex-shrink-0" size={20} />
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-1">Secure Payment</p>
                        <p>Your payment is processed securely through eSewa. You will be redirected to complete the payment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95"
                  }`}
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-yellow-600 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
                  >
                    Next Step
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Pay with eSewa
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