'use client';

import { useEffect, useState } from 'react';
import { FaBell, FaEnvelope, FaCheckCircle, FaClock, FaUser, FaBook, FaReply, FaFilter, FaSearch } from 'react-icons/fa';

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/teachers/my-notifications');
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data.map(notification => ({
          ...notification,
          createdAt: new Date(notification.createdAt)
        })));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/teachers/my-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const updatedNotification = await response.json();
      
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...updatedNotification, createdAt: new Date(updatedNotification.createdAt) }
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRead === 'all') return matchesSearch;
    if (filterRead === 'unread') return matchesSearch && !notification.read;
    if (filterRead === 'read') return matchesSearch && notification.read;
    
    return matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-center items-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-red-500 text-2xl" />
            </div>
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <FaBell className="text-white text-2xl sm:text-3xl" />
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                {unreadCount}
              </div>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            My Notifications
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Stay connected with your students and manage all communications in one place
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer min-w-[150px]"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBell className="text-gray-400 text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">No notifications found</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <div
                key={notification._id}
                className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform ${
                  notification.read 
                    ? 'border-white/20 opacity-75 hover:opacity-100' 
                    : 'border-blue-200 ring-2 ring-blue-100'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Status indicator */}
                    <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:gap-2">
                      {notification.read ? (
                        <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0"></div>
                      ) : (
                        <div className="relative flex-shrink-0">
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 sm:text-center sm:min-w-[60px]">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                          {notification.subject}
                        </h3>
                        {!notification.read && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start">
                            New
                          </span>
                        )}
                      </div>

                      {/* Message details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-blue-600 text-xs" />
                          </div>
                          <span className="font-medium flex items-center truncate"><h1 className='text-md mr-2 text-black'>Name:</h1> {notification.studentName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaEnvelope className="text-purple-600 text-xs" />
                          </div>
                          <span className="truncate flex items-center"><h1 className='text-md mr-2 text-black'>Email:</h1> {notification.studentEmail}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3 sm:col-span-2 lg:col-span-1">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaBook className="text-green-600 text-xs" />
                          </div>
                          <span className="font-medium flex items-center truncate"> <h1 className='text-md mr-2 text-black'>Unit:</h1>{notification.unitName}</span>
                        </div>
                      </div>

                      {/* Message body */}
                      <div className="bg-gray-50/50 rounded-xl p-4 mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {notification.message}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markAsRead(notification._id)}
                            
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 transform shadow-lg ${
                              notification.read 
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-75'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105'
                            }`}
                          >
                            <FaCheckCircle className={notification.read ? 'text-green-500' : 'text-white'} />
                            Read
                          </button>
                        </div>
                        <a
                          href={`mailto:${notification.studentEmail}?subject=Re: ${notification.subject}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          <FaReply />
                          Reply
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {notifications.length > 0 && (
          <div className="mt-8 sm:mt-12 text-center">
            <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{unreadCount}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</div>
                <div className="text-sm text-gray-600">Read</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}