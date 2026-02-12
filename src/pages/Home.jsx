import React from "react";
import { useSelector } from "react-redux";

import TouristDashboard from "./TouristDashboard";
import GuideDashboard from "./GuideDashboard";
import AdminDashboard from "./AdminDashboard";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  console.log("USER DATA:", userData);

  return (
    <div className="">
      {userData.userDetails?.role.includes("TOURIST") && <TouristDashboard />}
      {userData.userDetails?.role.includes("GUIDE") && <GuideDashboard />}
      {userData.userDetails?.role.includes("ADMIN") && <AdminDashboard />}
    </div>
  );
};

export default Home;
