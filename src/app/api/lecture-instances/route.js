import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LectureInstance from '@/models/LectureInstance';
import Lecture from '@/models/Lecture';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/lecture-instances?lectureId=...&date=...
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get('lectureId');
    const date = searchParams.get('date');

    if (!lectureId || !date) {
      return NextResponse.json({ error: 'lectureId and date are required' }, { status: 400 });
    }

    const queryDate = new Date(date);
    const nextDay = new Date(queryDate);
    nextDay.setDate(queryDate.getDate() + 1);

    const instances = await LectureInstance.find({
      lecture: lectureId,
      date: {
        $gte: queryDate,
        $lt: nextDay,
      },
    });

    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching lecture instances:', error);
    return NextResponse.json({ error: 'Failed to fetch lecture instances' }, { status: 500 });
  }
}

// POST /api/lecture-instances
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { lectureId, date } = await request.json();

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    const newInstance = await LectureInstance.create({
      lecture: lectureId,
      date: new Date(date),
      teacher: lecture.teacher, 
      venue: lecture.venue,
    });

    return NextResponse.json(newInstance, { status: 201 });
  } catch (error) {
    console.error('Error creating lecture instance:', error);
    return NextResponse.json({ error: 'Failed to create lecture instance' }, { status: 500 });
  }
}