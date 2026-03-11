import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import TouristDashboard from "./TouristDashboard";
import GuideDashboard from "./Guide Role/GuideDashboard";
import AdminDashboard from "./AdminDashboard";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  console.log("USER DATA:", userData);

  useEffect(() => {
    if (userData?.userDetails?.role?.includes("ADMIN")) {
      navigate("/admin"); // redirect to admin page
    }
  }, [userData, navigate]);

  if (!userData || !userData.userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {userData.userDetails.role.includes("TOURIST") && <TouristDashboard />}
      {userData.userDetails.role.includes("GUIDE") && <GuideDashboard />}
    </div>
  );
};

export default Home;