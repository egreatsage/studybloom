import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';
import Semester from '@/models/Semester';
import Course from '@/models/Course';

// GET /api/timetables - List all timetables
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const semesterId = searchParams.get('semesterId');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');

    // If ID is provided, fetch single timetable
    if (id) {
      const timetable = await Timetable.findById(id)
        .populate('semester', 'name startDate endDate')
        .populate('course', 'name code')
        .populate('createdBy', 'name email');
      
      if (!timetable) {
        return NextResponse.json(
          { error: 'Timetable not found' },
          { status: 404 }
        );
      }

      // Check permissions for non-admin users
      if (session.user.role !== 'admin' && timetable.status !== 'published') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return NextResponse.json(timetable);
    }

    // Otherwise, fetch list of timetables
    const query = {};
    if (semesterId) query.semester = semesterId;
    if (courseId) query.course = courseId;
    if (status) query.status = status;

    // For students and teachers, only show published timetables
    if (session.user.role !== 'admin') {
      query.status = 'published';
    }

    const timetables = await Timetable.find(query)
      .populate('semester', 'name startDate endDate')
      .populate('course', 'name code')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timetables' },
      { status: 500 }
    );
  }
}

// POST /api/timetables - Create new timetable
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { semester, course, effectiveFrom, effectiveTo, metadata } = data;

    // Validate required fields
    if (!semester || !course || !effectiveFrom || !effectiveTo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate semester exists
    const semesterDoc = await Semester.findById(semester);
    if (!semesterDoc) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    // Validate course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check for existing active timetable for the same semester and course
    const existingTimetable = await Timetable.findOne({
      semester,
      course,
      status: { $in: ['draft', 'published'] }
    });

    if (existingTimetable) {
      return NextResponse.json(
        { error: 'An active timetable already exists for this semester and course' },
        { status: 400 }
      );
    }

    // Create timetable
    const timetable = await Timetable.create({
      semester,
      course,
      effectiveFrom: new Date(effectiveFrom),
      effectiveTo: new Date(effectiveTo),
      metadata: metadata || {},
      createdBy: session.user.id,
      status: 'draft'
    });

    // Populate references
    await timetable.populate([
      { path: 'semester', select: 'name startDate endDate' },
      { path: 'course', select: 'name code' },
      { path: 'createdBy', select: 'name email' }
    ]);

    return NextResponse.json(timetable, { status: 201 });
  } catch (error) {
    console.error('Error creating timetable:', error);
    return NextResponse.json(
      { error: 'Failed to create timetable' },
      { status: 500 }
    );
  }
}

// PUT /api/timetables - Update timetable
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Timetable ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { effectiveFrom, effectiveTo, metadata } = data;

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    // Only allow updates to draft timetables
    if (timetable.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only update draft timetables' },
        { status: 400 }
      );
    }

    // Update fields
    if (effectiveFrom) timetable.effectiveFrom = new Date(effectiveFrom);
    if (effectiveTo) timetable.effectiveTo = new Date(effectiveTo);
    if (metadata) timetable.metadata = { ...timetable.metadata, ...metadata };

    await timetable.save();

    // Populate references
    await timetable.populate([
      { path: 'semester', select: 'name startDate endDate' },
      { path: 'course', select: 'name code' },
      { path: 'createdBy', select: 'name email' }
    ]);

    return NextResponse.json(timetable);
  } catch (error) {
    console.error('Error updating timetable:', error);
    return NextResponse.json(
      { error: 'Failed to update timetable' },
      { status: 500 }
    );
  }
}

// DELETE /api/timetables - Delete timetable
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Timetable ID is required' },
        { status: 400 }
      );
    }

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of draft timetables
    if (timetable.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft timetables' },
        { status: 400 }
      );
    }

    // Check if there are any lectures associated with this timetable
    const Lecture = (await import('@/models/Lecture')).default;
    const lectureCount = await Lecture.countDocuments({ timetable: id });
    
    if (lectureCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete timetable with associated lectures' },
        { status: 400 }
      );
    }

    await timetable.deleteOne();

    return NextResponse.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    return NextResponse.json(
      { error: 'Failed to delete timetable' },
      { status: 500 }
    );
  }
}
