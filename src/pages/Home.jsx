import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || !userData.userDetails) return;

    const role = userData.userDetails.role;

    if (role?.includes("ADMIN")) {
      navigate("/admin", { replace: true });
    } else if (role?.includes("GUIDE")) {
      navigate("/guide", { replace: true });
    } else if (role?.includes("TOURIST")) {
      navigate("/tourist", { replace: true });
    }
  }, [userData, navigate]);

  return <div>Loading...</div>;
};

export default Home;