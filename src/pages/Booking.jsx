import React, { useState, useEffect } from "react";
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
  Info,
  Shield,
  Zap,
  Award,
  Globe,
  Plane,
  Hotel,
  Utensils,
  Camera,
} from "lucide-react";
import { serverURL } from "../App";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useUser from "../hooks/useUser.jsx";

const BookingPage = () => {
  useUser();
  const { userData } = useSelector((state) => state.user);
  const { id } = useParams();

  const [tourPackage, setTourPackage] = useState(true);
  const [bookingDate, setBookingDate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    adults: 2,
    children: 0,
    fullName: "",
    email: "",
    phone: "",
    country: "",
    specialRequests: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
  });
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  console.log("USER DATA FROM REDUX:", userData);

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
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverURL}/api/user/${id}`, {
          withCredentials: true,
        });
        console.log("PACKAGE FROM API:", res.data.packageId);
        setTourPackage(res.data.packageId);
      } catch (err) {
        console.error("FETCH ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPackage();
  }, [id]);

  const addOns = [
    { id: 1, name: "Travel Insurance", price: 50, icon: Shield },
    { id: 2, name: "Airport Pickup", price: 30, icon: Plane },
    { id: 3, name: "Hotel Upgrade", price: 100, icon: Hotel },
    { id: 4, name: "Meal Plan", price: 75, icon: Utensils },
    { id: 5, name: "Photography Package", price: 150, icon: Camera },
    { id: 6, name: "Priority Booking", price: 25, icon: Zap },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (!tourPackage) return 0;
    const basePrice =
      tourPackage.price * (formData.adults + formData.children * 0.5);
    const addOnsTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find((a) => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    return basePrice + addOnsTotal;
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${serverURL}/api/booking/tourist`,
        {
          tourPackageId: tourPackage._id || tourPackage.id,
          bookingDate: formData.startDate,
        },
        { withCredentials: true },
      );

      console.log("BOOKING RESPONSE:", response.data);
      alert("Booking Confirmed 🎉");
    } catch (error) {
      console.error("BOOKING ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Booking Failed");
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
          <p className="text-gray-600 font-semibold animate-pulse">
            Loading booking details...
          </p>
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
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-orange-100">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors duration-300 font-semibold group"
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
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                    {tourPackage.title}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin size={16} className="text-orange-500" />
                    <span>{tourPackage.destination}</span>
                  </div>
                </div>

                <div className="flex gap-7 py-3 border-t border-b border-gray-200">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-orange-500" />
                      <span className="font-medium">
                        {tourPackage.duration}
                      </span>
                    </div>

                    <div className="text-gray-600 text-sm">
                      <Users size={16} className="text-orange-500" />
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

                <div className="items-center gap-1 text-yellow-500 text-sm font-bold ml-auto">
                  <span>
                    <span>Started at: </span>
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

                {/* Price Breakdown */}
                <div className="space-y-3 pt-2">
                  <div className="border-t-2 border-orange-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                      ${tourPackage.price}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
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

          {/* Right Side - Booking Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-100">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${currentStep >= step ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-110" : "bg-gray-200 text-gray-500"}`}
                      >
                        {currentStep > step ? <Check size={24} /> : step}
                      </div>
                      <p
                        className={`text-xs mt-2 font-semibold ${currentStep >= step ? "text-orange-500" : "text-gray-400"}`}
                      >
                        {["Trip Details", "Your Info", "Payment"][step - 1]}
                      </p>
                    </div>
                    {step < 4 && (
                      <div
                        className={`flex-1 h-1 mx-2 transition-all duration-300 ${currentStep > step ? "bg-gradient-to-r from-orange-500 to-yellow-500" : "bg-gray-200"}`}
                      />
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
                      <h3 className="text-2xl font-bold text-gray-900">
                        Trip Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        When do you want to travel?
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
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
                              adults: Math.max(1, prev.adults - 1),
                            }))
                          }
                          className="w-12 h-12 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          -
                        </button>
                        <div className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-xl">
                          {formData.adults}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              adults: prev.adults + 1,
                            }))
                          }
                          className="w-12 h-12 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
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
                              children: Math.max(0, prev.children - 1),
                            }))
                          }
                          className="w-12 h-12 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                        >
                          -
                        </button>
                        <div className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-xl">
                          {formData.children}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              children: prev.children + 1,
                            }))
                          }
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
                      <h3 className="text-2xl font-bold text-gray-900">
                        Personal Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        Tell us about yourself
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
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
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
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
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
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
                          placeholder="+1 234 567 8900"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
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
                          placeholder="United States"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
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
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border-2 border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                      <CreditCard className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Payment Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        Secure payment processing
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <CreditCard
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          required
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                          placeholder="123"
                          maxLength="3"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Billing Address *
                      </label>
                      <textarea
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        placeholder="123 Main St, City, State, ZIP"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none font-medium resize-none"
                      />
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label className="text-sm text-gray-700">
                        I agree to the{" "}
                        <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                          Terms & Conditions
                        </span>{" "}
                        and{" "}
                        <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                          Privacy Policy
                        </span>
                      </label>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex gap-3">
                      <Shield
                        className="text-green-500 flex-shrink-0"
                        size={20}
                      />
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-1">Secure Payment</p>
                        <p>
                          Your payment information is encrypted and secure. We
                          never store your card details.
                        </p>
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
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 ${currentStep === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95"}`}
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
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
                  >
                    <Check size={20} />
                    Confirm Booking
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
