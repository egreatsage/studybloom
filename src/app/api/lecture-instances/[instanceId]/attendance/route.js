import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LectureInstance from '@/models/LectureInstance';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { instanceId } = params;
    const { attendances } = await request.json(); // Expecting { attendances: [{ studentId, status }] }

    if (!attendances || !Array.isArray(attendances)) {
      return NextResponse.json({ error: 'Invalid attendance data' }, { status: 400 });
    }

    const lectureInstance = await LectureInstance.findById(instanceId).populate('lecture');

    if (!lectureInstance) {
      return NextResponse.json({ error: 'Lecture instance not found' }, { status: 404 });
    }

    // Ensure the user is the assigned teacher or an admin
    if (session.user.role === 'teacher' && lectureInstance.lecture.teacher.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update attendance records in a single operation
    for (const record of attendances) {
      const { studentId, status } = record;
      const existingIndex = lectureInstance.attendance.findIndex(
        a => a.student.toString() === studentId
      );

      if (existingIndex >= 0) {
        // Update existing record
        lectureInstance.attendance[existingIndex].status = status;
        if (status === 'present' || status === 'late') {
          lectureInstance.attendance[existingIndex].checkedInAt = new Date();
        } else {
          lectureInstance.attendance[existingIndex].checkedInAt = null;
        }
      } else {
        // Add new record
        lectureInstance.attendance.push({
          student: studentId,
          status: status,
          checkedInAt: (status === 'present' || status === 'late') ? new Date() : null
        });
      }
    }

    // Mark the lecture as completed if it wasn't already
    if(lectureInstance.status === 'scheduled') {
        lectureInstance.status = 'completed';
    }

    const updatedInstance = await lectureInstance.save();

    return NextResponse.json(updatedInstance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}