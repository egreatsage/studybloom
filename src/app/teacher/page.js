'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  FaBook, 
  FaUsers, 
  FaClipboardList, 
  FaCalendarDay, 
  FaClock,
  FaChevronRight,
  FaGraduationCap,
  FaBookOpen,
  FaUserGraduate,
  FaCalendarCheck,
  FaBell,
  FaEye,
  FaArrowRight
} from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

// Enhanced StatCard with animations and gradients
const StatCard = ({ icon, title, value, color, gradient, trend }) => (
  <div className={`
    relative overflow-hidden rounded-2xl p-6 text-white
    bg-gradient-to-br ${gradient}
    transform hover:scale-105 transition-all duration-300
    shadow-lg hover:shadow-2xl
    border border-white/20
  `}>
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div className="text-3xl opacity-80">{icon}</div>
        {trend && (
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
            +{trend}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </div>
    
    {/* Background decoration */}
    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
    <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/5 rounded-full"></div>
  </div>
);

// Enhanced TodaysSchedule with better styling
const TodaysSchedule = ({ lectures }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <FaClock className="text-blue-500" />
        Today's Schedule
      </h3>
      <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
        {lectures.length} classes
      </div>
    </div>
    
    {lectures.length === 0 ? (
      <div className="text-center py-8">
        <FaCalendarCheck className="mx-auto text-4xl text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No lectures scheduled for today</p>
        <p className="text-sm text-gray-400 mt-1">Enjoy your free day!</p>
      </div>
    ) : (
      <div className="space-y-4">
        {lectures.map((lecture, index) => (
          <div key={lecture._id} className={`
            flex items-center justify-between p-4 rounded-xl
            bg-gradient-to-r from-gray-50 to-white
            hover:from-blue-50 hover:to-blue-50/50
            border border-gray-200/50 hover:border-blue-200
            transition-all duration-200 transform hover:scale-[1.02]
            shadow-sm hover:shadow-md
          `}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-gray-800">{lecture.unit.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <FaClock size={12} />
                  {lecture.startTime} - {lecture.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`
                text-xs font-medium px-3 py-1 rounded-full
                ${lecture.lectureType === 'Lecture' ? 'bg-blue-100 text-blue-800' :
                  lecture.lectureType === 'Lab' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'}
              `}>
                {lecture.lectureType}
              </span>
              <FaChevronRight className="text-gray-400" size={12} />
            </div>
          </div>
        ))}
      </div>
    )}
     <Link href={'/teacher/schedule'} className='flex items-center justify-start mb-2 bottom-0 absolute hover:bg-gray-100 px-2 py-2 rounded-md'>
      
       <h1 className='text-gray-700 font-semibold mr-2'>View Schedules</h1>
        <FaArrowRight className='text-semibold '/>
     </Link>
  </div>
 
);

// Enhanced UpcomingAssignments with priority indicators
const UpcomingAssignments = ({ assignments }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <FaBell className="text-red-500" />
        Upcoming Deadlines
      </h3>
      <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
        {assignments.length} pending
      </div>
    </div>
    
    {assignments.length === 0 ? (
      <div className="text-center py-8">
        <FaCalendarCheck className="mx-auto text-4xl text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No assignments due soon</p>
        <p className="text-sm text-gray-400 mt-1">All caught up!</p>
      </div>
    ) : (
      <div className="space-y-4">
        {assignments.map((assignment, index) => {
          const dueDate = new Date(assignment.dueDate);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          const isUrgent = daysUntilDue <= 3;
          
          return (
            <div key={assignment._id} className={`
              flex items-center justify-between p-4 rounded-xl
              ${isUrgent ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' : 
                'bg-gradient-to-r from-gray-50 to-white border-gray-200/50'}
              hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]
              border
            `}>
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold
                  ${isUrgent ? 'bg-gradient-to-br from-red-500 to-orange-500' : 
                    'bg-gradient-to-br from-gray-500 to-gray-600'}
                `}>
                  <FaClipboardList size={16} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{assignment.title}</p>
                  <p className="text-sm text-gray-600">{assignment.unit.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                  {dueDate.toLocaleDateString()}
                </p>
                <p className={`text-xs ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
                  {daysUntilDue === 0 ? 'Due today' : 
                   daysUntilDue === 1 ? 'Due tomorrow' : 
                   `${daysUntilDue} days left`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// Enhanced Course & Units section
const CoursesAndUnits = ({ courses }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <FaGraduationCap className="text-purple-500" />
        My Courses & Units
      </h3>
      <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
        {courses.length} courses
      </div>
    </div>
    
    <div className="space-y-6">
      {courses.map((course, index) => (
        <div key={course._id} className="border border-gray-200/50 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
              {course.code.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-800">{course.name}</h4>
              <p className="text-sm text-gray-600">Course Code: {course.code}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {course.units.map((unit) => (
              <span key={unit._id} className="
                inline-flex items-center gap-2 px-4 py-2 
                bg-gradient-to-r from-gray-100 to-gray-50
                hover:from-blue-100 hover:to-blue-50
                border border-gray-200 hover:border-blue-200
                rounded-full text-sm font-medium text-gray-700
                transition-all duration-200 cursor-pointer
                hover:shadow-md transform hover:scale-105
              ">
                <FaBookOpen size={12} />
                {unit.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TeacherDashboard = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/teachers/dashboard-summary');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <FaEye className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Could not load dashboard data</h2>
          <p className="text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }
  
  const { summary, todaysLectures, upcomingAssignments, courses } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back, <span className="font-semibold text-gray-800">{session?.user?.name || 'Teacher'}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-gray-200/50">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {session?.user?.name?.charAt(0) || 'T'}
              </div>
              
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<FaBook />} 
            title="Total Courses" 
            value={summary.totalCourses} 
            gradient="from-blue-500 to-blue-600"
            trend="12"
          />
          {/* <StatCard 
            icon={<FaUsers />} 
            title="Total Students" 
            value={summary.totalStudents} 
            gradient="from-green-500 to-green-600"
            trend="8"
          /> */}
          <StatCard 
            icon={<FaClipboardList />} 
            title="Total Units" 
            value={summary.totalUnits} 
            gradient="from-purple-500 to-purple-600"
            trend="5"
          />
          <StatCard 
            icon={<FaCalendarDay />} 
            title="Upcoming Deadlines" 
            value={summary.upcomingAssignmentsCount} 
            gradient="from-red-500 to-red-600"
          />
        </div>

        {/* Schedule and Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodaysSchedule lectures={todaysLectures} />
          <UpcomingAssignments assignments={upcomingAssignments} />
        </div>

        {/* Courses and Units List */}
        <CoursesAndUnits courses={courses} />
      </div>
    </div>
  );
};

export default TeacherDashboard;