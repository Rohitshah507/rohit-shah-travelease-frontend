import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Menu,
  X,
  ShoppingCart,
  LogOut,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import useUser from "../hooks/useUser";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const userData = useSelector((state) => state.user.userData);
  console.log("REDUX USER STATE:", userData);

  /* ---------------- SCROLL EFFECT ---------------- */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    toast
      .promise(
        new Promise((resolve) => {
          setTimeout(() => {
            localStorage.removeItem("token");
            resolve();
          }, 800);
        }),
        {
          loading: "Logging out…",
          success: "Logged out successfully!",
          error: "Logout failed",
        },
      )
      .then(() => setTimeout(() => window.location.reload(), 500));
  };

  /* ---------------- DESKTOP NAV LINK ---------------- */
  const DesktopNavLink = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-2 font-semibold text-sm transition-colors ${
          isActive ? "text-violet-700" : "text-gray-700 hover:text-violet-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-700 rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );

  /* ---------------- MOBILE NAV LINK ---------------- */
  const MobileNavLink = ({ to, children }) => (
    <NavLink
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={({ isActive }) =>
        `block px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
          isActive
            ? "bg-violet-50 text-violet-700"
            : "text-gray-700 hover:bg-gray-50"
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <>
      {/* Toast */}
      <Toaster position="top-right" />

      <nav
        className={`fixed w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md ${
          scrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <NavLink
            to="/home"
            className="text-3xl font-black text-violet-800 tracking-tight"
          >
            Travel<span className="text-amber-500">Ease</span>
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 font-bold">
            <DesktopNavLink to="/home">Home</DesktopNavLink>
            <DesktopNavLink to="/destinations">Destinations</DesktopNavLink>
            <DesktopNavLink to="/places-to-visit">
              Places to Visit
            </DesktopNavLink>
            <DesktopNavLink to="/packages">Packages</DesktopNavLink>
            <DesktopNavLink to="/tour">TourList</DesktopNavLink>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => toast.success("Cart opened!")}
              className="relative p-2.5 hover:bg-violet-50 rounded-xl transition-colors"
            >
              <ShoppingCart size={22} className="text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-700 to-purple-600 text-white rounded-full font-semibold text-sm"
              >
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-violet-700 font-black text-xs uppercase">
                  {userData?.userDetails?.username
                    ? userData.userDetails.username.charAt(0)
                    : "U"}
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border overflow-hidden">
                  {/* Profile Info */}
                  <div className="p-5 bg-gradient-to-r from-violet-700 to-purple-600 text-white">
                    <p className="font-bold">
                      {userData?.userDetails?.username}
                    </p>
                    <p className="text-sm opacity-80">
                      {userData?.userDetails?.email}
                    </p>
                  </div>

                  {/* Profile Actions */}
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 rounded-xl text-left">
                      <UserCircle size={18} />
                      My Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-left text-red-600"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-violet-50 rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-6 py-4 space-y-2">
              <MobileNavLink to="/home">Home</MobileNavLink>
              <MobileNavLink to="/destinations">Destinations</MobileNavLink>
              <MobileNavLink to="/places-to-visit">
                Places to Visit
              </MobileNavLink>
              <MobileNavLink to="/packages">Packages</MobileNavLink>
              <MobileNavLink to="/tour">TourList</MobileNavLink>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 mt-2 bg-red-50 text-red-600 rounded-xl"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
