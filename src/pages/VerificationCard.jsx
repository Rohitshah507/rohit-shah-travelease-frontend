import React, { useState } from "react";
import axios from "axios";

import { serverURL } from "../App.jsx";

const VerificationCard = () => {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);

 const handleVerificationCode = ()=>{

 }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="w-16 h-16 mb-8 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-gray-800 font-semibold text-lg mb-6">
          Verify your account
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Enter the 6-digit verification code sent to your email
        </p>

        {/* OTP Input Boxes */}
        <div className="flex gap-2 mb-6">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleVerificationCode(e.target.value, index)}
              className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          disabled={finalCode.length !== 6}
          className={`w-full py-3 rounded-xl font-semibold transition
            ${
              finalCode.length === 5
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }` }
        >
          Verify Code
        </button>

        {/* Security Note */}
        <p className="text-gray-400 text-xs mt-6">
          Never share your verification code with anyone.
        </p>
      </div>
    </div>
  );
};

export default VerificationCard;
