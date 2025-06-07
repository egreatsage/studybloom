'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import WeeklyTimetable from '@/components/timetable/WeeklyTimetable';
import CalendarView from '@/components/timetable/CalendarView';
import LectureCard from '@/components/timetable/LectureCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AttendanceManager from '@/components/teacher/AttendanceManager';
import AttendanceReport from '@/components/teacher/AttendanceReport'; // Import the new component
import { FaCalendarAlt, FaList, FaDownload, FaFilter, FaRegCalendarCheck, FaPrint } from 'react-icons/fa';

export default function TeacherSchedule() {
  const { data: session } = useSession();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('week'); // week, calendar, list
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [managingAttendance, setManagingAttendance] = useState(null); 
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });
  const [filter, setFilter] = useState({
    semester: 'all',
    course: 'all',
    unit: 'all'
  });

  const findOrCreateLectureInstance = async (lecture) => {
      const today = new Date();
      // Find the next upcoming date for this lecture's day of the week
      const dayOfWeek = lecture.dayOfWeek;
      const resultDate = new Date(today);
      resultDate.setDate(today.getDate() + (dayOfWeek + (7 - today.getDay())) % 7);

      const dateString = resultDate.toISOString().split('T')[0];

      const response = await fetch(`/api/lecture-instances?lectureId=${lecture._id}&date=${dateString}`);
      let instances = await response.json();

      if (instances.length > 0) {
          return instances[0];
      } else {
          const createResponse = await fetch('/api/lecture-instances', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  lectureId: lecture._id,
                  date: resultDate
              }),
          });
          return await createResponse.json();
      }
  };

  const handleManageAttendance = async (lecture) => {
      const instance = await findOrCreateLectureInstance(lecture);
      if(instance) {
        setManagingAttendance({ lecture, instance });
        setSelectedLecture(null);
      }
  };

  const handleGenerateReport = async () => {
    if (!reportDateRange.start || !reportDateRange.end) {
        alert("Please select a start and end date for the report.");
        return;
    }
    setLoading(true);
    try {
        const response = await fetch(`/api/teachers/attendance-report?startDate=${reportDateRange.start}&endDate=${reportDateRange.end}`);
        if (!response.ok) {
            throw new Error('Failed to generate report');
        }
        const data = await response.json();
        setReportData(data.reportData);
        setShowReport(true);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeacherSchedule();
    }
  }, [session]);

  const fetchTeacherSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lectures?teacherId=${session.user.id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }

      const data = await response.json();
      setLectures(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (keep existing functions like handleExportSchedule, filteredLectures, unique items)
  const handleExportSchedule = async (format = 'ical') => {
    // implementation from previous step
  };

  const filteredLectures = lectures.filter(lecture => {
    // implementation from previous step
    if (filter.semester !== 'all' && lecture.timetable?.semester?._id !== filter.semester) return false;
    if (filter.course !== 'all' && lecture.timetable?.course?._id !== filter.course) return false;
    if (filter.unit !== 'all' && lecture.unit._id !== filter.unit) return false;
    return true;
  });

  const uniqueSemesters = [...new Set(lectures.map(l => l.timetable?.semester?._id))].filter(Boolean);
  const uniqueCourses = [...new Set(lectures.map(l => l.timetable?.course?._id))].filter(Boolean);
  const uniqueUnits = [...new Set(lectures.map(l => l.unit._id))];


  if (loading && !showReport) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {managingAttendance && (
          <AttendanceManager 
              lecture={managingAttendance.lecture}
              lectureInstance={managingAttendance.instance}
              onClose={() => setManagingAttendance(null)}
          />
      )}
      {showReport && (
          <AttendanceReport
              reportData={reportData}
              teacherName={session.user.name}
              dateRange={reportDateRange}
              onClose={() => setShowReport(false)}
          />
      )}
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Teaching Schedule</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportSchedule('ical')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaDownload /> Export to Calendar
            </button>
          </div>
        </div>
        {/* View Switcher and Filters */}
        {/* ... (code from previous step) ... */}

        {/* Report Generation UI */}
        <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-gray-700 mb-2">Generate Attendance Report</h3>
            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <label htmlFor="report-start" className="text-sm text-gray-600 block">Start Date</label>
                    <input type="date" id="report-start" className="px-3 py-1 border rounded" value={reportDateRange.start} onChange={e => setReportDateRange(prev => ({...prev, start: e.target.value}))}/>
                </div>
                <div>
                    <label htmlFor="report-end" className="text-sm text-gray-600 block">End Date</label>
                    <input type="date" id="report-end" className="px-3 py-1 border rounded" value={reportDateRange.end} onChange={e => setReportDateRange(prev => ({...prev, end: e.target.value}))}/>
                </div>
                <button
                    onClick={handleGenerateReport}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                    <FaPrint /> Generate Report
                </button>
            </div>
        </div>
      </div>

      {/* Schedule Display */}
      {/* ... (rest of the component JSX from previous step) ... */}
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {view === 'week' && (
            <WeeklyTimetable
              lectures={filteredLectures}
              onLectureClick={setSelectedLecture}
            />
          )}

          {view === 'calendar' && (
            <CalendarView
              lectures={filteredLectures}
              onLectureClick={setSelectedLecture}
            />
          )}

          {view === 'list' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">All Lectures</h2>
                <div className="space-y-4">
                  {filteredLectures.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No lectures found</p>
                  ) : (
                    filteredLectures.map(lecture => (
                      <LectureCard
                        key={lecture._id}
                        lecture={lecture}
                        onClick={setSelectedLecture}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
       {/* Lecture Details Modal */}
       {selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Lecture Details</h2>
              <button
                onClick={() => setSelectedLecture(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <LectureCard lecture={selectedLecture} showDetails={true} />
            
            <div className="mt-6 space-y-4">
              {/* ... (modal content from previous step) ... */}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleManageAttendance(selectedLecture)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaRegCalendarCheck /> Manage Attendance
                </button>
                <button
                  onClick={() => {
                    // Handle upload materials
                    console.log('Upload materials for', selectedLecture._id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Upload Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}