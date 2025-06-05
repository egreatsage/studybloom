import { NextResponse } from 'next/server';
import Unit from '@/models/Unit';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    let query = {};
    if (courseId && courseId !== 'all') {
      query.course = courseId;
    }
    
    const units = await Unit.find(query)
      .populate('course', 'name code')
      .populate('createdBy', 'name email');
    return NextResponse.json(units);
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
    const { name, code, courseId } = body;

    if (!name || !code || !courseId) {
      return NextResponse.json({ error: 'Name, code, and courseId are required' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const existingUnit = await Unit.findOne({ code, course: courseId });
    if (existingUnit) {
      return NextResponse.json({ error: 'Unit code already exists for this course' }, { status: 400 });
    }

    const unit = await Unit.create({
      name,
      code,
      course: courseId,
      createdBy: session.user.id
    });

    const populatedUnit = await Unit.findById(unit._id)
      .populate('course', 'name code')
      .populate('createdBy', 'name email');

    return NextResponse.json(populatedUnit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
