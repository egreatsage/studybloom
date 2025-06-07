import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';

// POST /api/timetables/[id]/publish - Publish a timetable
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await  params; // This syntax is correct.

    if (!id) {
        return NextResponse.json({ error: 'Timetable ID is required' }, { status: 400 });
    }

    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    // Check if timetable is already published
    if (timetable.status === 'published') {
      return NextResponse.json(
        { error: 'Timetable is already published' },
        { status: 400 }
      );
    }

    // Check if timetable is archived
    if (timetable.status === 'archived') {
      return NextResponse.json(
        { error: 'Cannot publish an archived timetable' },
        { status: 400 }
      );
    }

    // Check if there are any lectures in the timetable
    const Lecture = (await import('@/models/Lecture')).default;
    const lectureCount = await Lecture.countDocuments({ timetable: id });
    
    if (lectureCount === 0) {
      return NextResponse.json(
        { error: 'Cannot publish a timetable without lectures' },
        { status: 400 }
      );
    }

    // Archive any existing published timetable for the same semester and course
    await Timetable.updateMany(
      {
        semester: timetable.semester,
        course: timetable.course,
        status: 'published',
        _id: { $ne: id }
      },
      { status: 'archived' }
    );

    // Publish the timetable
    await timetable.publish();

    // Populate references for the response
    const populatedTimetable = await Timetable.findById(id)
        .populate('semester', 'name startDate endDate')
        .populate('course', 'name code')
        .populate('createdBy', 'name email');


    return NextResponse.json({
      message: 'Timetable published successfully',
      timetable: populatedTimetable // Ensure the response is nested correctly
    });
  } catch (error) {
    console.error('Error publishing timetable:', error);
    return NextResponse.json(
      { error: 'Failed to publish timetable' },
      { status: 500 }
    );
  }
}