import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp.jsx'
import LogIn from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import ForgetPassword from './pages/ForgetPassword.jsx'
import OtpVerification from './pages/OtpVerification.jsx'

export const serverURL = "http://localhost:5000"
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/otp-verification" element={<OtpVerification/> }/>
        <Route path="forget-password" element={<ForgetPassword/> }/>
      </Routes>
    </div>
  )
}

export default App
