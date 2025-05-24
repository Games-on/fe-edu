import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ProfilePage = () => {
  const { user } = useAuth();

  const profileSections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', value: user?.name || 'Not provided', icon: User },
        { label: 'Email Address', value: user?.email || 'Not provided', icon: Mail },
        { label: 'Role', value: user?.role || 'USER', icon: Shield },
        { label: 'Member Since', value: formatDate(user?.createdAt) || 'Unknown', icon: Calendar },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-lg text-gray-600">
            Manage your account information and preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="card mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-sports-purple rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user?.role === 'ORGANIZER' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user?.role || 'USER'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        {profileSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="card mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{section.title}</h3>
            <div className="space-y-6">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <field.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="text-gray-900 font-medium">
                      {field.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>
          <div className="space-y-4">
            <button className="w-full md:w-auto btn-primary">
              Edit Profile
            </button>
            <button className="w-full md:w-auto btn-secondary ml-0 md:ml-3 mt-3 md:mt-0">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;