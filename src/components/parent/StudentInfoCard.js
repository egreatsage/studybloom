'use client';

import { useEffect, useState } from 'react';
import { FaUsers, FaBook, FaCheckCircle, FaExclamationCircle, FaGraduationCap, FaCalendarAlt, FaTrophy, FaChartLine, FaEnvelope, FaPhone, FaUser } from 'react-icons/fa';
import Link from 'next/link';

// Enhanced Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="relative">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
      <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-blue-300 opacity-20"></div>
    </div>
  </div>
);

// Enhanced Unit with Teacher Component
function UnitWithTeacher({ unit }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await fetch(`/api/units/teachers?unitIds=${unit._id}`);
        if (!response.ok) throw new Error('Failed to fetch teacher info');
        const data = await response.json();
        const teacherInfo = data[unit._id];
        setTeacher(teacherInfo ? teacherInfo.teacher : null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [unit._id]);

  return (
    <div className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      <div className="relative p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-800 truncate mb-1 group-hover:text-blue-600 transition-colors">
              {unit.name}
            </h4>
            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">
              {unit.code}
            </p>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : teacher ? (
          <div className="space-y-2 ml-6">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FaUser className="text-blue-500 flex-shrink-0" />
              <span className="font-medium truncate">{teacher.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FaEnvelope className="text-green-500 flex-shrink-0" />
              <span className="truncate">{teacher.email}</span>
            </div>
            {teacher.phoneNumber && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaPhone className="text-purple-500 flex-shrink-0" />
                <span>{teacher.phoneNumber}</span>
              </div>
            )}
            <Link 
              href={`/parent/contact-teacher?email=${encodeURIComponent(teacher.email)}&name=${encodeURIComponent(teacher.name)}&unit=${encodeURIComponent(unit.name)}`}
              className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <FaEnvelope className="text-xs" />
              Contact Teacher
            </Link>
          </div>
        ) : (
          <div className="ml-6 text-xs text-gray-400 italic">No teacher assigned</div>
        )}
      </div>
    </div>
  );
}

// Enhanced Student Info Card Component
export default function StudentInfoCard({ student }) {
  console.log('StudentInfoCard received student:', student);
  
  if (!student) {
    return (
      <div className="p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FaUser className="text-gray-400 text-xl" />
          </div>
          <p className="text-gray-600 font-medium">No student data available</p>
        </div>
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
      <div className="p-8 bg-white rounded-3xl shadow-xl border border-red-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FaExclamationCircle className="text-red-500 text-xl" />
          </div>
          <p className="text-red-600 font-medium">Invalid student data format</p>
        </div>
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

  const getAttendanceGradient = (percentage) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-400';
    if (percentage >= 80) return 'from-yellow-500 to-amber-400';
    return 'from-red-500 to-pink-400';
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'bg-gradient-to-r from-emerald-500 to-green-400';
    if (grade >= 80) return 'bg-gradient-to-r from-blue-500 to-cyan-400';
    if (grade >= 70) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    if (grade >= 60) return 'bg-gradient-to-r from-orange-500 to-red-400';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const averageGrade = student.assignmentResults.length > 0 
    ? student.assignmentResults.reduce((sum, result) => sum + (result.grade || 0), 0) / student.assignmentResults.length 
    : 0;

  return (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
      
      {/* Header with Student Info */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-sm"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl animate-pulse"></div>
              <img 
                src={student.photoUrl || '/api/placeholder/100/100'} 
                alt={student.name} 
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-white/50 shadow-2xl object-cover transform group-hover/avatar:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0 text-white">
              <h2 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {student.name}
              </h2>
              <p className="text-sm sm:text-base text-blue-100 font-mono bg-white/10 px-3 py-1 rounded-lg inline-block mb-3">
                {student.regNumber}
              </p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FaGraduationCap className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-white">
                    {student.course.name}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-100 font-mono">
                    {student.course.code}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-6 sm:p-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="group/stat text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 border border-blue-200/50">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mx-auto w-fit mb-3 group-hover/stat:animate-bounce">
              <FaBook className="text-white text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{student.registeredUnits.length}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Units</p>
          </div>
          
          <div className="group/stat text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl hover:from-green-100 hover:to-emerald-200 transition-all duration-300 transform hover:scale-105 border border-green-200/50">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mx-auto w-fit mb-3 group-hover/stat:animate-bounce">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <p className={`text-3xl font-bold mb-1 ${getAttendanceColor(attendancePercentage)}`}>
              {attendancePercentage.toFixed(0)}%
            </p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Attendance</p>
          </div>
          
          <div className="group/stat text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 border border-purple-200/50">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mx-auto w-fit mb-3 group-hover/stat:animate-bounce">
              <FaTrophy className="text-white text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{student.assignmentResults.length}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assignments</p>
          </div>
          
          <div className="group/stat text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 transform hover:scale-105 border border-orange-200/50">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mx-auto w-fit mb-3 group-hover/stat:animate-bounce">
              <FaChartLine className="text-white text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {averageGrade.toFixed(0)}%
            </p>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg Grade</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Enhanced Registered Units */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <FaBook className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Registered Units</h3>
            </div>
            {student.registeredUnits.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {student.registeredUnits.map(unit => (
                  <UnitWithTeacher key={unit._id} unit={unit} />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-2xl text-center border-2 border-dashed border-gray-200">
                <FaBook className="text-gray-300 text-2xl mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No units registered</p>
              </div>
            )}
          </div>

          {/* Enhanced Attendance Details */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Attendance Details</h3>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 border border-green-200">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-emerald-100/50 animate-pulse"></div>
              <div className="relative">
                <div className={`text-5xl font-bold mb-4 ${getAttendanceColor(attendancePercentage)} drop-shadow-sm`}>
                  {attendancePercentage.toFixed(0)}%
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl backdrop-blur-sm">
                    <span className="flex items-center gap-3 text-green-700 font-medium">
                      <div className="p-1 bg-green-500 rounded-full">
                        <FaCheckCircle className="text-white text-xs" />
                      </div>
                      Attended
                    </span>
                    <span className="text-xl font-bold text-green-600">{student.attendance.attended}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl backdrop-blur-sm">
                    <span className="flex items-center gap-3 text-red-700 font-medium">
                      <div className="p-1 bg-red-500 rounded-full">
                        <FaExclamationCircle className="text-white text-xs" />
                      </div>
                      Missed
                    </span>
                    <span className="text-xl font-bold text-red-600">{student.attendance.missed}</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${getAttendanceGradient(attendancePercentage)} shadow-lg`}
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Grades */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <FaTrophy className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Recent Assignments</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {student.assignmentResults.slice(0, 8).map((result, index) => (
                <div key={index} className="group/grade relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 opacity-0 group-hover/grade:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="relative flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="text-sm font-bold text-gray-800 truncate mb-1 group-hover/grade:text-purple-600 transition-colors">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">
                        Assignment #{index + 1}
                      </p>
                    </div>
                    {result.grade !== null && result.grade !== undefined ? (
                      <div className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg transform hover:scale-105 transition-transform duration-200 ${getGradeColor(result.grade)}`}>
                        {result.grade}%
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-xl text-sm font-medium animate-pulse">
                        Pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
}