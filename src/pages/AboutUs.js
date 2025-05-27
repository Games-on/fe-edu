import React from 'react';
import { Lightbulb, Users, Target, Rocket, Trophy } from 'lucide-react'; // Import các icon phù hợp
import { Link } from 'react-router-dom'; // Import Link

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Hero Section - Kể câu chuyện */}
        <div className="relative text-center py-20 px-6 sm:px-12 bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
          <Trophy className="h-20 w-20 mx-auto mb-6 text-yellow-300 animate-bounce-slow" />
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight animate-fade-in-down">
            About EduSports
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 max-w-2xl mx-auto animate-fade-in-up">
            Empowering the next generation of athletes and fostering a spirit of fair play through innovative tournament management.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {/* Our Story Section */}
          <section className="mb-12">
            <div className="flex items-center text-gray-800 mb-8 justify-center">
              <Lightbulb className="h-10 w-10 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold border-b-4 border-primary-500 pb-3 inline-block">
                Our Story
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="text-gray-700 leading-relaxed text-lg">
                <p className="mb-4">
                  EduSports was founded on a simple yet powerful idea: to transform how educational institutions manage their sports tournaments. We observed the challenges faced by organizers – from tedious manual scheduling to complex score tracking – and envisioned a seamless, digital solution.
                </p>
                <p className="mb-4">
                  Born from a passion for both education and sports, our platform was meticulously designed to simplify every aspect of tournament management. We believe that by streamlining operations, we can help schools and youth organizations focus more on what truly matters: nurturing talent, promoting teamwork, and celebrating achievement.
                </p>
                <p>
                  Today, EduSports stands as a testament to that vision, continually evolving to meet the dynamic needs of educational sports communities worldwide.
                </p>
              </div>
              <div className="order-first md:order-last">
                {/* Placeholder for an image */}
                <img
                  src="https://nativespeaker.vn/uploaded/page_1656_1712278968_1715676497.jpg"
                  alt="Students playing sports"
                  className="rounded-lg shadow-xl w-full h-64 object-cover md:h-auto"
                />
              </div>
            </div>
          </section>

          {/* Our Mission & Vision Section */}
          <section className="mb-12 bg-blue-50 p-8 rounded-lg shadow-lg">
            <div className="flex items-center text-gray-800 mb-8 justify-center">
              <Target className="h-10 w-10 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold border-b-4 border-primary-500 pb-3 inline-block">
                Our Mission & Vision
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center">
                  <Rocket className="h-6 w-6 text-red-500 mr-2" /> Our Mission
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To provide an intuitive, comprehensive, and reliable tournament management system that empowers educational institutions to organize, manage, and track sports competitions with unparalleled ease and efficiency. We aim to reduce administrative burdens, allowing educators and coaches to focus on the development of their students.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" /> Our Vision
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To be the leading platform for educational sports worldwide, fostering a global community where every student has the opportunity to participate, compete, and grow through organized sports. We envision a future where sports management is effortless, inclusive, and inspiring.
                </p>
              </div>
            </div>
          </section>

          {/* Our Team Section (Placeholder) */}
          <section className="mb-12">
            <div className="flex items-center text-gray-800 mb-8 justify-center">
              <Users className="h-10 w-10 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold border-b-4 border-primary-500 pb-3 inline-block">
                Meet Our Team
              </h2>
            </div>
            <p className="text-gray-700 text-center text-lg mb-8">
              Behind EduSports is a dedicated team passionate about technology and sports. While we can't introduce everyone here, we are unified by our commitment to making sports accessible and enjoyable for all.
            </p>
            {/* You might add team member cards here later */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Example Team Member Card */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3001/3001758.png" // Placeholder image
                  alt="Team Member Name"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-500"
                />
                <h3 className="text-xl font-semibold text-gray-900">Andev</h3>
                <p className="text-primary-600">Lead Developer</p>
                <p className="text-gray-600 text-sm mt-2">Crafting robust and scalable solutions.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://www.pngkey.com/png/detail/151-1518198_avatar-anonimo-mujer-women-user-icon-png.png" // Placeholder image
                  alt="Team Member Name"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-500"
                />
                <h3 className="text-xl font-semibold text-gray-900">TrangPT</h3>
                <p className="text-primary-600">Lead Developer</p>
                <p className="text-gray-600 text-sm mt-2">Crafting robust and scalable solutions.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://cdn4.iconfinder.com/data/icons/mixed-set-1-1/128/28-512.png" // Placeholder image
                  alt="Team Member Name"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-500"
                />
                <h3 className="text-xl font-semibold text-gray-900">Linh</h3>
                <p className="text-primary-600">Community Manager</p>
                <p className="text-gray-600 text-sm mt-2">Connecting with our users and partners.</p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-10 bg-green-50 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Transform Your Tournaments?</h2>
            <p className="text-gray-700 text-lg mb-6 max-w-xl mx-auto">
              Join the growing community of educational institutions leveraging EduSports for seamless, efficient, and exciting sports events.
            </p>
            <Link to="/contact-us" className="btn-primary inline-flex items-center space-x-2 px-8 py-4 text-xl">
              <Trophy className="h-6 w-6" />
              <span>Get Started Today!</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;