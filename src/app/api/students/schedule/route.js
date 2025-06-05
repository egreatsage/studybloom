import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import Timetable from '@/models/Timetable';
import UnitRegistration from '@/models/UnitRegistration';
import LectureInstance from '@/models/LectureInstance';

// GET /api/students/schedule - Get student's schedule based on registered units
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get student's registered units
    const registrationQuery = {
      student: session.user.id,
      status: 'active'
    };
    if (semesterId) registrationQuery.semester = semesterId;

    const registrations = await UnitRegistration.find(registrationQuery)
      .populate('unit', '_id name code')
      .populate('semester', '_id name');

    const registeredUnitIds = registrations.map(r => r.unit._id);
    const semesterIds = [...new Set(registrations.map(r => r.semester._id))];

    if (registeredUnitIds.length === 0) {
      return NextResponse.json({
        lectures: [],
        weeklySchedule: {
          0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
        },
        instances: [],
        summary: {
          totalLectures: 0,
          totalInstances: 0,
          registeredUnits: 0
        }
      });
    }

    // Get published timetables for the student's semesters
    const timetables = await Timetable.find({
      semester: { $in: semesterIds },
      status: 'published'
    }).select('_id');

    const timetableIds = timetables.map(t => t._id);

    // Get all lectures for registered units
    const lectures = await Lecture.find({
      unit: { $in: registeredUnitIds },
      timetable: { $in: timetableIds }
    })
      .populate('timetable', 'semester course effectiveFrom effectiveTo')
      .populate('unit', 'name code')
      .populate('teacher', 'name email')
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
        .populate('teacher', 'name email')
        .populate({
          path: 'lecture',
          populate: {
            path: 'unit',
            select: 'name code'
          }
        })
        .sort({ date: 1 });

      // Add attendance status for the student
      instances = instances.map(instance => {
        const attendance = instance.attendance.find(
          a => a.student.toString() === session.user.id
        );
        return {
          ...instance.toObject(),
          myAttendance: attendance ? attendance.status : null
        };
      });
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

    // Check for time conflicts
    const conflicts = [];
    for (let day = 0; day < 7; day++) {
      const dayLectures = weeklySchedule[day];
      for (let i = 0; i < dayLectures.length; i++) {
        for (let j = i + 1; j < dayLectures.length; j++) {
          const lecture1 = dayLectures[i];
          const lecture2 = dayLectures[j];
          
          const hasConflict = await lecture1.hasTimeConflict(lecture2);
          if (hasConflict) {
            conflicts.push({
              day: day,
              lecture1: {
                unit: lecture1.unit.name,
                time: `${lecture1.startTime} - ${lecture1.endTime}`
              },
              lecture2: {
                unit: lecture2.unit.name,
                time: `${lecture2.startTime} - ${lecture2.endTime}`
              }
            });
          }
        }
      }
    }

    return NextResponse.json({
      lectures,
      weeklySchedule,
      instances,
      conflicts,
      summary: {
        totalLectures: lectures.length,
        totalInstances: instances.length,
        registeredUnits: registeredUnitIds.length,
        hasConflicts: conflicts.length > 0
      }
    });
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student schedule' },
      { status: 500 }
    );
  }
}
