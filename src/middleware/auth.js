import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function withAuth(request, roles = []) {
  try {
    const token = await getToken({ req: request });

    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401 }
      );
    }

    if (roles.length > 0 && !roles.includes(token.user.role)) {
      return new NextResponse(
        JSON.stringify({ message: 'Insufficient permissions' }),
        { status: 403 }
      );
    }

    // Add user info to request for downstream use
    request.user = token.user;
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
}

export async function withCourseAccess(request, courseId) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401 }
      );
    }

    const user = token.user;
    
    // Admin has access to all courses
    if (user.role === 'admin') {
      request.user = user;
      return NextResponse.next();
    }

    // Check if user has access to the course
    const hasAccess = await checkCourseAccess(user.id, courseId, user.role);
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ message: 'Access to this course denied' }),
        { status: 403 }
      );
    }

    request.user = user;
    return NextResponse.next();
  } catch (error) {
    console.error('Course access middleware error:', error);
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

export async function withUnitAccess(request, unitId) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401 }
      );
    }

    const user = token.user;
    
    // Admin has access to all units
    if (user.role === 'admin') {
      request.user = user;
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
    const hasAccess = await checkCourseAccess(user.id, unit.course._id, user.role);
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ message: 'Access to this unit denied' }),
        { status: 403 }
      );
    }

    request.user = user;
    return NextResponse.next();
  } catch (error) {
    console.error('Unit access middleware error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
}
