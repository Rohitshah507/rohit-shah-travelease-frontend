import React, { useEffect } from "react";
import { serverURL } from "../App.jsx";
import { getToken } from "../pages/Login.jsx"; // adjust path
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";

const useUser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();

        if (!token) return;

        const res = await axios.get(`${serverURL}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        dispatch(setUserData(res.data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, []);
};

export default useUser;
