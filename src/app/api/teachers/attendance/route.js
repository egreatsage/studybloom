import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import LectureInstance from '@/models/LectureInstance';
import User from '@/models/User';
import Unit from '@/models/Unit';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all lectures taught by the current teacher
    const lectures = await Lecture.find({ teacher: session.user.id }).select('_id');
    const lectureIds = lectures.map(l => l._id);

    // Find all lecture instances for those lectures
    const instances = await LectureInstance.find({ lecture: { $in: lectureIds } })
      .populate({
        path: 'lecture',
        select: 'unit startTime endTime',
        populate: {
          path: 'unit',
          select: 'name code'
        }
      })
      .populate('attendance.student', 'name email')
      .sort({ date: -1 });

    // Flatten the data to a list of attendance records
    const attendanceRecords = [];
    instances.forEach(instance => {
      instance.attendance.forEach(record => {
        attendanceRecords.push({
          _id: `${instance._id}-${record.student._id}`,
          student: record.student,
          date: instance.date,
          lecture: instance.lecture,
          status: record.status,
          checkedInAt: record.checkedInAt
        });
      });
    });

    return NextResponse.json(attendanceRecords);

  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}