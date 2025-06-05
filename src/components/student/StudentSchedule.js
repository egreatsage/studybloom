'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import WeeklyTimetable from '@/components/timetable/WeeklyTimetable';
import CalendarView from '@/components/timetable/CalendarView';
import LectureCard from '@/components/timetable/LectureCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaCalendarAlt, FaList, FaDownload, FaSync, FaFilter } from 'react-icons/fa';

export default function StudentSchedule() {
  const { data: session } = useSession();
  const [lectures, setLectures] = useState([]);
  const [registeredUnits, setRegisteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('week'); // week, calendar, list
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [filter, setFilter] = useState({
    course: 'all',
    unit: 'all',
    lectureType: 'all'
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchStudentSchedule();
    }
  }, [session]);

  const fetchStudentSchedule = async () => {
    try {
      setLoading(true);
      
      // First, get student's registered units
      const registrationResponse = await fetch('/api/unit-registrations', {
        credentials: 'include'
      });

      if (!registrationResponse.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const registrations = await registrationResponse.json();
      const activeRegistrations = registrations.filter(reg => reg.status === 'active');
      const unitIds = activeRegistrations.map(reg => reg.unit._id);
      setRegisteredUnits(activeRegistrations.map(reg => reg.unit));

      // Then, fetch lectures for those units
      if (unitIds.length > 0) {
        const lecturePromises = unitIds.map(unitId => 
          fetch(`/api/lectures?unitId=${unitId}`, { credentials: 'include' })
        );

        const responses = await Promise.all(lecturePromises);
        
        // Check if all responses are ok
        const failedResponses = responses.filter(res => !res.ok);
        if (failedResponses.length > 0) {
          console.error('Some lecture fetches failed:', failedResponses);
        }

        const lectureArrays = await Promise.all(
          responses
            .filter(res => res.ok)
            .map(res => res.json())
        );

        // Flatten and filter for published timetables only
        const allLectures = lectureArrays.flat().filter(lecture => 
          lecture.timetable?.status === 'published'
        );

        setLectures(allLectures);
      } else {
        // No registered units
        setLectures([]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSchedule = async (format = 'ical') => {
    try {
      const response = await fetch(`/api/students/schedule/export?format=${format}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export schedule');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-schedule.${format === 'ical' ? 'ics' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleSyncCalendar = async (provider) => {
    try {
      const response = await fetch('/api/students/schedule/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider })
      });

      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }

      const result = await response.json();
      if (result.authUrl) {
        window.open(result.authUrl, '_blank');
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const filteredLectures = lectures.filter(lecture => {
    if (filter.course !== 'all' && lecture.unit.course !== filter.course) return false;
    if (filter.unit !== 'all' && lecture.unit._id !== filter.unit) return false;
    if (filter.lectureType !== 'all' && lecture.lectureType !== filter.lectureType) return false;
    return true;
  });

  const uniqueCourses = [...new Set(lectures.map(l => l.unit.course))].filter(Boolean);
  const uniqueTypes = [...new Set(lectures.map(l => l.lectureType))].filter(Boolean);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Class Schedule</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportSchedule('ical')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaDownload /> Export
            </button>
            <div className="relative group">
              <button className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                <FaSync /> Sync Calendar
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                <button
                  onClick={() => handleSyncCalendar('google')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Google Calendar
                </button>
                <button
                  onClick={() => handleSyncCalendar('outlook')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Outlook Calendar
                </button>
                <button
                  onClick={() => handleSyncCalendar('apple')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Apple Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Units Summary */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Registered Units</h3>
          <div className="flex flex-wrap gap-2">
            {registeredUnits.length === 0 ? (
              <p className="text-sm text-gray-600">No units registered yet. Please register for units to see your schedule.</p>
            ) : (
              registeredUnits.map(unit => (
                <span
                  key={unit._id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {unit.code} - {unit.name}
                </span>
              ))
            )}
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
            value={filter.unit}
            onChange={(e) => setFilter({ ...filter, unit: e.target.value })}
            className="px-3 py-1 border rounded"
          >
            <option value="all">All Units</option>
            {registeredUnits.map(unit => (
              <option key={unit._id} value={unit._id}>
                {unit.code} - {unit.name}
              </option>
            ))}
          </select>

          <select
            value={filter.lectureType}
            onChange={(e) => setFilter({ ...filter, lectureType: e.target.value })}
            className="px-3 py-1 border rounded"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Display */}
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : lectures.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No lectures scheduled yet for your registered units.
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
                <h2 className="text-lg font-semibold mb-4">All Classes</h2>
                <div className="space-y-4">
                  {filteredLectures.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No classes found</p>
                  ) : (
                    filteredLectures
                      .sort((a, b) => {
                        if (a.dayOfWeek !== b.dayOfWeek) {
                          return a.dayOfWeek - b.dayOfWeek;
                        }
                        return a.startTime.localeCompare(b.startTime);
                      })
                      .map(lecture => (
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
              <h2 className="text-xl font-bold">Class Details</h2>
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
                <h3 className="font-semibold mb-2">Attendance Status</h3>
                <p className="text-sm text-gray-600">
                  Your attendance for this unit will be tracked during class.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Class Materials</h3>
                <p className="text-sm text-gray-600">
                  Materials will be available here once uploaded by the teacher.
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                {selectedLecture.metadata?.isOnline && selectedLecture.metadata?.onlineLink && (
                  <a
                    href={selectedLecture.metadata.onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Join Online Class
                  </a>
                )}
                <button
                  onClick={() => {
                    // Handle add to personal calendar
                    console.log('Add to calendar', selectedLecture._id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
