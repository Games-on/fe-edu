import React from 'react';
import { Shield } from 'lucide-react';

const SimpleAdminTest = () => {
  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-4">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Admin Panel Test</h1>
      </div>
      <p className="text-gray-600">
        If you can see this, the admin panel is working!
      </p>
      <div className="mt-4 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">✅ Admin components loaded successfully</p>
      </div>
    </div>
  );
};

export default SimpleAdminTest;