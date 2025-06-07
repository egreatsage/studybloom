'use client';

import { useState, useEffect } from 'react';
// Date utility functions
const format = (date, formatStr) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return formatStr === 'HH:mm' ? `${hours}:${minutes}` : date.toString();
};

const addMinutes = (date, minutes) => {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
};
import { FaGlobe, FaMapMarkerAlt, FaClock, FaBook } from 'react-icons/fa';

export default function WeeklyTimetable({ lectures = [], onLectureClick }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate time slots from 8 AM to 10 PM
  useEffect(() => {
    const slots = [];
    let currentTime = new Date();
    currentTime.setHours(8, 0, 0); // Start at 8 AM
    
    while (currentTime.getHours() < 22) { // Until 10 PM
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = addMinutes(currentTime, 30); // 30-minute slots
    }
    
    setTimeSlots(slots);
  }, []);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getLectureStyle = (lecture) => {
    const startMinutes = getMinutesFromTime(lecture.startTime);
    const endMinutes = getMinutesFromTime(lecture.endTime);
    const duration = endMinutes - startMinutes;
    const top = ((startMinutes - 480) / 30) * (isMobile ? 35 : 50); // 480 minutes = 8 AM
    const height = (duration / 30) * (isMobile ? 35 : 50);

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${Math.max(height, isMobile ? 35 : 45)}px`,
      width: 'calc(100% - 8px)',
      left: '4px',
      right: '4px'
    };
  };

  const getMinutesFromTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getLectureColor = (lecture) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600'
    ];
    
    // Use unit code to consistently assign colors
    const colorIndex = lecture.unit?.code?.charCodeAt(0) % colors.length || 0;
    return colors[colorIndex];
  };

  const renderLecture = (lecture) => {
    const style = getLectureStyle(lecture);
    const isOnline = lecture.metadata?.isOnline;
    const colorGradient = getLectureColor(lecture);

    return (
      <div
        key={lecture._id}
        style={style}
        onClick={() => onLectureClick?.(lecture)}
        className={`
          bg-gradient-to-br ${colorGradient}
          rounded-xl p-3 text-white shadow-lg hover:shadow-xl
          transform hover:scale-[1.02] transition-all duration-200
          cursor-pointer border border-white/20 backdrop-blur-sm
          ${isMobile ? 'text-xs' : 'text-sm'}
        `}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="font-bold text-white/90 truncate">
            {lecture.unit?.code || 'Course'}
          </div>
          {isOnline ? (
            <FaGlobe className="text-white/80 flex-shrink-0 ml-1" size={isMobile ? 10 : 12} />
          ) : (
            <FaMapMarkerAlt className="text-white/80 flex-shrink-0 ml-1" size={isMobile ? 10 : 12} />
          )}
        </div>
        
        <div className="flex items-center gap-1 mb-2 text-white/80">
          <FaClock size={isMobile ? 8 : 10} />
          <span className="text-xs">
            {lecture.startTime} - {lecture.endTime}
          </span>
        </div>

        {!isMobile && (
          <div className="text-xs text-white/70 truncate">
            {isOnline ? (
              lecture.metadata?.onlineLink ? (
                <a
                  href={lecture.metadata.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join Online
                </a>
              ) : (
                'Online Class'
              )
            ) : (
              <span>
                {lecture.venue?.building} {lecture.venue?.room}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const formatTime = (time) => {
    const hour = parseInt(time.split(':')[0]);
    const minute = time.split(':')[1];
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return isMobile ? `${displayHour}${period}` : `${displayHour}:${minute} ${period}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Weekly Schedule
        </h2>
        <p className="text-gray-600">Your personalized class timetable</p>
      </div>

      {/* Timetable Container */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50">
        <div className="overflow-x-auto">
          <div className="flex min-w-full">
            {/* Time column */}
            <div className={`${isMobile ? 'w-16' : 'w-20'} flex-shrink-0 bg-gradient-to-b from-gray-50 to-gray-100`}>
              <div className={`${isMobile ? 'h-12' : 'h-16'} border-b border-gray-200/70 bg-gradient-to-r from-blue-500 to-purple-500`} />
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className={`
                    ${isMobile ? 'h-9' : 'h-12'} border-b border-gray-200/50 
                    ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 font-medium
                    pr-2 text-right flex items-center justify-end
                    ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white/50'}
                  `}
                >
                  {formatTime(time)}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex-1 min-w-[120px] md:min-w-[180px]">
                {/* Day header */}
                <div className={`
                  ${isMobile ? 'h-12' : 'h-16'} border-b border-gray-200/70 
                  font-bold ${isMobile ? 'text-sm' : 'text-lg'} px-4 
                  flex items-center justify-center text-white
                  bg-gradient-to-r from-blue-500 to-purple-500
                  ${dayIndex === new Date().getDay() ? 'from-green-500 to-blue-500' : ''}
                `}>
                  <div className="text-center">
                    <div>{isMobile ? dayAbbr[dayIndex] : day}</div>
                    {dayIndex === new Date().getDay() && (
                      <div className="text-xs opacity-80">Today</div>
                    )}
                  </div>
                </div>
                
                {/* Time slots */}
                <div className="relative">
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                      className={`
                        ${isMobile ? 'h-9' : 'h-12'} border-b border-gray-200/30
                        ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white/30'}
                        hover:bg-blue-50/50 transition-colors duration-150
                      `}
                    />
                  ))}
                  
                  {/* Lectures */}
                  {lectures
                    .filter(lecture => lecture.dayOfWeek === dayIndex)
                    .map(lecture => renderLecture(lecture))}
                  
                  {/* Empty state */}
                  {lectures.filter(lecture => lecture.dayOfWeek === dayIndex).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-gray-400 text-center">
                        <FaBook className="mx-auto mb-2 opacity-30" size={isMobile ? 16 : 24} />
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-60`}>
                          No classes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FaGlobe className="text-blue-500" />
          <span>Online Classes</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-gray-500" />
          <span>In-Person Classes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}