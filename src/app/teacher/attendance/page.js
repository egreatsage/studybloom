'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import useTeachingStore from '@/lib/stores/teachingStore';
import AttendanceDetailsTable from '@/components/teacher/AttendanceDetailsTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import AttendanceReport from '@/components/teacher/AttendanceReport';
import { FaPrint, FaFilter, FaCalendarAlt, FaBookOpen, FaGraduationCap } from 'react-icons/fa';

export default function TeacherAttendancePage() {
  const { data: session } = useSession();
  const { assignments: teachingAssignments, fetchTeacherCourses } = useTeachingStore();
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Report states
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Fetch teacher's courses and units
  useEffect(() => {
    if (session?.user?.id) {
      fetchTeacherCourses(session.user.id);
    }
  }, [session, fetchTeacherCourses]);

  const uniqueCourses = useMemo(() => {
    if (!teachingAssignments) return [];
    const courseMap = new Map();
    teachingAssignments.forEach(assignment => {
      if (assignment.course && !courseMap.has(assignment.course._id)) {
        courseMap.set(assignment.course._id, assignment.course);
      }
    });
    return Array.from(courseMap.values());
  }, [teachingAssignments]);

  const unitsForSelectedCourse = useMemo(() => {
    if (!selectedCourse) return [];
    const relatedAssignments = teachingAssignments.filter(a => a.course?._id === selectedCourse);
    const units = new Map();
    relatedAssignments.forEach(assignment => {
      assignment.units.forEach(unitInfo => {
        if (unitInfo.unit && !units.has(unitInfo.unit._id)) {
          units.set(unitInfo.unit._id, unitInfo.unit);
        }
      });
    });
    return Array.from(units.values());
  }, [selectedCourse, teachingAssignments]);

  // Fetch attendance records based on filters
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedUnit) params.append('unitId', selectedUnit);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      try {
        const response = await fetch(`/api/teachers/attendance?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch attendance data');
        const data = await response.json();
        setAttendanceRecords(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedUnit || dateRange.start || dateRange.end) {
        fetchAttendance();
    } else {
        setAttendanceRecords([]);
        setLoading(false);
    }
  }, [selectedUnit, dateRange]);

  const handleGenerateReport = async () => {
    if (!selectedUnit || !dateRange.start || !dateRange.end) {
        alert("Please select a course, unit, and date range for the report.");
        return;
    }
    setGeneratingReport(true);
    try {
        const response = await fetch(`/api/teachers/attendance-report?unitId=${selectedUnit}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
        if (!response.ok) throw new Error('Failed to generate report');
        const data = await response.json();
        setReportData(data.reportData);
        setShowReport(true);
    } catch (error) {
        console.error(error.message);
    } finally {
        setGeneratingReport(false);
    }
  };

  const isReportDisabled = !selectedUnit || !dateRange.start || !dateRange.end;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showReport && (
        <AttendanceReport
            reportData={reportData}
            teacherName={session.user.name}
            dateRange={dateRange}
            onClose={() => setShowReport(false)}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <FaGraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Attendance Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Track and generate detailed attendance reports
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Report Generation Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6 sm:p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <FaFilter className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Filter & Generate Report</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {/* Course Selection */}
            <div className="space-y-2">
              <label htmlFor="course-select" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaBookOpen className="w-3 h-3 text-blue-500" />
                Course
              </label>
              <select 
                id="course-select" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                value={selectedCourse} 
                onChange={e => {setSelectedCourse(e.target.value); setSelectedUnit('');}}
              >
                <option value="">Select Course</option>
                {uniqueCourses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>

            {/* Unit Selection */}
            <div className="space-y-2">
              <label htmlFor="unit-select" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaGraduationCap className="w-3 h-3 text-indigo-500" />
                Unit
              </label>
              <select 
                id="unit-select" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed"
                value={selectedUnit} 
                onChange={e => setSelectedUnit(e.target.value)} 
                disabled={!selectedCourse}
              >
                <option value="">Select Unit</option>
                {unitsForSelectedCourse.map(unit => (
                  <option key={unit._id} value={unit._id}>{unit.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range - Start */}
            <div className="space-y-2">
              <label htmlFor="report-start" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaCalendarAlt className="w-3 h-3 text-green-500" />
                Start Date
              </label>
              <input 
                type="date" 
                id="report-start" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                value={dateRange.start} 
                onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
            </div>

            {/* Date Range - End */}
            <div className="space-y-2">
              <label htmlFor="report-end" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaCalendarAlt className="w-3 h-3 text-red-500" />
                End Date
              </label>
              <input 
                type="date" 
                id="report-end" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                value={dateRange.end} 
                onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
            </div>

            {/* Generate Report Button */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-transparent">Action</label>
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport || isReportDisabled}
                className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isReportDisabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : generatingReport 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                }`}
              >
                {generatingReport ? (
                  <>
                    <LoadingSpinner size="sm"/>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FaPrint className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status indicator */}
          {(selectedCourse || selectedUnit || dateRange.start || dateRange.end) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>
                  {attendanceRecords.length > 0 
                    ? `Showing ${attendanceRecords.length} attendance record${attendanceRecords.length !== 1 ? 's' : ''}` 
                    : 'Apply filters to view attendance records'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Attendance Table Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              Attendance Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <AttendanceDetailsTable 
              attendanceRecords={attendanceRecords} 
              loading={loading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}