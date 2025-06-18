import { NextResponse } from 'next/server';
import Unit from '@/models/Unit';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, units } = body;

    if (!courseId || !units || !Array.isArray(units) || units.length === 0) {
      return NextResponse.json({ error: 'CourseId and units array are required' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check for duplicate codes within the course
    const existingUnits = await Unit.find({ course: courseId });
    const existingCodes = new Set(existingUnits.map(u => u.code));
    const duplicateCodes = units.filter(u => existingCodes.has(u.code));
    
    if (duplicateCodes.length > 0) {
      return NextResponse.json({ 
        error: `Unit codes already exist for this course: ${duplicateCodes.map(u => u.code).join(', ')}` 
      }, { status: 400 });
    }

    // Create all units
    const unitsToCreate = units.map(unit => ({
      name: unit.name,
      code: unit.code,
      course: courseId,
      createdBy: session.user.id
    }));

    const createdUnits = await Unit.create(unitsToCreate);
    
    // Populate the created units
    const populatedUnits = await Unit.find({
      _id: { $in: createdUnits.map(u => u._id) }
    })
    .populate('course', 'name code')
    .populate('createdBy', 'name email');

    return NextResponse.json(populatedUnits, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
