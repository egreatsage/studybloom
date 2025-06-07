import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lecture from '@/models/Lecture';
import UnitRegistration from '@/models/UnitRegistration';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { lectureId } = params;

    // Find the lecture and populate necessary details
    const lecture = await Lecture.findById(lectureId).populate({
      path: 'timetable',
      select: 'semester course',
    });

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // A teacher can only get student lists for their own lectures
    if (session.user.role === 'teacher' && lecture.teacher.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find active unit registrations for the lecture's unit and semester
    const registrations = await UnitRegistration.find({
      unit: lecture.unit,
      semester: lecture.timetable.semester,
      status: 'active',
    }).populate('student', 'name email photoUrl');

    const students = registrations.map(reg => reg.student);

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students for lecture:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}