import { NextResponse } from 'next/server';
import TeachingAssignment from '@/models/TeachingAssignment';
import Unit from '@/models/Unit';
import User from '@/models/User';
import Course from '@/models/Course';
import Semester from '@/models/Semester';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const courseId = searchParams.get('courseId');
    const teacherId = searchParams.get('teacherId');
    
    // Build query
    const query = {};
    if (semesterId) query.semester = semesterId;
    if (courseId) query.course = courseId;
    if (teacherId) query.teacher = teacherId;
    
    let assignments;
    if (session.user.role === 'teacher') {
      // Teachers can only see their own assignments
      query.teacher = session.user.id;
      assignments = await TeachingAssignment.find(query)
        .populate('course', 'name code description')
        .populate('teacher', 'name email')
        .populate('semester', 'name startDate endDate')
        .populate('units.unit', 'name code');
    } else if (session.user.role === 'admin') {
      // Admins can see all assignments
      assignments = await TeachingAssignment.find(query)
        .populate('course', 'name code description')
        .populate('teacher', 'name email')
        .populate('semester', 'name startDate endDate')
        .populate('units.unit', 'name code');
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teacherId, courseId, semesterId, unitIds = [] } = body;

    if (!teacherId || !courseId || !semesterId) {
      return NextResponse.json(
        { error: 'Teacher ID, Course ID, and Semester ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate teacher exists and has role 'teacher'
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Invalid teacher' },
        { status: 400 }
      );
    }

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Validate semester exists
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    let assignment = await TeachingAssignment.findOne({
      teacher: teacherId,
      course: courseId,
      semester: semesterId
    });

    if (assignment) {
      // Update existing assignment with new units
      for (const unitId of unitIds) {
        const unit = await Unit.findById(unitId);
        if (unit && unit.course.toString() === courseId) {
          await assignment.assignUnit(unitId);
        }
      }
    } else {
      // Create new assignment
      assignment = await TeachingAssignment.create({
        teacher: teacherId,
        course: courseId,
        semester: semesterId,
        units: unitIds.map(unitId => ({
          unit: unitId,
          isActive: true
        }))
      });
    }

    const populatedAssignment = await TeachingAssignment.findById(assignment._id)
      .populate('course', 'name code description')
      .populate('teacher', 'name email')
      .populate('semester', 'name startDate endDate')
      .populate('units.unit', 'name code');

    return NextResponse.json(populatedAssignment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action'); // 'assign-unit' or 'unassign-unit'

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await TeachingAssignment.findById(id);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Teaching assignment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (action === 'assign-unit') {
      const { unitId } = body;
      if (!unitId) {
        return NextResponse.json(
          { error: 'Unit ID is required' },
          { status: 400 }
        );
      }

      // Validate unit belongs to the same course
      const unit = await Unit.findById(unitId);
      if (!unit || unit.course.toString() !== assignment.course.toString()) {
        return NextResponse.json(
          { error: 'Unit does not belong to this course' },
          { status: 400 }
        );
      }

      await assignment.assignUnit(unitId);
    } else if (action === 'unassign-unit') {
      const { unitId } = body;
      if (!unitId) {
        return NextResponse.json(
          { error: 'Unit ID is required' },
          { status: 400 }
        );
      }

      await assignment.unassignUnit(unitId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use assign-unit or unassign-unit' },
        { status: 400 }
      );
    }

    const populatedAssignment = await TeachingAssignment.findById(assignment._id)
      .populate('course', 'name code description')
      .populate('teacher', 'name email')
      .populate('semester', 'name startDate endDate')
      .populate('units.unit', 'name code');

    return NextResponse.json(populatedAssignment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await TeachingAssignment.findByIdAndDelete(id);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Teaching assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Teaching assignment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
