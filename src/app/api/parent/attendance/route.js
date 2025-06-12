import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LectureInstance from '@/models/LectureInstance';
import Lecture from '@/models/Lecture';
import Unit from '@/models/Unit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'parent') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const parent = await User.findById(session.user.id).populate('children', 'name');

        if (!parent || !parent.children || parent.children.length === 0) {
            return NextResponse.json([]);
        }

        const childrenAttendance = await Promise.all(parent.children.map(async (child) => {
            const instances = await LectureInstance.find({ "attendance.student": child._id })
                .populate({
                    path: 'lecture',
                    populate: { path: 'unit', select: 'name code' }
                })
                .sort({ date: -1 })
                .lean();

            const attendanceRecords = instances.map(instance => {
                const studentAttendance = instance.attendance.find(a => a.student.equals(child._id));
                return {
                    childId: child._id,
                    childName: child.name,
                    date: instance.date,
                    unitName: instance.lecture.unit.name,
                    unitCode: instance.lecture.unit.code,
                    status: studentAttendance.status
                };
            });

            return {
                childId: child._id,
                childName: child.name,
                records: attendanceRecords
            };
        }));

        return NextResponse.json(childrenAttendance);

    } catch (error) {
        console.error("Error fetching attendance for parent:", error);
        return NextResponse.json({ error: "Failed to fetch attendance data" }, { status: 500 });
    }
}