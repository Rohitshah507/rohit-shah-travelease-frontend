import React, { useState } from "react";

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App.jsx";

const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("TOURIST");
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [guideDocument, setGuideDocument] = useState(null);

  const handleSignUp = async () => {
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
      alert(res.data.message);
      navigate("/otp-verification", {
        state: { email },
      });

      console.log(res);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Sign Up Failed. Please try again.");
      }
    }
  };

  return (
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
            className={`text-2xl font-bold mb-3`}
            style={{ color: primaryColor }}
          >
            TravelEase
          </h1>

          <p className="text-1xl text-blue-600">Create Your Account</p>
        </div>

        {/* User Name*/}

        <div className="m-4">
          <label
            htmlFor="userName"
            className="block text-gray-500 font-bold mb-2"
          >
            User Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 "
            placeholder="Enter Your Name"
            style={{ border: `1px solid ${borderColor}` }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          ></input>
        </div>

        {/* Email */}

        <div className="m-4">
          <label htmlFor="email" className="block text-gray-500 font-bold mb-2">
            Email
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 "
            placeholder="Enter Your Email"
            style={{ border: `1px solid ${borderColor}` }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>

        {/* Phone Number */}
        <div className="m-4">
          <label
            htmlFor="phoneNumber"
            className="block text-gray-500 font-bold mb-2"
          >
            Phone Number
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 "
            placeholder="Enter Your Phone Number"
            style={{ border: `1px solid ${borderColor}` }}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          ></input>
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
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
              placeholder="Enter Your Password"
              style={{ border: `1px solid ${borderColor}` }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button
              type="button"
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>

        {/* roles */}

        <div className="m-4">
          <label htmlFor="Role" className="block text-gray-500 font-bold mb-2">
            Role
          </label>
          <div className="flex gap-6">
            {["TOURIST", "GUIDE", "ADMIN"].map((r) => (
              <button
                className="flex border rounded-lg px-4 py-1 text-center font-medium cursor-pointer transition-colors shadow-lg hover:bg-orange-100"
                key={r}
                onClick={() => setRole(r)}
                style={
                  role === r
                    ? {
                        backgroundColor: primaryColor,
                        color: "white",
                        border: `1px solid ${primaryColor}`,
                      }
                    : { border: `1px solid ${borderColor}` }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {role === "GUIDE" && (
          <div className="m-4">
            <label className="block text-gray-500 font-bold mb-2">
              Upload Citizenship Document +
            </label>

            <input
              type="file"
              name="citizenship"
              accept="image/*,.pdf"
              onChange={(e) => setGuideDocument(e.target.files[0])}
              className="border shadow-lg rounded-lg cursor-pointer p-2 w-full"
              required
            />
          </div>
        )}

        {/* Sign Up Button */}
        <button
          className="ml-3 w-80 px-3 bg-orange-600 cursor-pointer text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 hover:text-white border: 1px solid border-gray-300 transition-colors"
          onClick={handleSignUp}
        >
          Sign Up
        </button>
        <p
          className="ml-10 mt-2 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Already have an account?
          <span className="text-orange-600 shadow-lg font-bold"> Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
