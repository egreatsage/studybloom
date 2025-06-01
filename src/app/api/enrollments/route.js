import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let enrollments;
    if (session.user.role === 'student') {
      enrollments = await Enrollment.find({ student: session.user.id })
        .populate('course', 'name code description')
        .populate('student', 'name email');
    } else if (session.user.role === 'admin' || session.user.role === 'teacher') {
      enrollments = await Enrollment.find({})
        .populate('course', 'name code description')
        .populate('student', 'name email');
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(enrollments);
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
    const { studentId, courseId } = body;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID and Course ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment already exists' },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'name code description')
      .populate('student', 'name email');

    return NextResponse.json(populatedEnrollment, { status: 201 });
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
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const enrollment = await Enrollment.findByIdAndDelete(id);
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
