import React from 'react';
// Sửa đổi dòng import này:
import { HelpCircle, BookOpen, MessageSquare, Search, Mail } from 'lucide-react'; // Thêm Mail vào đây
import { Link } from 'react-router-dom'; // Import Link cho liên kết nội bộ

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative text-center py-16 px-6 sm:px-12 bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-teal-200" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-down">
            Help Center
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 animate-fade-in-up">
            Welcome to the EduSports Help Center! Find answers to common questions,
            <br className="hidden sm:inline" /> explore user guides, and get in touch with our support team.
          </p>
          {/* Optional: Search Bar for Help Center */}
          <div className="mt-8 relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for topics or questions..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {/* FAQs Section */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                Frequently Asked Questions (FAQs)
              </h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How do I register for an account?</h3>
                <p className="text-gray-700">
                  You can register for an account by clicking the "Sign Up" button in the top right corner of the screen and following the instructions.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How do I create a new tournament?</h3>
                <p className="text-gray-700">
                  If you are an Organizer or an Admin, you can create tournaments from your dashboard. Navigate to the "Tournament Management" section and look for the "Create New Tournament" button.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How can I join a team?</h3>
                <p className="text-gray-700">
                  You can join an existing team by receiving an invitation from a team captain or by searching for public teams and sending a request.
                </p>
              </div>
              {/* Add more FAQs here */}
            </div>
          </section>

          {/* User Guides Section */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                User Guides
              </h2>
            </div>
            <ul className="list-none space-y-4"> {/* Changed to list-none for custom styling */}
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">1.</span>
                <p className="text-gray-700">Guide to User Management</p>
              </li>
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">2.</span>
                <p className="text-gray-700">Guide to News and Announcements</p>
              </li>
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">3.</span>
                <p className="text-gray-700">Guide to Match Creation and Management</p>
              </li>
              <li className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-primary-600 text-xl font-bold mr-3">4.</span>
                <p className="text-gray-700">Guide to Tournament Brackets</p>
              </li>
              {/* Add more guides */}
            </ul>
          </section>

          {/* Need More Help Section */}
          <section className="text-center py-8 bg-blue-50 rounded-lg shadow-inner">
            <div className="flex items-center justify-center text-gray-800 mb-4">
              <MessageSquare className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold">Still need help?</h2>
            </div>
            <p className="text-gray-700 mb-6">
              If you can't find the answer to your question, please don't hesitate to contact us.
            </p>
            <Link to="/contact-us" className="btn-primary inline-flex items-center space-x-2 px-6 py-3 text-lg">
              <Mail className="h-5 w-5" /> {/* <-- Dòng 101, nơi 'Mail' được sử dụng */}
              <span>Contact Our Support Team</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;