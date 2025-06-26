'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  FaSpinner, 
  FaUsers, 
  FaBook, 
  FaGraduationCap, 
  FaUniversity, 
  FaBuilding, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaChalkboardTeacher,
  FaArrowRight,
  FaEye
} from 'react-icons/fa';
import { IoIosTrendingDown } from "react-icons/io";
// Import existing stores for data fetching
import useUserStore from '@/lib/stores/userStore';
import useCourseStore from '@/lib/stores/courseStore';
import useUnitStore from '@/lib/stores/unitStore';
import useSchoolStore from '@/lib/stores/schoolStore';
import useDepartmentStore from '@/lib/stores/departmentStore';
import useTimetableStore from '@/lib/stores/timetableStore';
import Link from 'next/link';

const StatCard = ({ icon: Icon, title, value, bgColor, trend, trendValue }) => (
  <div className={`group relative overflow-hidden rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${bgColor} backdrop-blur-lg border border-white/20`}>
    
    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
   
    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 b rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
    
    <div className="relative z-10 flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
            <Icon className="text-gray-500 text-2xl drop-shadow-sm" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <IoIosTrendingDown className="text-gray-500 text-xs" />
              <span className="text-gray-500 text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <p className="text-gray-500 text-sm font-medium mb-2 tracking-wide">{title}</p>
        <p className="text-4xl font-bold text-gray-500 drop-shadow-lg">{value.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalUnits: 0,
    totalSchools: 0,
    totalDepartments: 0,
    totalTimetables: 0,
    totalVenues: 0,
  });
  const [error, setError] = useState(null);

  // Zustand store hooks
  const userStore = useUserStore();
  const courseStore = useCourseStore();
  const unitStore = useUnitStore();
  const schoolStore = useSchoolStore();
  const departmentStore = useDepartmentStore();
  const timetableStore = useTimetableStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'admin') return;

      setLoadingDashboard(true);
      setError(null);

      try {
        // Fetch data from various stores
        await Promise.all([
          userStore.fetchUsers(),
          courseStore.fetchCourses(),
          unitStore.fetchUnits('all'),
          schoolStore.fetchSchools(),
          departmentStore.fetchDepartments(),
          timetableStore.fetchTimetables(),
          timetableStore.fetchVenues(),
        ]);

        // Calculate statistics
        const users = userStore.users;
        const totalUsers = users.length;
        const totalStudents = users.filter(u => u.role === 'student').length;
        const totalTeachers = users.filter(u => u.role === 'teacher').length;

        setStats({
          totalUsers,
          totalStudents,
          totalTeachers,
          totalCourses: courseStore.courses.length,
          totalUnits: unitStore.units.length,
          totalSchools: schoolStore.schools.length,
          totalDepartments: departmentStore.departments.length,
          totalTimetables: timetableStore.timetables.filter(t => t.status === 'published').length,
          totalVenues: timetableStore.venues.length,
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [status, session]);

  if (status === 'loading' || loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-screen t ">
        <div className="text-center">
          <div className="relative">
            <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 h-12 w-12 bg-white/20 rounded-full blur-xl animate-pulse mx-auto" />
          </div>
          <p className="text-gray-800 text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/30 text-red-100 px-6 py-4 rounded-2xl shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/30 rounded-lg">
                <FaSpinner className="h-5 w-5" />
              </div>
              <div>
                <strong className="font-bold text-lg">Error!</strong>
                <p className="text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure only admin sees the dashboard
  if (!session || session.user.role !== 'admin') {
    return null; 
  }

  return (
    <div className="min-h-screen b relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-800 text-base sm:text-lg">
                Welcome back, {session?.user?.name || 'Administrator'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatCard icon={FaUsers} title="Total Users" value={stats.totalUsers} />
          <StatCard icon={FaGraduationCap} title="Students" value={stats.totalStudents}/>
          <StatCard icon={FaChalkboardTeacher} title="Teachers" value={stats.totalTeachers}  />
          <StatCard icon={FaBook} title="Courses" value={stats.totalCourses} />
          <StatCard icon={FaUniversity} title="Units" value={stats.totalUnits}/>
          <StatCard icon={FaBuilding} title="Departments" value={stats.totalDepartments}  />
          <StatCard icon={FaCalendarAlt} title="Timetables" value={stats.totalTimetables} />
          <StatCard icon={FaMapMarkerAlt} title="Venues" value={stats.totalVenues}/>
        </div>

        {/* Quick Access Links */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <DashboardLink icon={FaUsers} title="Manage Users" href="/admin/users" description="Add, edit, and manage user accounts" />
            <DashboardLink icon={FaBook} title="Manage Courses" href="/admin/courses" description="Course curriculum and structure" />
            <DashboardLink icon={FaUniversity} title="Manage Units" href="/admin/units" description="Academic units and modules" />
            <DashboardLink icon={FaCalendarAlt} title="Manage Timetables" href="/admin/timetables" description="Schedule and timing management" />
            <DashboardLink icon={FaMapMarkerAlt} title="Manage Venues" href="/admin/venues" description="Campus locations and facilities" />
            <DashboardLink icon={FaBuilding} title="Manage Departments" href="/admin/departments" description="Academic departments" />
            <DashboardLink icon={FaGraduationCap} title="Manage Schools" href="/admin/schools" description="School administration" />
            <DashboardLink icon={FaChalkboardTeacher} title="Teaching Assignments" href="/admin/timetables?tab=teaching" description="Instructor assignments" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardLink = ({ icon: Icon, title, href, description }) => (
  <div className="group relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
    {/* Hover gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* Floating decoration */}
    <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
    
    <Link href={href} className="relative z-10 block">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="text-gray-500 text-xl" />
        </div>
        <div className="p-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <FaArrowRight className="text-gray-500 text-sm" />
        </div>
      </div>
      
      <h3 className="text-lg sm:text-xl font-bold text-gray-500 mb-2 group-hover:text-gray-500 transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-gray-500/60 text-sm leading-relaxed group-hover:text-gray-500/80 transition-colors duration-300">
        {description}
      </p>
      
      <div className="mt-4 flex items-center space-x-2 text-gray-500/40 group-hover:text-gray-500/60 transition-colors duration-300">
        <FaEye className="text-xs" />
        <span className="text-xs font-medium">View Details</span>
      </div>
    </Link>
  </div>
);

export default AdminDashboard;