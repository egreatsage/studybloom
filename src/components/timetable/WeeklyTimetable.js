'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, addMinutes } from 'date-fns';

export default function WeeklyTimetable({ lectures = [], onLectureClick }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
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

  const getLectureStyle = (lecture) => {
    const startMinutes = getMinutesFromTime(lecture.startTime);
    const endMinutes = getMinutesFromTime(lecture.endTime);
    const duration = endMinutes - startMinutes;
    const top = ((startMinutes - 480) / 30) * 40; // 480 minutes = 8 AM, 40px per slot
    const height = (duration / 30) * 40;

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${height}px`,
      width: '90%',
      backgroundColor: lecture.color || '#3B82F6',
      borderRadius: '0.375rem',
      padding: '0.5rem',
      color: 'white',
      overflow: 'hidden',
      cursor: 'pointer',
      zIndex: 10
    };
  };

  const getMinutesFromTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const renderLecture = (lecture) => {
    const style = getLectureStyle(lecture);
    const isOnline = lecture.metadata?.isOnline;

    return (
      <div
        key={lecture._id}
        style={style}
        onClick={() => onLectureClick?.(lecture)}
        className="hover:opacity-90 transition-opacity"
      >
        <div className="text-sm font-semibold mb-1">
          {lecture.unit.code}
        </div>
        <div className="text-xs">
          {lecture.startTime} - {lecture.endTime}
        </div>
        <div className="text-xs truncate">
          {isOnline ? '🌐 Online' : `📍 ${lecture.venue.building} ${lecture.venue.room}`}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-auto">
      <div className="flex">
        {/* Time column */}
        <div className="w-20 flex-shrink-0">
          <div className="h-12 border-b border-gray-200" /> {/* Empty corner */}
          {timeSlots.map(time => (
            <div
              key={time}
              className="h-10 border-b border-gray-100 text-xs text-gray-500 pr-2 text-right"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Days columns */}
        {days.map((day, index) => (
          <div key={day} className="flex-1 min-w-[150px]">
            {/* Day header */}
            <div className="h-12 border-b border-gray-200 font-medium text-sm px-2 flex items-center justify-center">
              {day}
            </div>
            
            {/* Time slots */}
            <div className="relative">
              {timeSlots.map(time => (
                <div
                  key={time}
                  className="h-10 border-b border-gray-100"
                />
              ))}
              
              {/* Lectures */}
              {lectures
                .filter(lecture => lecture.dayOfWeek === index)
                .map(lecture => renderLecture(lecture))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
