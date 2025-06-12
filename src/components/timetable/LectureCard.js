import React from 'react';
import { Clock, MapPin, User, Globe, Calendar, ExternalLink, Play } from 'lucide-react';

export default function LectureCard({ lecture, onClick, showDetails = true }) {
  const isOnline = lecture?.metadata?.isOnline || false;
  
  const getLectureTypeColor = (type) => {
    const colors = {
      lecture: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200',
      tutorial: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200',
      lab: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200',
      seminar: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200'
    };
    return colors[type] || 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getLectureStatus = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes

    // Create lecture date by combining the date with time
    const [startHour, startMinute] = lecture.startTime.split(':').map(Number);
    const [endHour, endMinute] = lecture.endTime.split(':').map(Number);

    const lectureDate = new Date(lecture.date);
    const lectureStartDate = new Date(lecture.date);
    const lectureEndDate = new Date(lecture.date);

    // Set the hours and minutes for start and end times
    lectureStartDate.setHours(startHour, startMinute, 0);
    lectureEndDate.setHours(endHour, endMinute, 0);

    // Compare full datetime
    if (now < lectureStartDate) {
      // Future lecture
      return {
        isOngoing: false,
        statusText: 'Not Started',
        statusColor: 'bg-gray-100 text-gray-600',
        dotColor: 'bg-gray-400'
      };
    } else if (now > lectureEndDate) {
      // Past lecture
      return {
        isOngoing: false,
        statusText: 'Completed',
        statusColor: 'bg-blue-100 text-blue-700',
        dotColor: 'bg-blue-400'
      };
    } else {
      // Current lecture
      return {
        isOngoing: true,
        statusText: 'Ongoing',
        statusColor: 'bg-green-100 text-green-700',
        dotColor: 'bg-green-500'
      };
    }
  };

  const lectureData = lecture;
  const lectureStatus = getLectureStatus();

  return (
    <div className="group relative">
      {/* Card Container */}
      <div
        className="relative bg-white border border-gray-200/60 rounded-2xl p-6 
                   hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 
                   transition-all duration-300 cursor-pointer overflow-hidden
                   backdrop-blur-sm hover:border-gray-300/60"
        onClick={() => onClick?.(lectureData)}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Color Accent */}
        <div 
          className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
          style={{ backgroundColor: lectureData.color || '#3B82F6' }}
        />

        {/* Header */}
        <div className="relative flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-gray-800 transition-colors">
              {lectureData.unit.code}
            </h3>
            <p className="text-gray-600 text-sm font-medium mb-3 line-clamp-2">
              {lectureData.unit.name}
            </p>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getLectureTypeColor(lectureData.lectureType)}`}>
              {lectureData.lectureType || 'Lecture'}
            </span>
          </div>
          
          {/* Status Indicator */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${lectureStatus.dotColor} ring-2 ring-white`}
              />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${lectureStatus.statusColor}`}>
                {lectureStatus.statusText}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        {showDetails && (
          <div className="relative space-y-3 text-sm">
            {/* Time & Day */}
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{lectureData.startTime} - {lectureData.endTime}</span>
              </div>
              {lectureData.dayOfWeek !== undefined && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-blue-700">{getDayName(lectureData.dayOfWeek)}</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              {isOnline ? (
                <>
                  <Globe className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Online Lecture</span>
                  {lectureData.metadata?.onlineLink && (
                    <button
                      className="ml-auto flex items-center gap-1 text-green-600 hover:text-green-700 font-medium hover:bg-green-100 px-2 py-1 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(lectureData.metadata.onlineLink, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Join
                    </button>
                  )}
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {lectureData.venue?.building} {lectureData.venue?.room}
                  </span>
                  {lectureData.venue?.capacity && (
                    <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {lectureData.venue.capacity} seats
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Teacher */}
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{lectureData.teacher.name}</span>
            </div>

            {/* Frequency */}
            {lectureData.isRecurring && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Repeats {lectureData.frequency || 'weekly'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="relative mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {isOnline && lectureData.metadata?.onlineLink && lectureStatus.isOngoing && (
              <button
                className="flex items-center gap-1 text-sm text-white bg-green-600 hover:bg-green-700 
                           px-4 py-2 rounded-lg font-medium transition-all duration-200
                           hover:shadow-lg hover:shadow-green-200 group-hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(lectureData.metadata.onlineLink, '_blank');
                }}
              >
                <Play className="w-3 h-3" />
                Join Now
              </button>
            )}
          </div>
          
          {/* Hover Arrow */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
