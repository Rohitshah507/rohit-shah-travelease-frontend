import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const DashboardLayout = ({ children }) => {
  return (
    <div className="rounded-lg overflow-hidden flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[80px] px-4 bg-[#fff9f6] min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
};


export default DashboardLayout;
