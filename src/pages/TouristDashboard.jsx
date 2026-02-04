import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronRight,
  Users,
  Award,
  Globe
} from "lucide-react";

const TouristDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg text-black' : 'bg-transparent text-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-4xl font-bold text-amber-700 shadow-2xl">TravelEase</div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center font-bold space-x-8">
            <a href="#home" className="hover:text-amber-700 transition ">Home</a>
            <a href="#about" className=" hover:text-amber-700 transition ">Destinations</a>
            <a href="#places" className=" hover:text-amber-700 transition ">Places to Visit</a>
            <a href="#packages" className=" hover:text-amber-700 transition ">Packages</a>
            <a href="#contact" className=" hover:text-amber-700 transition ">TourList</a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-6 py-4 space-y-4">
              <a href="#home" className="block text-gray-700 hover:text-amber-700">Home</a>
              <a href="#about" className="block text-gray-700 hover:text-amber-700">About Bhutan</a>
              <a href="#places" className="block text-gray-700 hover:text-amber-700">Places to Visit</a>
              <a href="#packages" className="block text-gray-700 hover:text-amber-700">Packages</a>
              <a href="#contact" className="block text-gray-700 hover:text-amber-700">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1545652985-5edd365b12eb?w=1920&q=80" 
          alt="Bhutan Temple" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">We're Nepal's</h1>
          <h2 className="text-4xl md:text-6xl font-light mb-6">Foremost Luxury Travel</h2>
          <p className="text-2xl md:text-4xl mb-8">Designer and Outfitter</p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full text-lg transition-all transform hover:scale-105">
            Explore Now
          </button>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ChevronRight className="rotate-90" size={32} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80" 
              alt="Buddha Statue" 
              className="rounded-lg shadow-2xl"
            />
          </div>
          <div>
            <h3 className="text-amber-700 text-sm uppercase tracking-wider mb-2">Welcome</h3>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">The Kingdom We Call Home</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Nestled in the eastern Himalayas, Nepal is a land of stunning natural beauty, rich cultural heritage, 
              and deep spiritual traditions. This mystical kingdom offers 
              travelers an unparalleled experience of pristine landscapes, ancient monasteries, and warm hospitality.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our mission is to share the magic of Nepal with the world while preserving its unique culture and 
              environment. We believe in sustainable tourism that benefits local communities and protects our precious heritage.
            </p>
            <button className="border-2 border-amber-700 text-amber-700 px-6 py-2 rounded-full hover:bg-amber-700 hover:text-white transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gray-50 py-16 px-6 shadow-lg max-width-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2  md:grid-cols-4 gap-8 text-center m-4">
          <div className="shadow-lg p-8 ">
            <div className="text-5xl font-bold text-amber-700 mb-2 ">5,500</div>
            <div className="text-gray-600">Happy Travelers</div>
          </div>
          <div className="shadow-lg p-8">
            <div className="text-5xl font-bold text-amber-700 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="shadow-lg p-8">
            <div className="text-5xl font-bold text-amber-700 mb-2">16</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="shadow-lg p-8">
            <div className="text-5xl font-bold text-amber-700 mb-2">27</div>
            <div className="text-gray-600">Tour Packages</div>
          </div>
        </div>
      </section>

      {/* Places to Visit */}
      <section id="places" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-amber-700 text-sm uppercase tracking-wider mb-2">Experiences</h3>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Places To Visit</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the hidden gems and iconic landmarks that make Bhutan a truly magical destination
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="relative group overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1585068628604-b4245e5a3c8e?w=1200&q=80" 
                alt="Tiger's Nest" 
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Paro Taktsang</h3>
                  <p className="text-sm mb-3">The Tiger's Nest Monastery</p>
                  <button className="border border-white px-4 py-1 rounded-full text-sm hover:bg-white hover:text-gray-800 transition">
                    Discover
                  </button>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80" 
                alt="Punakha Dzong" 
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Punakha Dzong</h3>
                  <p className="text-sm mb-3">The Palace of Great Happiness</p>
                  <button className="border border-white px-4 py-1 rounded-full text-sm hover:bg-white hover:text-gray-800 transition">
                    Discover
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1591274983295-5e5d5ce2c137?w=1200&q=80" 
                alt="Buddha Dordenma" 
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Buddha Dordenma</h3>
                  <p className="text-sm mb-3">Giant Buddha Statue in Thimphu</p>
                  <button className="border border-white px-4 py-1 rounded-full text-sm hover:bg-white hover:text-gray-800 transition">
                    Discover
                  </button>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80" 
                alt="Dochula Pass" 
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Dochula Pass</h3>
                  <p className="text-sm mb-3">108 Memorial Chortens</p>
                  <button className="border border-white px-4 py-1 rounded-full text-sm hover:bg-white hover:text-gray-800 transition">
                    Discover
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Experience Section */}
      <section className="py-20 px-6 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=80" 
            alt="Cultural Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h3 className="text-amber-500 text-sm uppercase tracking-wider mb-2">Immerse</h3>
          <h2 className="text-4xl font-bold mb-6">Experience Bhutanese Culture & Festivals</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Witness ancient traditions come alive through vibrant festivals, sacred masked dances, and spiritual ceremonies. 
            Participate in traditional archery, explore local markets, and connect with the warm-hearted Bhutanese people.
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full transition">
            View Festival Calendar
          </button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-amber-700 text-sm uppercase tracking-wider mb-2">Why Us</h3>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">We Do More Than Travel</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 hover:shadow-xl transition-shadow rounded-lg">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-amber-700" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Expert Local Guides</h3>
              <p className="text-gray-600">
                Our experienced guides are passionate storytellers who bring Bhutan's history and culture to life.
              </p>
            </div>

            <div className="text-center p-6 hover:shadow-xl transition-shadow rounded-lg">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-amber-700" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Authentic Experiences</h3>
              <p className="text-gray-600">
                We create genuine connections with local communities and offer unique cultural immersion.
              </p>
            </div>

            <div className="text-center p-6 hover:shadow-xl transition-shadow rounded-lg">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-amber-700" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Sustainable Tourism</h3>
              <p className="text-gray-600">
                We're committed to preserving Bhutan's environment and supporting local communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Packages */}
      <section id="packages" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-amber-700 text-sm uppercase tracking-wider mb-2">Our Offerings</h3>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Curated Tour Packages</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80" 
                alt="Cultural Tour" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Cultural Heritage Tour</h3>
                <p className="text-gray-600 mb-4">7 Days / 6 Nights</p>
                <p className="text-gray-600 mb-4 text-sm">
                  Explore ancient dzongs, monasteries, and immerse yourself in Bhutanese traditions.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-700">$1,850</span>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm transition">
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" 
                alt="Trekking Tour" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Himalayan Trekking</h3>
                <p className="text-gray-600 mb-4">10 Days / 9 Nights</p>
                <p className="text-gray-600 mb-4 text-sm">
                  Trek through pristine valleys, high-altitude passes, and breathtaking mountain scenery.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-700">$2,450</span>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm transition">
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1611416517780-eff3a13b0359?w=600&q=80" 
                alt="Festival Tour" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Festival Experience</h3>
                <p className="text-gray-600 mb-4">5 Days / 4 Nights</p>
                <p className="text-gray-600 mb-4 text-sm">
                  Witness vibrant masked dances and sacred rituals during Bhutan's colorful festivals.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-700">$1,650</span>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm transition">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-amber-500 text-sm uppercase tracking-wider mb-2">Testimonials</h3>
            <h2 className="text-4xl font-bold mb-4">What Our Travelers Say</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" 
                  alt="Sarah" 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-400">United States</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "An absolutely life-changing experience! The attention to detail, cultural immersion, and stunning landscapes exceeded all expectations. Our guide was knowledgeable and made every moment special."
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" 
                  alt="David" 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold">David Chen</h4>
                  <p className="text-sm text-gray-400">Singapore</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "Bhutan is a hidden paradise and this tour company made it accessible and unforgettable. From the monasteries to the festivals, every experience was authentic and deeply moving."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-amber-700 text-sm uppercase tracking-wider mb-2">Get In Touch</h3>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Start Your Journey</h2>
            <p className="text-gray-600">Ready to explore the Land of the Thunder Dragon? Contact us today!</p>
          </div>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
              <input 
                type="email" 
                placeholder="Your Email" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
            <input 
              type="text" 
              placeholder="Subject" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
            />
            <textarea 
              placeholder="Your Message" 
              rows="6" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
            ></textarea>
            <div className="text-center">
              <button 
                type="submit" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-3 rounded-full text-lg transition-all transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-amber-500 mb-4">Bhutan</h3>
            <p className="text-gray-400 text-sm">
              Your gateway to the magical kingdom of Bhutan. Sustainable tourism, authentic experiences.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#home" className="hover:text-amber-500 transition">Home</a></li>
              <li><a href="#about" className="hover:text-amber-500 transition">About</a></li>
              <li><a href="#places" className="hover:text-amber-500 transition">Places</a></li>
              <li><a href="#packages" className="hover:text-amber-500 transition">Packages</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Thimphu, Bhutan</li>
              <li>+975 2 123 456</li>
              <li>info@bhutantravel.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition">
                <span className="text-sm">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition">
                <span className="text-sm">t</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition">
                <span className="text-sm">in</span>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; 2026 Bhutan Travel. All rights reserved. Designed with ❤️ for travelers.</p>
        </div>
      </footer>
    </div>
  );
};

export default TouristDashboard;