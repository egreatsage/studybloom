'use client';


import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import WeeklyTimetable from '@/components/timetable/WeeklyTimetable';
import CalendarView from '@/components/timetable/CalendarView';
import LectureCard from '@/components/timetable/LectureCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AttendanceManager from '@/components/teacher/AttendanceManager';
import { FaCalendarAlt, FaList, FaRegCalendarCheck } from 'react-icons/fa';

export default function TeacherSchedule() {
  const { data: session } = useSession();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('week'); // week, calendar, list
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [managingAttendance, setManagingAttendance] = useState(null); 
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

  const filteredLectures = lectures.filter(lecture => {
    if (filter.semester !== 'all' && lecture.timetable?.semester?._id !== filter.semester) return false;
    if (filter.course !== 'all' && lecture.timetable?.course?._id !== filter.course) return false;
    if (filter.unit !== 'all' && lecture.unit._id !== filter.unit) return false;
    return true;
  });

  const uniqueUnits = [...new Set(lectures.map(l => l.unit._id))];


  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 w-full overflow-x-auto">
      {managingAttendance && (
          <AttendanceManager 
              lecture={managingAttendance.lecture}
              lectureInstance={managingAttendance.instance}
              onClose={() => setManagingAttendance(null)}
          />
      )}

      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">My Teaching Schedule</h1>
        </div>
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 sm:items-center">
          {/* View Switcher */}
          <div className="flex space-x-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              onClick={() => setView('week')}
              className={`p-2 rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Weekly View"
            >
              Week
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Calendar View"
            >
              <FaCalendarAlt />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="List View"
            >
              <FaList />
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:space-x-4 w-full sm:w-auto">
            

           

            <select
              value={filter.unit}
              onChange={(e) => setFilter({ ...filter, unit: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 w-full sm:w-auto text-sm"
            >
              <option value="all">All Units</option>
              {uniqueUnits.map(unitId => (
                <option key={unitId} value={unitId}>
                  {lectures.find(l => l.unit._id === unitId)?.unit?.name || unitId}
                </option>
              ))}
            </select>
          </div>
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
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <div className="p-4 sm:p-6">
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
          <div className="bg-white rounded-lg p-4 sm:p-6 mx-2 sm:mx-4 max-w-2xl w-[95%] sm:w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
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
              <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full">
                <button
                  onClick={() => handleManageAttendance(selectedLecture)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaRegCalendarCheck /> Manage Attendance
                </button>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
