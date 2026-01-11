import React, { useEffect } from "react";
import { serverURL } from "../App";
import axios from "axios";


const useUser = () => {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/auth/user`, {
          withCredentials: true,
        });

        console.log(result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, []);
};

export default useUser;
