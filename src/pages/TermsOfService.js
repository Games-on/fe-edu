import React from 'react';
import { FileText, UserCheck, Shield, ClipboardList, Info } from 'lucide-react'; // Import các icon phù hợp
import { Link } from 'react-router-dom'; // Import Link

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative text-center py-16 px-6 sm:px-12 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <FileText className="h-16 w-16 mx-auto mb-4 text-orange-200" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-down">
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl font-light opacity-90 animate-fade-in-up">
            By using EduSports, you agree to these terms.
            <br className="hidden sm:inline" /> Please read them carefully.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {/* Introduction */}
          <section className="mb-10 text-gray-700 leading-relaxed">
            <p className="mb-4">
              Welcome to EduSports! These Terms of Service ("Terms") govern your use of our website, applications, and related services (collectively, the "Service").
            </p>
            <p>
              Please read these Terms carefully before using our Service. By accessing or using the Service, you agree to be bound by these Terms and our <Link to="/privacy-policy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>. If you do not agree to any part of the terms, you may not access the Service.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <UserCheck className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                1. Acceptance of Terms
              </h2>
            </div>
            <p className="text-gray-700 bg-gray-100 p-6 rounded-lg shadow-sm">
              By accessing or using our Service, you confirm your agreement to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you are not permitted to use our Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          {/* 2. User Accounts */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <ClipboardList className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                2. User Accounts
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">
                  You must be at least 13 years old to use this Service. If you are under 18, you must have parental or guardian permission to use the Service.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">
                  You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device, and you agree to accept responsibility for all activities that occur under your account or password.
                </p>
              </li>
              <li className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <p className="text-gray-700">
                  You agree to provide accurate, complete, and current information when registering for an account and to update your information as necessary to keep it accurate.
                </p>
              </li>
            </ul>
          </section>

          {/* 3. Intellectual Property Rights */}
          <section className="mb-10">
            <div className="flex items-center text-gray-800 mb-6">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                3. Intellectual Property Rights
              </h2>
            </div>
            <p className="text-gray-700 bg-gray-100 p-6 rounded-lg shadow-sm">
              All content, features, and functionality of the Service (including but not limited to all information, software, text, displays, images, video and audio, and the design, selection, and arrangement thereof) are owned by EduSports, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p className="text-gray-700 mt-4">
              You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use only.
            </p>
          </section>

          {/* 4. Limitation of Liability */}
          <section className="text-gray-700">
            <div className="flex items-center text-gray-800 mb-6">
              <Info className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold border-b-2 border-primary-500 pb-2">
                4. Limitation of Liability
              </h2>
            </div>
            <p className="mb-4 bg-gray-100 p-6 rounded-lg shadow-sm">
              In no event shall EduSports, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;