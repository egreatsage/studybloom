import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Unit from '@/models/Unit';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    await connectDB();

    let query = {};
    if (courseId) {
      query.course = courseId;
    }

    const units = await Unit.find(query)
      .populate('course', 'name code description')
      .populate('createdBy', 'name email');

    return NextResponse.json(units);
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
    const { name, code, courseId } = body;

    if (!name || !code || !courseId) {
      return NextResponse.json(
        { error: 'Name, code, and course ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if unit code already exists in the course
    const existingUnit = await Unit.findOne({
      code,
      course: courseId
    });

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Unit code already exists in this course' },
        { status: 400 }
      );
    }

    const unit = await Unit.create({
      name,
      code,
      course: courseId,
      createdBy: session.user.id
    });

    const populatedUnit = await Unit.findById(unit._id)
      .populate('course', 'name code description')
      .populate('createdBy', 'name email');

    return NextResponse.json(populatedUnit, { status: 201 });
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
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Unit ID and name are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const unit = await Unit.findById(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    // Only allow teachers who created the unit or admins to update it
    if (session.user.role === 'teacher' && unit.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    unit.name = name;
    await unit.save();

    const populatedUnit = await Unit.findById(unit._id)
      .populate('course', 'name code description')
      .populate('createdBy', 'name email');

    return NextResponse.json(populatedUnit);
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
        { error: 'Unit ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const unit = await Unit.findById(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    // Only allow teachers who created the unit or admins to delete it
    if (session.user.role === 'teacher' && unit.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Unit.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
