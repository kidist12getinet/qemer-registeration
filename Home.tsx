// src/components/LandingPage.tsx
import React, { useState } from 'react';
import Login from './Login'; // Login component
import Courses from './Courses'; // Courses component
import Signup from './Signup'; // Signup component

const LandingPage: React.FC = () => {
  const [activePage, setActivePage] = useState<string>(''); // Track which page to display

  const handlePageChange = (page: string) => {
    setActivePage(page); // Set the active page when a button is clicked
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Welcome to Our Platform</h1>

        {/* Navigation buttons */}
        <div className="flex justify-center space-x-6 mb-6">
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handlePageChange('login')}
          >
            Login
          </button>
          <button
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => handlePageChange('courses')}
          >
            Courses
          </button>
          <button
            className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            onClick={() => handlePageChange('signup')}
          >
            Signup
          </button>
        </div>

        {/* Conditional rendering based on active page */}
        <div className="mt-6">
          {activePage === 'login' && <Login />}
          {activePage === 'courses' && <Courses />}
          {activePage === 'signup' && <Signup />}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
