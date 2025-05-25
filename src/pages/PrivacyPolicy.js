import React from 'react';
import { ShieldCheck, Info, User, Share2, Award } from 'lucide-react'; // Thêm các icon phù hợp
import { Link } from 'react-router-dom'; // <-- THÊM DÒNG NÀY ĐỂ IMPORT LINK

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative text-center py-16 px-6 sm:px-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-blue-200" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-down">
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 animate-fade-in-up">
            Your privacy is paramount. This policy outlines how EduSports collects,
            <br className="hidden sm:inline" /> uses, and protects your personal information.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {/* Introduction */}
          <section className="mb-10 text-gray-700 leading-relaxed">
            <p className="mb-4">
              This Privacy Policy describes how EduSports ("we," "us," or "our") collects, uses, and discloses your personal information when you use our services, including our website and applications. By accessing or using our services, you agree to the terms of this Privacy Policy.
            </p>
            <p>
              We are committed to protecting your privacy and handling your data in an open and transparent manner.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Info className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                1. Information We Collect
              </h2>
            </div>
            <p className="text-gray-700 mb-4">We collect various types of information to provide and improve our services:</p>
            <ul className="space-y-4">
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="h-5 w-5 text-purple-600 mr-2" /> Personal Information
                </h3>
                <p className="text-gray-700">
                  This includes information you provide directly to us, such as your name, email address, phone number, date of birth, and other identifying details when you register an account, participate in tournaments, or communicate with us.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="h-5 w-5 text-purple-600 mr-2" /> Usage Data
                </h3>
                <p className="text-gray-700">
                  Information about how you access and use our website and applications. This may include your Internet Protocol (IP) address, browser type, pages viewed, time spent on pages, and other diagnostic data.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <Share2 className="h-5 w-5 text-purple-600 mr-2" /> Information from Third Parties
                </h3>
                <p className="text-gray-700">
                  We may receive information about you from our partners or from publicly available sources to enhance our services.
                </p>
              </li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Info className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                2. How We Use Your Information
              </h2>
            </div>
            <p className="text-gray-700 mb-4">We use the collected information for various purposes:</p>
            <ul className="space-y-4">
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">To provide and maintain our services.</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">To improve user experience and personalize content.</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">To analyze how our services are used to develop new features.</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">To send you notifications, updates, and marketing communications (with your consent).</p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">To fulfill legal obligations and protect our rights.</p>
              </li>
            </ul>
          </section>

          {/* 3. Sharing Your Information */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Share2 className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                3. Sharing Your Information
              </h2>
            </div>
            <p className="text-gray-700 bg-gray-100 p-6 rounded-lg shadow-sm">
              We do not sell, trade, or rent your personal information to third parties, except with your consent or when required by law. We may share information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving our users, provided that those parties agree to keep this information confidential.
            </p>
          </section>

          {/* 4. Your Rights */}
          <section className="text-gray-700">
            <div className="flex items-center text-gray-800 mb-6">
              <User className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                4. Your Rights
              </h2>
            </div>
            <p className="mb-4 bg-gray-100 p-6 rounded-lg shadow-sm">
              You have the right to access, correct, delete, or object to the processing of your personal information. To exercise these rights, please contact us through our <Link to="/contact-us" className="text-primary-600 hover:underline font-medium">Contact Us</Link> page. We will respond to your request in accordance with applicable data protection laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;