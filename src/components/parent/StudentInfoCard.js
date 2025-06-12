'use client';

import { useEffect, useState } from 'react';
import { FaUsers, FaBook, FaCheckCircle, FaExclamationCircle, FaGraduationCap, FaCalendarAlt, FaTrophy, FaChartLine } from 'react-icons/fa';

// Mock Loading Spinner Component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
);

// Student Info Card Component
export default function StudentInfoCard ({ student }){
  console.log('StudentInfoCard received student:', student);
  
  if (!student) {
    return (
      <div className="p-6 bg-white rounded-3xl shadow-lg">
        <p className="text-gray-600">No student data available</p>
      </div>
    );
  }

  // Validate required data
  if (!student.attendance || !student.registeredUnits || !student.assignmentResults) {
    console.error('Missing required student data:', {
      hasAttendance: Boolean(student.attendance),
      hasRegisteredUnits: Boolean(student.registeredUnits),
      hasAssignmentResults: Boolean(student.assignmentResults)
    });
    return (
      <div className="p-6 bg-white rounded-3xl shadow-lg">
        <p className="text-red-600">Invalid student data format</p>
      </div>
    );
  }

  const attendancePercentage = student.attendance.total > 0
    ? (student.attendance.attended / student.attendance.total) * 100
    : 100;

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-500';
    if (percentage >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'bg-emerald-500';
    if (grade >= 80) return 'bg-blue-500';
    if (grade >= 70) return 'bg-yellow-500';
    if (grade >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
      {/* Header with Student Info */}
      <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <img 
              src={student.photoUrl || '/api/placeholder/80/80'} 
              alt={student.name} 
              className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{student.name}</h2>
            <p className="text-sm text-gray-500 font-medium">{student.regNumber}</p>
            <div className="flex items-center gap-2 mt-2">
              <FaGraduationCap className="text-blue-600 text-sm" />
              <p className="text-sm sm:text-base font-semibold text-blue-600 truncate">
                {student.course.name} ({student.course.code})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-2xl">
            <FaBook className="text-blue-600 text-xl mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{student.registeredUnits.length}</p>
            <p className="text-xs text-gray-600">Units</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-2xl">
            <FaCalendarAlt className="text-green-600 text-xl mx-auto mb-2" />
            <p className={`text-2xl font-bold ${getAttendanceColor(attendancePercentage)}`}>
              {attendancePercentage.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-600">Attendance</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-2xl">
            <FaTrophy className="text-purple-600 text-xl mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{student.assignmentResults.length}</p>
            <p className="text-xs text-gray-600">Assignments</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-2xl">
            <FaChartLine className="text-orange-600 text-xl mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {student.assignmentResults.filter(r => r.grade >= 70).length}
            </p>
            <p className="text-xs text-gray-600">Good Grades</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registered Units */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FaBook className="text-blue-600" />
              <h3 className="font-bold text-gray-800">Registered Units</h3>
            </div>
             {student.registeredUnits.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {student.registeredUnits.map(unit => (
                <div key={unit._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{unit.name}</p>
                    <p className="text-xs text-gray-500">{unit.code}</p>
                  </div>
                </div>
              ))}
            </div>
             ) : (
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">No units registered.</p>
              </div>
             )}
          </div>

          {/* Attendance Details */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FaCalendarAlt className="text-green-600" />
              <h3 className="font-bold text-gray-800">Attendance Details</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className={`text-4xl font-bold mb-2 ${getAttendanceColor(attendancePercentage)}`}>
                  {attendancePercentage.toFixed(0)}%
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-green-700">
                      <FaCheckCircle className="text-xs" />
                      Attended
                    </span>
                    <span className="font-semibold">{student.attendance.attended}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-red-700">
                      <FaExclamationCircle className="text-xs" />
                      Missed
                    </span>
                    <span className="font-semibold">{student.attendance.missed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        attendancePercentage >= 90 ? 'bg-green-500' : 
                        attendancePercentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Grades */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FaTrophy className="text-purple-600" />
              <h3 className="font-bold text-gray-800">Recent Grades</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {student.assignmentResults.slice(0, 6).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{result.title}</p>
                    <p className="text-xs text-gray-500">Assignment #{index + 1}</p>
                  </div>
                  {result.grade !== null && result.grade !== undefined ? (
                    <div className={`px-3 py-1 rounded-lg text-white text-sm font-bold ${getGradeColor(result.grade)}`}>
                      {result.grade}%
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg text-xs">
                      Pending
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

