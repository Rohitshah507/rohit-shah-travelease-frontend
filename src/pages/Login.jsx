import React, { useState } from "react";

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { serverURL } from "../App.jsx";
const SignIn = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      const res = await axios.post(
        `${serverURL}/api/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      alert(res.data.message);
      navigate("/home");

      console.log(res);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Sign In Failed. Please try again.");
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

          <p className="text-1xl font-bold text-blue-600">Log In</p>
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

        <div className="text-orange-600 ml-50 text-bold font-medium mb-2 cursor-pointer" onClick={()=> navigate("/forget-password")}>
          Forget Password
        </div>

        {/* Sign In Button */}
        <button
          className="ml-3 w-80 px-3 bg-orange-600 cursor-pointer text-white font-bold py-2 rounded-lg shadow-lg hover:bg-orange-500 hover:text-white border: 1px solid border-gray-300 transition-colors"
          onClick={handleSignIn}
        >
          Sign In
        </button>
        <p
          className="ml-15 flex text-center gap-3 mt-2 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Create an account ?
          <span className="text-orange-600 font-bold "> Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
