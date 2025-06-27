// src/app/api/teachers/attendance-report/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import LectureInstance from '@/models/LectureInstance';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['teacher', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    // Add unitId to the search params
    const unitId = searchParams.get('unitId');

    if (!startDate || !endDate || !unitId) {
        return NextResponse.json({ error: 'startDate, endDate, and unitId are required' }, { status: 400 });
    }

    // Find all lectures for the current teacher and the specified unit
    const lectures = await Lecture.find({ 
        teacher: session.user.id,
        unit: unitId 
    }).select('_id');

    const lectureIds = lectures.map(l => l._id);

    // Find all lecture instances within the date range for those lectures
    const instances = await LectureInstance.find({
      lecture: { $in: lectureIds },
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: 'completed' // Only include completed lectures in the report
    })
    .populate({
        path: 'lecture',
        select: 'unit startTime endTime',
        populate: {
            path: 'unit',
            select: 'name code'
        }
    })
    // Populate student name and regNumber for the report
    .populate('attendance.student', 'name regNumber phoneNumber email') 
    .sort({ date: 1, 'lecture.startTime': 1 });

    // Group instances by date
    const reportData = instances.reduce((acc, instance) => {
        const date = new Date(instance.date).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(instance);
        return acc;
    }, {});

    return NextResponse.json({ reportData, teacherName: session.user.name });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance report' },
      { status: 500 }
    );
  }
}