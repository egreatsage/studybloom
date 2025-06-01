import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeachingAssignment from '@/models/TeachingAssignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let assignments;
    if (session.user.role === 'teacher') {
      // Teachers can only see their own assignments
      assignments = await TeachingAssignment.find({ teacher: session.user.id })
        .populate('course', 'name code description')
        .populate('teacher', 'name email');
    } else if (session.user.role === 'admin') {
      // Admins can see all assignments
      assignments = await TeachingAssignment.find({})
        .populate('course', 'name code description')
        .populate('teacher', 'name email');
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
    const { teacherId, courseId } = body;

    if (!teacherId || !courseId) {
      return NextResponse.json(
        { error: 'Teacher ID and Course ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if assignment already exists
    const existingAssignment = await TeachingAssignment.findOne({
      teacher: teacherId,
      course: courseId
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Teaching assignment already exists' },
        { status: 400 }
      );
    }

    const assignment = await TeachingAssignment.create({
      teacher: teacherId,
      course: courseId
    });

    const populatedAssignment = await TeachingAssignment.findById(assignment._id)
      .populate('course', 'name code description')
      .populate('teacher', 'name email');

    return NextResponse.json(populatedAssignment, { status: 201 });
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
