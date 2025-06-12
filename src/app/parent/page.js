'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StudentInfoCard from '@/components/parent/StudentInfoCard';
import { FaExclamationCircle, FaUsers } from 'react-icons/fa';

export default function ParentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data for demonstration
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/parent/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Data structure:', {
          hasChildrenData: Boolean(data?.childrenData),
          childrenCount: data?.childrenData?.length,
          firstChild: data?.childrenData?.[0]
        });
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-red-500 text-xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <FaUsers className="text-3xl text-white"/>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            My Children's Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stay connected with your children's academic journey. Monitor their progress, attendance, and achievements all in one place.
          </p>
        </div>

        {/* Dashboard Content */}
        {dashboardData?.childrenData?.length > 0 ? (
          <div className="space-y-8">
            {dashboardData.childrenData.map(child => (
              <StudentInfoCard key={child._id} student={child} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-3xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUsers className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Students Found</h3>
            <p className="text-gray-600 mb-2">No students are currently linked to your account.</p>
            <p className="text-sm text-gray-500">
              Please contact the school administration to link your children's profiles.
            </p>
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Contact Administration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}