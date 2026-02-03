import React from "react";
import { useSelector } from "react-redux";

import TouristDashboard from "../Components/TouristDashboard";
import GuideDashboard from "../Components/GuideDashboard";
import AdminDashboard from "../Components/AdminDashboard";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="">
      {userData.user?.role.includes("TOURIST") && <TouristDashboard />}
      {userData.user?.role.includes("GUIDE") && <GuideDashboard />}
      {userData.user?.role.includes("ADMIN") && <AdminDashboard />}
    </div>
  );
};

export default Home;
