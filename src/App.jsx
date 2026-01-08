import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp.jsx'
import LogIn from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import VerificationCard from './pages/VerificationCard.jsx'
import ForgetPassword from './pages/ForgetPassword.jsx'

export const serverURL = "http://localhost:5000"
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/verification" element={<VerificationCard />} />
        <Route path="forget-password" element={<ForgetPassword/> }/>
      </Routes>
    </div>
  )
}

export default App
