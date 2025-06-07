'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import WeeklyTimetable from '@/components/timetable/WeeklyTimetable';
import CalendarView from '@/components/timetable/CalendarView';
import LectureCard from '@/components/timetable/LectureCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AttendanceManager from '@/components/teacher/AttendanceManager';
import { FaCalendarAlt, FaList, FaDownload, FaFilter, FaRegCalendarCheck } from 'react-icons/fa';

export default function TeacherSchedule() {
  const { data: session } = useSession();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('week'); // week, calendar, list
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [managingAttendance, setManagingAttendance] = useState(null); // Will hold { lecture, instance }
  const [filter, setFilter] = useState({
    semester: 'all',
    course: 'all',
    unit: 'all'
  });

  // Simplified fetch. In a real app, you would fetch instances as needed.
  // For this implementation, we assume a lecture maps to a recent/upcoming instance.
  const findOrCreateLectureInstance = async (lecture) => {
      // In a real app, you would have more robust logic to find the correct instance
      // based on the current date. For now, we'll create one if it doesn't exist for today.
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/lecture-instances?lectureId=${lecture._id}&date=${today}`);
      let instances = await response.json();

      if (instances.length > 0) {
          return instances[0];
      } else {
          // If no instance for today, create one (demo purpose)
          const createResponse = await fetch('/api/lecture-instances', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  lectureId: lecture._id,
                  date: new Date()
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

  const handleExportSchedule = async (format = 'ical') => {
    try {
      const response = await fetch(`/api/teachers/schedule/export?format=${format}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export schedule');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher-schedule.${format === 'ical' ? 'ics' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const filteredLectures = lectures.filter(lecture => {
    if (filter.semester !== 'all' && lecture.timetable?.semester?._id !== filter.semester) return false;
    if (filter.course !== 'all' && lecture.timetable?.course?._id !== filter.course) return false;
    if (filter.unit !== 'all' && lecture.unit._id !== filter.unit) return false;
    return true;
  });

  const uniqueSemesters = [...new Set(lectures.map(l => l.timetable?.semester?._id))].filter(Boolean);
  const uniqueCourses = [...new Set(lectures.map(l => l.timetable?.course?._id))].filter(Boolean);
  const uniqueUnits = [...new Set(lectures.map(l => l.unit._id))];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {managingAttendance && (
          <AttendanceManager 
              lecture={managingAttendance.lecture}
              lectureInstance={managingAttendance.instance}
              onClose={() => setManagingAttendance(null)}
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

        {/* View Switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaCalendarAlt /> Weekly View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaCalendarAlt /> Calendar View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaList /> List View
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <FaFilter className="text-gray-500" />
          <select
            value={filter.semester}
            onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
            className="px-3 py-1 border rounded"
          >
            <option value="all">All Semesters</option>
            {uniqueSemesters.map(semId => {
              const semester = lectures.find(l => l.timetable?.semester?._id === semId)?.timetable?.semester;
              return semester ? (
                <option key={semId} value={semId}>{semester.name}</option>
              ) : null;
            })}
          </select>

          <select
            value={filter.course}
            onChange={(e) => setFilter({ ...filter, course: e.target.value })}
            className="px-3 py-1 border rounded"
          >
            <option value="all">All Courses</option>
            {uniqueCourses.map(courseId => {
              const course = lectures.find(l => l.timetable?.course?._id === courseId)?.timetable?.course;
              return course ? (
                <option key={courseId} value={courseId}>{course.code} - {course.name}</option>
              ) : null;
            })}
          </select>

          <select
            value={filter.unit}
            onChange={(e) => setFilter({ ...filter, unit: e.target.value })}
            className="px-3 py-1 border rounded"
          >
            <option value="all">All Units</option>
            {uniqueUnits.map(unitId => {
              const unit = lectures.find(l => l.unit._id === unitId)?.unit;
              return unit ? (
                <option key={unitId} value={unitId}>{unit.code} - {unit.name}</option>
              ) : null;
            })}
          </select>
        </div>
      </div>

      {/* Schedule Display */}
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
              <div>
                <h3 className="font-semibold mb-2">Course Information</h3>
                <p className="text-sm text-gray-600">
                  {selectedLecture.timetable?.course?.code} - {selectedLecture.timetable?.course?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Semester: {selectedLecture.timetable?.semester?.name}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Schedule</h3>
                <p className="text-sm text-gray-600">
                  Every {selectedLecture.frequency || 'week'} on {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedLecture.dayOfWeek]}
                </p>
                <p className="text-sm text-gray-600">
                  From {selectedLecture.startTime} to {selectedLecture.endTime}
                </p>
              </div>

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