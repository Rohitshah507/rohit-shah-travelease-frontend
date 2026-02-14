import React from "react";
import DashboardLayout from "../Components/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div>
        <button
          className="bg-gradient-to-r from-white to-amber-600 font-bold text-black px-6 py-2 rounded-full hover:shadow-lg transition cursor-pointer"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
