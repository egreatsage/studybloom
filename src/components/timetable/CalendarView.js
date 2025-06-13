'use client';

import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO
} from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

export default function CalendarView({ lectures = [], onDateClick, onLectureClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [filteredLectures, setFilteredLectures] = useState([]);

  useEffect(() => {
    // Convert lectures to calendar events
    const events = lectures.map(lecture => ({
      ...lecture,
      date: getNextOccurrence(lecture.dayOfWeek),
      title: `${lecture.unit.code} - ${lecture.unit.name}`,
      time: `${lecture.startTime} - ${lecture.endTime}`,
      isOnline: lecture.metadata?.isOnline,
      venue: lecture.venue
    }));
    setFilteredLectures(events);
  }, [lectures]);

  const getNextOccurrence = (dayOfWeek) => {
    const today = new Date();
    const todayDay = today.getDay();
    const daysUntilNext = (dayOfWeek - todayDay + 7) % 7 || 7;
    return addDays(today, daysUntilNext);
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayLectures = filteredLectures.filter(lecture => 
          lecture.dayOfWeek === day.getDay()
        );

        days.push(
          <div
            key={day}
            className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
              !isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : ''
            } ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}`}
            onClick={() => {
              setSelectedDate(cloneDay);
              onDateClick?.(cloneDay);
            }}
          >
            <div className="font-medium text-xs sm:text-sm mb-1">{formattedDate}</div>
            <div className="space-y-1">
              {dayLectures.slice(0, 3).map((lecture, idx) => (
                <div
                  key={idx}
                  className="text-[10px] sm:text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: lecture.color || '#3B82F6', color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLectureClick?.(lecture);
                  }}
                >
                  {lecture.unit.code} {lecture.startTime}
                </div>
              ))}
              {dayLectures.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{dayLectures.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayLectures = filteredLectures.filter(lecture => 
        lecture.dayOfWeek === day.getDay()
      );

      days.push(
        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0">
          <div className="text-center py-2 border-b border-gray-200 font-medium">
            {format(day, 'EEE d')}
          </div>
          <div className="p-2 space-y-2 min-h-[400px]">
            {dayLectures.map((lecture, idx) => (
              <div
                key={idx}
                className="p-2 rounded text-white text-sm cursor-pointer hover:opacity-80"
                style={{ backgroundColor: lecture.color || '#3B82F6' }}
                onClick={() => onLectureClick?.(lecture)}
              >
                <div className="font-medium">{lecture.unit.code}</div>
                <div className="text-xs">{lecture.time}</div>
                <div className="text-xs">
                  {lecture.isOnline ? '🌐 Online' : `📍 ${lecture.venue.room}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const dayLectures = filteredLectures.filter(lecture => 
      lecture.dayOfWeek === currentDate.getDay()
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="space-y-4">
        <div className="text-center py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
        </div>
        <div className="space-y-3 p-4">
          {dayLectures.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No lectures scheduled for this day</p>
          ) : (
            dayLectures.map((lecture, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onLectureClick?.(lecture)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-lg">{lecture.unit.code} - {lecture.unit.name}</h4>
                    <p className="text-gray-600">{lecture.time}</p>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: lecture.color || '#3B82F6' }}
                  >
                    {lecture.lectureType || 'Lecture'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>👨‍🏫 {lecture.teacher.name}</p>
                  <p>{lecture.isOnline ? '🌐 Online' : `📍 ${lecture.venue.building} ${lecture.venue.room}`}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const navigatePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 mb-4">
          <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FaChevronRight />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold ml-2 truncate">
              {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              Today
            </button>
            <div className="flex bg-gray-100 rounded w-full sm:w-auto justify-center">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm rounded ${
                  view === 'month' ? 'bg-white shadow' : ''
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm rounded ${
                  view === 'week' ? 'bg-white shadow' : ''
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-sm rounded ${
                  view === 'day' ? 'bg-white shadow' : ''
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Day headers for month view */}
        {view === 'month' && (
          <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-medium text-gray-600">
            <div className="hidden sm:block">Sunday</div>
            <div className="hidden sm:block">Monday</div>
            <div className="hidden sm:block">Tuesday</div>
            <div className="hidden sm:block">Wednesday</div>
            <div className="hidden sm:block">Thursday</div>
            <div className="hidden sm:block">Friday</div>
            <div className="hidden sm:block">Saturday</div>
            <div className="sm:hidden">Sun</div>
            <div className="sm:hidden">Mon</div>
            <div className="sm:hidden">Tue</div>
            <div className="sm:hidden">Wed</div>
            <div className="sm:hidden">Thu</div>
            <div className="sm:hidden">Fri</div>
            <div className="sm:hidden">Sat</div>
          </div>
        )}
      </div>

      {/* Calendar body */}
      <div className="p-2 sm:p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
}
