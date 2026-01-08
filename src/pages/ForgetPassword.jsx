import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const borderColor = "#ddd";
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full items-center bg-[#fff9f6] flex justify-center ">
      <div className="bg-white rounded-xl w-full shadow-lg max-w-sm p-6 ">
        <div className="flex items-center gap-4 mb-4">
          <IoArrowBack
            size={20}
            className="text-orange-600 cursor-pointer"
            onClick={() => navigate("/login")}
          />
          <h1 className="text-xl items-center font-bold text-red-500">
            Forget Password
          </h1>
        </div>

        {step == 1 && (
          <div>
            <div className="m-4">
              <label
                htmlFor="email"
                className="block text-gray-500 font-bold mb-2"
              >
                Email
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 shadow-lg focus:outline-none focus:border-sky-500 "
                placeholder="Enter Your Email"
                style={{ border: `1px solid ${borderColor}` }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></input>
            </div>

            <button className="ml-4 w-76 bg-orange-600 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 hover:text-white border: 1px solid border-gray-300 transition-colors">
              Send OTP
            </button>
          </div>
        )}

        {step == 2 && (
          <div>
            <div className="m-4">
              <label
                htmlFor="OTP"
                className="block text-gray-500 font-bold mb-2"
              >
                OTP
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 shadow-lg focus:outline-none focus:border-sky-500 "
                placeholder="Enter Your OTP"
                style={{ border: `1px solid ${borderColor}` }}
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
              ></input>
            </div>

            <button className="ml-4 w-76 bg-orange-600 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 hover:text-white border: 1px solid border-gray-300 transition-colors">
              Verify
            </button>
          </div>
        )}

        {step == 3 && (
          <div>
            <div className="m-4">
              <label
                htmlFor="NewPassword"
                className="block text-gray-500 font-bold mb-2"
              >
                New Password
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 shadow-lg mb-2 focus:outline-none focus:border-sky-500 "
                placeholder="Enter New Password"
                style={{ border: `1px solid ${borderColor}` }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></input>
            </div>

            <div className="m-4">
              <label
                htmlFor="ConfirmNewPassword"
                className="block text-gray-500 font-bold mb-2"
              >
                Confirm New Password
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 shadow-lg mb-3 focus:outline-none focus:border-sky-500 "
                placeholder="Enter Confirm Password"
                style={{ border: `1px solid ${borderColor}` }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></input>
            </div>

            <button className="ml-4 w-76 bg-orange-600 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 hover:text-white border: 1px solid border-gray-300 transition-colors">
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
