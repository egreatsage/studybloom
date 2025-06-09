// src/app/api/teachers/attendance/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import LectureInstance from '@/models/LectureInstance';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the query to find lectures for the teacher
    const lectureQuery = { teacher: session.user.id };
    if (unitId) {
      lectureQuery.unit = unitId;
    }

    const lectures = await Lecture.find(lectureQuery).select('_id');
    const lectureIds = lectures.map(l => l._id);

    // Build the query for lecture instances
    const instanceQuery = { lecture: { $in: lectureIds } };
    if (startDate && endDate) {
      instanceQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const instances = await LectureInstance.find(instanceQuery)
      .populate({
        path: 'lecture',
        select: 'unit startTime endTime',
        populate: {
          path: 'unit',
          select: 'name code'
        }
      })
      // Populate more student details
      .populate('attendance.student', 'name email regNumber phoneNumber')
      .sort({ date: -1 });

    // Flatten the data
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