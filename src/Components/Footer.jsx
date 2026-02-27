import React from "react";

const Footer = () => {
  return (
    <footer className="bg-purple-950 text-purple-200 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        <div>
          <h3 className="font-display text-2xl text-white font-bold mb-4">
            TravelEase
          </h3>
          <p className="text-sm text-purple-300">
            Luxury travel experiences crafted for dreamers worldwide.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>About</li>
            <li>Careers</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>Help Center</li>
            <li>Terms</li>
            <li>Privacy</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <p>support@travelease.com</p>
          <p className="mt-2">+977 98-123-4567</p>
        </div>
      </div>

      <div className="text-center text-xs text-purple-400 mt-12">
        © 2026 TravelEase. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;