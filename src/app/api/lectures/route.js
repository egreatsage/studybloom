import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import Timetable from '@/models/Timetable';
import Unit from '@/models/Unit';
import User from '@/models/User';
import TeachingAssignment from '@/models/TeachingAssignment';

// GET /api/lectures - List lectures with filters
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const timetableId = searchParams.get('timetableId');
    const teacherId = searchParams.get('teacherId');
    const unitId = searchParams.get('unitId');
    const dayOfWeek = searchParams.get('dayOfWeek');

    // Build query
    const query = {};
    if (timetableId) query.timetable = timetableId;
    if (teacherId) query.teacher = teacherId;
    if (unitId) query.unit = unitId;
    if (dayOfWeek !== null) query.dayOfWeek = parseInt(dayOfWeek);

    // For students, only show lectures from published timetables
    if (session.user.role === 'student' && !timetableId) {
      const timetables = await Timetable.find({ status: 'published' }).select('_id');
      query.timetable = { $in: timetables.map(t => t._id) };
    }

    const lectures = await Lecture.find(query)
      .populate('timetable', 'semester course status')
      .populate('unit', 'name code')
      .populate('teacher', 'name email')
      .sort({ dayOfWeek: 1, startTime: 1 });

    return NextResponse.json(lectures);
  } catch (error) {
    console.error('Error fetching lectures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lectures' },
      { status: 500 }
    );
  }
}

// POST /api/lectures - Create lecture slot
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const {
      timetable,
      unit,
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      venue,
      lectureType,
      isRecurring,
      frequency,
      color,
      metadata
    } = data;

    // Validate required fields
    if (!timetable || !unit || !teacher || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
      
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    

    // For non-online lectures, venue is required
    if (!metadata?.isOnline && !venue) {
      return NextResponse.json(
        { error: 'Venue is required for non-online lectures' },
        { status: 400 }
      );
    }

    // Validate timetable exists and is draft
    const timetableDoc = await Timetable.findById(timetable);
    if (!timetableDoc) {
      return NextResponse.json(
        { error: 'Timetable not found' },
        { status: 404 }
      );
    }

    // if (timetableDoc.status !== 'draft') {
    //   return NextResponse.json(
    //     { error: 'Can only add lectures to draft timetables' },
    //     { status: 400 }
    //   );
    // }

    // Validate unit exists
    const unitDoc = await Unit.findById(unit);
    if (!unitDoc) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    // Validate teacher exists and has role 'teacher'
    const teacherDoc = await User.findById(teacher);
    if (!teacherDoc || teacherDoc.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Invalid teacher' },
        { status: 400 }
      );
    }

    // Check if teacher is assigned to this unit
    const teachingAssignment = await TeachingAssignment.findOne({
      teacher: teacher,
      course: unitDoc.course,
      semester: timetableDoc.semester
    });

    if (!teachingAssignment) {
      return NextResponse.json(
        { error: 'Teacher is not assigned to this course' },
        { status: 400 }
      );
    }

    // Check if teacher is assigned to the specific unit
    const isAssignedToUnit = teachingAssignment.units.some(
      u => u.unit.toString() === unit && u.isActive
    );

    if (!isAssignedToUnit) {
      return NextResponse.json(
        { error: 'Teacher is not assigned to this unit. Please assign the teacher to this unit in Teaching Assignments before creating a lecture.' },
        { status: 400 }
      );
    }

    // Check for time conflicts
    const query = {
      timetable: timetable,
      dayOfWeek: dayOfWeek,
      teacher: teacher
    };

    // Only check venue conflicts for non-online lectures
    if (!metadata?.isOnline && venue) {
      query.$or = [
        { teacher: teacher },
        { 'venue.building': venue.building, 'venue.room': venue.room }
      ];
    }

    const conflictingLectures = await Lecture.find(query);

    for (const conflictingLecture of conflictingLectures) {
      const hasConflict = await conflictingLecture.hasTimeConflict({ startTime, endTime, dayOfWeek });
      if (hasConflict) {
        return NextResponse.json(
          { 
            error: 'Time conflict detected',
            details: conflictingLecture.teacher.equals(teacher) 
              ? 'Teacher already has a lecture at this time'
              : 'Venue is already booked at this time'
          },
          { status: 400 }
        );
      }
    }

    // Create lecture
    const lecture = await Lecture.create({
      timetable,
      unit,
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      venue,
      lectureType: lectureType || 'lecture',
      isRecurring: isRecurring !== false,
      frequency: frequency || 'weekly',
      color: color || '#3B82F6',
      metadata: metadata || {}
    });

    // Populate references
    await lecture.populate([
      { path: 'timetable', select: 'semester course status' },
      { path: 'unit', select: 'name code' },
      { path: 'teacher', select: 'name email' }
    ]);

    return NextResponse.json(lecture, { status: 201 });
  } catch (error) {
    console.error('Error creating lecture:', error);
    return NextResponse.json(
      { error: 'Failed to create lecture' },
      { status: 500 }
    );
  }
}

// PUT /api/lectures - Update lecture
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
        { error: 'Lecture ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const {
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      venue,
      lectureType,
      isRecurring,
      frequency,
      color,
      metadata
    } = data;

    const lecture = await Lecture.findById(id).populate('timetable');
    if (!lecture) {
      return NextResponse.json(
        { error: 'Lecture not found' },
        { status: 404 }
      );
    }

    // Only allow updates to lectures in draft timetables
    // if (lecture.timetable.status !== 'draft') {
    //   return NextResponse.json(
    //     { error: 'Can only update lectures in draft timetables' },
    //     { status: 400 }
    //   );
    // }

    // Update fields
    if (teacher) lecture.teacher = teacher;
    if (dayOfWeek !== undefined) lecture.dayOfWeek = dayOfWeek;
    if (startTime) lecture.startTime = startTime;
    if (endTime) lecture.endTime = endTime;
    if (venue) lecture.venue = venue;
    if (lectureType) lecture.lectureType = lectureType;
    if (isRecurring !== undefined) lecture.isRecurring = isRecurring;
    if (frequency) lecture.frequency = frequency;
    if (color) lecture.color = color;
    if (metadata) lecture.metadata = { ...lecture.metadata, ...metadata };

    // Check for time conflicts if time/venue/teacher changed
    if (teacher || dayOfWeek !== undefined || startTime || endTime || venue) {
      const query = {
        _id: { $ne: id },
        timetable: lecture.timetable._id,
        dayOfWeek: lecture.dayOfWeek,
        teacher: lecture.teacher
      };

      // Only check venue conflicts for non-online lectures
      if (!lecture.metadata?.isOnline && lecture.venue) {
        query.$or = [
          { teacher: lecture.teacher },
          { 'venue.building': lecture.venue.building, 'venue.room': lecture.venue.room }
        ];
      }

      const conflictingLectures = await Lecture.find(query);

      for (const conflictingLecture of conflictingLectures) {
        const hasConflict = await lecture.hasTimeConflict(conflictingLecture);
        if (hasConflict) {
          return NextResponse.json(
            { 
              error: 'Time conflict detected after update',
              details: conflictingLecture.teacher.equals(lecture.teacher) 
                ? 'Teacher already has a lecture at this time'
                : 'Venue is already booked at this time'
            },
            { status: 400 }
          );
        }
      }
    }

    await lecture.save();

    // Populate references
    await lecture.populate([
      { path: 'timetable', select: 'semester course status' },
      { path: 'unit', select: 'name code' },
      { path: 'teacher', select: 'name email' }
    ]);

    return NextResponse.json(lecture);
  } catch (error) {
    console.error('Error updating lecture:', error);
    return NextResponse.json(
      { error: 'Failed to update lecture' },
      { status: 500 }
    );
  }
}

// DELETE /api/lectures - Delete lecture
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
        { error: 'Lecture ID is required' },
        { status: 400 }
      );
    }

    const lecture = await Lecture.findById(id).populate('timetable');
    if (!lecture) {
      return NextResponse.json(
        { error: 'Lecture not found' },
        { status: 404 }
      );
    }

    // Only allow deletion from draft timetables
    // if (lecture.timetable.status !== 'draft') {
    //   return NextResponse.json(
    //     { error: 'Can only delete lectures from draft timetables' },
    //     { status: 400 }
    //   );
    // }

    // Check if there are any lecture instances
    const LectureInstance = (await import('@/models/LectureInstance')).default;
    const instanceCount = await LectureInstance.countDocuments({ lecture: id });
    
    if (instanceCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete lecture with existing instances' },
        { status: 400 }
      );
    }

    await lecture.deleteOne();

    return NextResponse.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    return NextResponse.json(
      { error: 'Failed to delete lecture' },
      { status: 500 }
    );
  }
}
