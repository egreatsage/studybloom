'use client';

import { FaClock, FaMapMarkerAlt, FaUser, FaBook, FaGlobe, FaCalendarAlt } from 'react-icons/fa';

export default function LectureCard({ lecture, onClick, showDetails = true }) {
  const isOnline = lecture.metadata?.isOnline;
  
  const getLectureTypeColor = (type) => {
    const colors = {
      lecture: 'bg-blue-100 text-blue-800',
      tutorial: 'bg-green-100 text-green-800',
      lab: 'bg-purple-100 text-purple-800',
      seminar: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(lecture)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {lecture.unit.code} - {lecture.unit.name}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLectureTypeColor(lecture.lectureType)}`}>
            {lecture.lectureType || 'Lecture'}
          </span>
        </div>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: lecture.color || '#3B82F6' }}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2 text-sm text-gray-600">
          {/* Time */}
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-400" />
            <span>{lecture.startTime} - {lecture.endTime}</span>
            {lecture.dayOfWeek !== undefined && (
              <>
                <FaCalendarAlt className="text-gray-400 ml-2" />
                <span>{getDayName(lecture.dayOfWeek)}</span>
              </>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <FaGlobe className="text-gray-400" />
                <span>Online Lecture</span>
                {lecture.metadata?.onlineLink && (
                  <a
                    href={lecture.metadata.onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Join Link
                  </a>
                )}
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="text-gray-400" />
                <span>
                  {lecture.venue?.building} {lecture.venue?.room}
                  {lecture.venue?.capacity && ` (Capacity: ${lecture.venue.capacity})`}
                </span>
              </>
            )}
          </div>

          {/* Teacher */}
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-400" />
            <span>{lecture.teacher.name}</span>
          </div>

          {/* Additional Info */}
          {lecture.metadata?.credits && (
            <div className="flex items-center gap-2">
              <FaBook className="text-gray-400" />
              <span>{lecture.metadata.credits} Credits</span>
            </div>
          )}

          {/* Frequency */}
          {lecture.isRecurring && (
            <div className="text-xs text-gray-500 mt-2">
              Repeats {lecture.frequency || 'weekly'}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button
          className="text-xs text-blue-600 hover:text-blue-800"
          onClick={(e) => {
            e.stopPropagation();
            // Handle view details
          }}
        >
          View Details
        </button>
        {isOnline && lecture.metadata?.onlineLink && (
          <button
            className="text-xs text-green-600 hover:text-green-800"
            onClick={(e) => {
              e.stopPropagation();
              window.open(lecture.metadata.onlineLink, '_blank');
            }}
          >
            Join Online
          </button>
        )}
      </div>
    </div>
  );
}
