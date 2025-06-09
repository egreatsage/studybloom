import Assignment from '@/models/Assignment';
import Enrollment from '@/models/Enrollment';
import TeachingAssignment from '@/models/TeachingAssignment';
import Unit from '@/models/Unit';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Auth middleware helper functions
async function withAuth(request, roles = []) {
  try {

    const token = await getToken({ req: request });
   

    if (!token || !token.role) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401 }
      );
    }


    if (roles.length > 0 && !roles.includes(token.role)) {
      return new NextResponse(
        JSON.stringify({ message: 'Insufficient permissions' }),
        { status: 403 }
      );
    }


    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
}

async function checkCourseAccess(userId, courseId, role) {
  try {
    if (role === 'teacher') {
      // Check if user is assigned as a teacher to this course
      const teachingAssignment = await TeachingAssignment.findOne({
        teacher: userId,
        course: courseId
      });
      return !!teachingAssignment;
    } else if (role === 'student') {
      // Check if user is enrolled in this course
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      });
      return !!enrollment;
    }
    return false;
  } catch (error) {
    console.error('Error checking course access:', error);
    return false;
  }
}

async function withCourseAccess(request, courseId) {
  try {
    const token = await getToken({ req: request });
    console.log('Course access middleware token:', token);
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401 }
      );
    }

    // Admin has access to all courses
    if (token.role === 'admin') {
      return NextResponse.next();
    }

    // Check if user has access to the course
    const hasAccess = await checkCourseAccess(token.id, courseId, token.role);
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ message: 'Access to this course denied' }),
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Course access middleware error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
}

async function withUnitAccess(request, unitId) {
  try {
    const token = await getToken({ req: request });
    console.log('Unit access middleware token:', token);
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401 }
      );
    }

    // Admin has access to all units
    if (token.role === 'admin') {
      return NextResponse.next();
    }

    // Get the unit to check its course
    const unit = await Unit.findById(unitId).populate('course');
    if (!unit) {
      return new NextResponse(
        JSON.stringify({ message: 'Unit not found' }),
        { status: 404 }
      );
    }

    // Check if user has access to the course this unit belongs to
    const hasAccess = await checkCourseAccess(token.id, unit.course._id, token.role);
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ message: 'Access to this unit denied' }),
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Unit access middleware error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
}

// Main middleware function
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  if (
    pathname.startsWith('/_next') || // Next.js static files
    pathname.startsWith('/api/auth') || // Auth endpoints
    (pathname === '/api/users' && request.method === 'POST') || // Allow user registration
    pathname === '/' || // Home page
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    return withAuth(request, ['admin']);
  }

  // Teacher routes
  if (pathname.startsWith('/teacher')) {
    return withAuth(request, ['teacher', 'admin']);
  }

  // Student routes
  if (pathname.startsWith('/student')) {
    return withAuth(request, ['student', 'admin']);
  }

  // API routes that require authentication
  if (pathname.startsWith('/api')) {
    // Course routes
    if (pathname.startsWith('/api/courses')) {
      // For specific course operations (PUT, DELETE, etc)
      if (pathname.match(/\/api\/courses\/[^/]+/)) {
        const courseId = pathname.split('/')[3];
        return withCourseAccess(request, courseId);
      }
      // For general course operations (GET all, POST)
      return withAuth(request);
    }

    // Unit routes
    if (pathname.startsWith('/api/units')) {
      // For specific unit operations
      if (pathname.match(/\/api\/units\/[^/]+/)) {
        const unitId = pathname.split('/')[3];
        return withUnitAccess(request, unitId);
      }
      // For general unit operations (GET all, POST)
      return withAuth(request);
    }

    // Assignment-specific routes
    // if (pathname.match(/\/api\/assignments\/[^/]+/)) {
    //   const assignmentId = pathname.split('/')[3];
    //   // First get the unit ID from the assignment, then check unit access
    //   const assignment = await Assignment.findById(assignmentId);
    //   if (!assignment) {
    //     return new NextResponse(
    //       JSON.stringify({ message: 'Assignment not found' }),
    //       { status: 404 }
    //     );
    //   }
    //   return withUnitAccess(request, assignment.unit);
    // }

    // Default to requiring authentication for all other API routes
    return withAuth(request);
  }

  // Default to requiring authentication for all other routes
  return withAuth(request);
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /robots.txt (static files)
     */
    '/((?!_next|static|favicon.ico|robots.txt).*)',
  ],
};
