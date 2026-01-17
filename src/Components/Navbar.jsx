// src/Components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>TravelAsia</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className={`hover:text-amber-600 transition ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Home</a>
            <a href="#destinations" className={`hover:text-amber-600 transition ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Destinations</a>
            <a href="#experiences" className={`hover:text-amber-600 transition ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Experiences</a>
            <a href="#about" className={`hover:text-amber-600 transition ${isScrolled ? 'text-gray-700' : 'text-white'}`}>About</a>
            <a href="#contact" className={`hover:text-amber-600 transition ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Contact</a>
          </div>

          <div className="hidden md:block">
            <button className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-2 rounded-full hover:shadow-lg transition">
              Book Now
            </button>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="text-white" /> : <Menu className={isScrolled ? 'text-gray-900' : 'text-white'} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="#home" className="block text-white hover:text-amber-300">Home</a>
            <a href="#destinations" className="block text-white hover:text-amber-300">Destinations</a>
            <a href="#experiences" className="block text-white hover:text-amber-300">Experiences</a>
            <a href="#about" className="block text-white hover:text-amber-300">About</a>
            <a href="#contact" className="block text-white hover:text-amber-300">Contact</a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;