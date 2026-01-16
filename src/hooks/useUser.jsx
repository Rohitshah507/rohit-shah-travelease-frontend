import React, { useEffect } from "react";
import { serverURL } from "../App";
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import {useDispatch} from "react-redux"


const useUser = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/auth/user`, {
          withCredentials: true,
        });

        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, []);
};

export default useUser;
