import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import LectureInstance from '@/models/LectureInstance';
import UnitRegistration from '@/models/UnitRegistration';
import Lecture from '@/models/Lecture';
import Unit from '@/models/Unit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // 1. Find all lecture instances where the student has an attendance record.
        const instances = await LectureInstance.find({ 
            'attendance.student': session.user.id 
        })
        .populate({
            path: 'lecture',
            select: 'unit',
            populate: {
                path: 'unit',
                select: 'name code'
            }
        })
        .sort({ date: -1 })
        .lean();

        // 2. Format the data for the frontend.
        const attendanceLog = instances.map(instance => {
            const studentAttendance = instance.attendance.find(a => a.student.equals(session.user.id));
            return {
                _id: instance._id + '-' + session.user.id, // Create a unique key
                date: instance.date,
                unit: instance.lecture.unit,
                status: studentAttendance.status
            };
        });

        return NextResponse.json(attendanceLog);

    } catch (error) {
        console.error("Error fetching detailed attendance for student:", error);
        return NextResponse.json({ error: "Failed to fetch attendance log" }, { status: 500 });
    }
}