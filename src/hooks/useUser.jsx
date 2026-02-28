import React, { useEffect } from "react";
import { serverURL } from "../App.jsx";
import { getToken } from "../pages/Login.jsx"; 
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const useUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(`${serverURL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(setUserData(res.data));
      } catch (error) {
        // If unauthorized, clear token & user and redirect
        if (error.response?.status === 401) {
          localStorage.removeItem("token"); // remove token
          dispatch(setUserData(null)); // clear user in Redux
          navigate("/login"); // navigate to login
        } else {
          console.error(error);
        }
      }
    };

    fetchUser();
  }, [dispatch]);
};

export default useUser;