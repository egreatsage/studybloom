import { NextResponse } from 'next/server';
import Assignment from '@/models/Assignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const unitId = searchParams.get('unitId');

    await connectDB();

    let query = {};
    if (courseId) {
      query.course = courseId;
    }
    if (unitId) {
      query.unit = unitId;
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'name code description')
      .populate('unit', 'name code')
      .populate('createdBy', 'name email')
      .populate('submissions.student', 'name email');

    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, dueDate, unitId, courseId } = body;

    if (!title || !description || !dueDate || !unitId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await Assignment.create({
      title,
      description,
      dueDate: new Date(dueDate),
      unit: unitId,
      course: courseId,
      createdBy: session.user.id,
      submissions: []
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'name code description')
      .populate('unit', 'name code')
      .populate('createdBy', 'name email');

    return NextResponse.json(populatedAssignment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, dueDate } = body;

    if (!id || (!title && !description && !dueDate)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Only allow teachers who created the assignment or admins to update it
    if (session.user.role === 'teacher' && assignment.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = new Date(dueDate);

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'name code description')
      .populate('unit', 'name code')
      .populate('createdBy', 'name email');

    return NextResponse.json(populatedAssignment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
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

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Only allow teachers who created the assignment or admins to delete it
    if (session.user.role === 'teacher' && assignment.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Assignment.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
