// src/Components/Footer.jsx
import React from 'react';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 from-gray-900 to-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold">TravelEase</span>
            </div>
            <p className="text-gray-400 mb-6">
              Discover the magic of Asia with expertly curated travel experiences that create memories for a lifetime.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-600 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-600 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-600 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-600 transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Destinations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Tour Packages</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Testimonials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-600 transition">Booking Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to get special offers and travel inspiration</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Your email address"
                className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600"
              />
              <button className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2026 TravelEase. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-amber-600 transition">Terms</a>
              <a href="#" className="text-gray-400 hover:text-amber-600 transition">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-amber-600 transition">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;