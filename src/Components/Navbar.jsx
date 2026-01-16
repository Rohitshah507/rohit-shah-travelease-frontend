import React from "react";
import { FaCartArrowDown } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
  return (
    <div className="w-full h-[60px]  rounded-lg flex items-center justify-between gap-[30px] px-[20px] fixed top-0 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-[#8C4B33]">TravelEase</h1>
      <div className="text-[#4A4A4A] hidden md:block">
        <ul className="flex">
          <li className="mx-4 text-lg font-medium cursor-pointer hover:text-black-400">
            Home
          </li>
          <li className="mx-4 text-lg font-medium cursor-pointer hover:text-black-400">
            About Us
          </li>
          <li className="mx-4 text-lg font-medium cursor-pointer hover:text-black-400">
            Tour
          </li>
          <li className="mx-4 text-lg font-medium cursor-pointer hover:text-black-400">
            Contact
          </li>
        </ul>
      </div>
      <div className="flex gap-4 items-center">
        <div className="mx-4 text-lg font-medium cursor-pointer hover:text-black-400">
          <FaCartArrowDown size={25} className="text-orange-500" />
        </div>
        <div className="mx-4 text-lg font-medium cursor-pointer hover:text-black-400">
          <CgProfile size={25} className="text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
