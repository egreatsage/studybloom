import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TeachingAssignment from '@/models/TeachingAssignment';
import User from '@/models/User';
import Unit from '@/models/Unit';
import Lecture from '@/models/Lecture';

// GET request handler
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');

    if (!lectureId) {
      // Return all assignments if no lectureId is specified
      const assignments = await TeachingAssignment.find({})
        .populate('teacher', 'name')
        .populate('unit', 'name')
        .populate('lecture', 'topic');
      return NextResponse.json(assignments);
    }

    // Find all assignments for the given lecture
    const assignments = await TeachingAssignment.find({ lecture: lectureId })
      .populate({
        path: 'teacher',
        model: User,
        select: 'name email',
      })
      .populate({
        path: 'unit',
        model: Unit,
        select: 'name code',
      });

    // Consolidate assignments by teacher to avoid duplicates
    const consolidated = assignments.reduce((acc, assignment) => {
      const teacherId = assignment.teacher._id.toString();
      if (!acc[teacherId]) {
        acc[teacherId] = {
          _id: teacherId,
          teacher: assignment.teacher,
          units: [],
          lecture: assignment.lecture,
        };
      }
      acc[teacherId].units.push(assignment.unit);
      return acc;
    }, {});

    return NextResponse.json(Object.values(consolidated));
  } catch (error) {
    console.error('Failed to fetch teaching assignments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch teaching assignments', error: error.message },
      { status: 500 }
    );
  }
}

// POST request handler
export async function POST(request) {
  try {
    await connectToDatabase();
    const { teacherId, unitId, lectureId } = await request.json();

    // Check for missing fields
    if (!teacherId || !unitId || !lectureId) {
      return NextResponse.json(
        { message: 'Teacher, unit, and lecture IDs are required' },
        { status: 400 }
      );
    }

    // Prevent duplicate assignments
    const existingAssignment = await TeachingAssignment.findOne({
      teacher: teacherId,
      unit: unitId,
      lecture: lectureId,
    });

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'This teacher is already assigned to this unit for this lecture' },
        { status: 409 } // 409 Conflict
      );
    }

    // Create and save the new assignment
    const newAssignment = new TeachingAssignment({
      teacher: teacherId,
      unit: unitId,
      lecture: lectureId,
    });
    await newAssignment.save();

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Failed to create teaching assignment:', error);
    return NextResponse.json(
      { message: 'Failed to create teaching assignment', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE request handler
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json(
        { message: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the assignment
    const deletedAssignment = await TeachingAssignment.findByIdAndDelete(assignmentId);

    if (!deletedAssignment) {
      return NextResponse.json(
        { message: 'Teaching assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Teaching assignment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete teaching assignment:', error);
    return NextResponse.json(
      { message: 'Failed to delete teaching assignment', error: error.message },
      { status: 500 }
    );
  }
}