import { NextResponse } from 'next/server';
import Unit from '@/models/Unit';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, code, courseId } = body;

    if (!name || !code || !courseId) {
      return NextResponse.json({ error: 'Name, code, and courseId are required' }, { status: 400 });
    }

    await connectDB();

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if unit code already exists for another unit in the same course
    const existingUnit = await Unit.findOne({
      code,
      course: courseId,
      _id: { $ne: id }
    });
    if (existingUnit) {
      return NextResponse.json({ error: 'Unit code already exists for this course' }, { status: 400 });
    }

    const unit = await Unit.findByIdAndUpdate(
      id,
      {
        name,
        code,
        course: courseId,
        updatedBy: session.user.id,
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('course', 'name code')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectDB();

    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    const unit = await Unit.findById(id)
      .populate('course', 'name code')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
