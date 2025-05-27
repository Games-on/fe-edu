import React from 'react';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="relative">
          {/* Background image or gradient for the title section */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-700 opacity-90"></div>
          <div className="relative text-center py-16 px-6 sm:px-12 text-white">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-down">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl font-light opacity-90 animate-fade-in-up">
              We are always happy to hear from you.
              <br className="hidden sm:inline" /> Please use the information below to connect with the EduSports team.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Information Column */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-primary-500 pb-2 inline-block">
                Basic Information
              </h2>
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-700">123 Sports Road, Arena District,</p>
                  <p className="text-gray-700">Sports City, Vietnam</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Phone</h3>
                  <p className="text-gray-700">(024) 1234 5678</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Email</h3>
                  <a href="mailto:support@edusports.com" className="text-primary-600 hover:underline">
                    cskh@edusports.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Working Hours</h3>
                  <p className="text-gray-700">Monday - Friday: 8:00 AM - 5:00 PM (GMT+7)</p>
                  <p className="text-gray-700">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Map or illustrative image column */}
            <div className="flex flex-col justify-center items-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-primary-500 pb-2 inline-block">
                Find Us
              </h2>
              {/* This is where you can embed a Google Maps iframe or an image of a map */}
              <div className="bg-gray-200 w-full h-64 rounded-lg shadow-inner flex items-center justify-center text-gray-600 text-center text-sm">
                {/* Example Google Maps iframe (replace with your actual URL) */}
                <iframe
                  title="Google Maps Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924403378393!2d105.81708461490267!3d21.035650192734493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab7801a2e7c9%3A0xc3b8a36c53e8e1f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBCw6FjaCBraG9hIEjDoCBO4buZaQ!5e0!3m2!1svi!2svn!4v1684348000000!5m2!1svi!2svn"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                {/* Or just a placeholder image: <img src="path/to/your/map.png" alt="Our Location" className="w-full h-full object-cover rounded-lg" /> */}
              </div>
              <p className="mt-4 text-gray-600 text-center">
                We look forward to seeing you at our location.
              </p>
            </div>
          </div>

          {/* Social Media Section (optional) */}
          <div className="mt-12 text-center border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect With Us</h2>
            <div className="flex justify-center space-x-6 text-primary-600">
              <a href="/home" target="_blank" rel="noopener noreferrer" className="hover:text-primary-800 transition-colors">
                <Facebook className="h-8 w-8" />
              </a>
              <a href="/home" target="_blank" rel="noopener noreferrer" className="hover:text-primary-800 transition-colors">
                <Twitter className="h-8 w-8" />
              </a>
              <a href="/home" target="_blank" rel="noopener noreferrer" className="hover:text-primary-800 transition-colors">
                <Linkedin className="h-8 w-8" />
              </a>
              <a href="/home" target="_blank" rel="noopener noreferrer" className="hover:text-primary-800 transition-colors">
                <Instagram className="h-8 w-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;