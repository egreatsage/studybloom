import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import Timetable from '@/models/Timetable';
import LectureInstance from '@/models/LectureInstance';

// GET /api/teachers/schedule - Get teacher's schedule
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query for timetables
    const timetableQuery = { status: 'published' };
    if (semesterId) timetableQuery.semester = semesterId;

    // Get all published timetables
    const timetables = await Timetable.find(timetableQuery).select('_id');
    const timetableIds = timetables.map(t => t._id);

    // Get all lectures for this teacher
    const lectures = await Lecture.find({
      teacher: session.user.id,
      timetable: { $in: timetableIds }
    })
      .populate('timetable', 'semester course effectiveFrom effectiveTo')
      .populate('unit', 'name code')
      .populate({
        path: 'timetable',
        populate: {
          path: 'semester',
          select: 'name startDate endDate'
        }
      })
      .populate({
        path: 'timetable',
        populate: {
          path: 'course',
          select: 'name code'
        }
      })
      .sort({ dayOfWeek: 1, startTime: 1 });

    // If date range is specified, also get lecture instances
    let instances = [];
    if (startDate && endDate) {
      instances = await LectureInstance.find({
        lecture: { $in: lectures.map(l => l._id) },
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
        .populate('lecture')
        .populate({
          path: 'lecture',
          populate: {
            path: 'unit',
            select: 'name code'
          }
        })
        .sort({ date: 1 });
    }

    // Group lectures by day for weekly view
    const weeklySchedule = {
      0: [], // Sunday
      1: [], // Monday
      2: [], // Tuesday
      3: [], // Wednesday
      4: [], // Thursday
      5: [], // Friday
      6: []  // Saturday
    };

    lectures.forEach(lecture => {
      weeklySchedule[lecture.dayOfWeek].push(lecture);
    });

    return NextResponse.json({
      lectures,
      weeklySchedule,
      instances,
      summary: {
        totalLectures: lectures.length,
        totalInstances: instances.length,
        courses: [...new Set(lectures.map(l => l.timetable.course._id))].length,
        units: [...new Set(lectures.map(l => l.unit._id))].length
      }
    });
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher schedule' },
      { status: 500 }
    );
  }
}
