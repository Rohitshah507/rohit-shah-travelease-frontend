// src/pages/Hero.jsx
import React from 'react';
import { ChevronRight, MapPin, Calendar, Users, Star } from 'lucide-react';
import Navbar from '../Components/Navbar';

const Hero = () => {
  const destinations = [
    {
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
      title: "Zhangjiajie",
      location: "Hunan, China",
      description: "Towering sandstone pillars rise through misty clouds"
    },
    {
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
      title: "Guilin Mountains",
      location: "Guangxi, China",
      description: "Karst peaks and peaceful rivers create stunning vistas"
    },
    {
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
      title: "Giant Buddha",
      location: "Leshan, China",
      description: "Majestic ancient statue carved into cliff face"
    }
  ];

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <section id="home" className="relative h-screen">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80" 
            alt="Chinese Temple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-4xl">
            <p className="text-amber-400 text-sm md:text-base mb-4 tracking-widest uppercase">Discover the Ancient Wonders</p>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              Explore the Mystical<br />Heritage of Asia
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Immerse yourself in breathtaking landscapes, ancient temples, and vibrant cultures that have captivated travelers for centuries
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center gap-2">
                Start Your Journey <ChevronRight />
              </button>
              <button className="bg-white/10 backdrop-blur-md border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition">
                Watch Video
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <ChevronRight className="text-white rotate-90" size={32} />
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-sm uppercase tracking-widest mb-2">Popular Destinations</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Must-See Places</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover the most breathtaking locations that showcase the natural beauty and cultural heritage of Asia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl mb-4 h-80">
                  <img 
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{dest.title}</h3>
                    <p className="flex items-center gap-1 text-sm">
                      <MapPin size={16} /> {dest.location}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">{dest.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section id="experiences" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80"
                alt="Night Festival"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-amber-600 text-sm uppercase tracking-widest mb-2">Cultural Experiences</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Immerse in Ancient Traditions</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Experience the vibrant festivals, traditional ceremonies, and time-honored customs that have been passed down through generations. From lantern festivals to temple celebrations, every moment is a journey into the heart of Asian culture.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="text-white" size={16} />
                  </div>
                  <span className="text-gray-700">Participate in traditional tea ceremonies and cultural workshops</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="text-white" size={16} />
                  </div>
                  <span className="text-gray-700">Witness spectacular lantern festivals and night celebrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ChevronRight className="text-white" size={16} />
                  </div>
                  <span className="text-gray-700">Connect with local communities and learn ancient crafts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
              <Calendar className="text-amber-600 mb-4" size={40} />
              <h3 className="text-xl font-bold mb-3">Flexible Tours</h3>
              <p className="text-gray-600">Customize your itinerary to match your interests and schedule</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
              <Users className="text-amber-600 mb-4" size={40} />
              <h3 className="text-xl font-bold mb-3">Expert Guides</h3>
              <p className="text-gray-600">Local experts who bring history and culture to life</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
              <Star className="text-amber-600 mb-4" size={40} />
              <h3 className="text-xl font-bold mb-3">Premium Experience</h3>
              <p className="text-gray-600">Carefully curated experiences for unforgettable memories</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;