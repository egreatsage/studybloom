import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LectureInstance from '@/models/LectureInstance';
import Lecture from '@/models/Lecture';
import UnitRegistration from '@/models/UnitRegistration';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'parent') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const parent = await User.findById(session.user.id).populate('children');
        if (!parent || !parent.children || parent.children.length === 0) {
            return NextResponse.json([]);
        }

        const childrenAttendanceSummary = await Promise.all(parent.children.map(async (child) => {
            // Find all lecture instances where the child has an attendance record
            const instances = await LectureInstance.find({ 'attendance.student': child._id })
                .populate({
                    path: 'lecture',
                    populate: { path: 'unit', select: 'name code' }
                })
                .lean();

            const summary = {
                total: instances.length,
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                byUnit: {}
            };

            instances.forEach(instance => {
                const studentAttendance = instance.attendance.find(a => a.student.equals(child._id));
                if (studentAttendance) {
                    summary[studentAttendance.status]++;
                    
                    const unitId = instance.lecture.unit._id.toString();
                    if (!summary.byUnit[unitId]) {
                        summary.byUnit[unitId] = {
                            unit: instance.lecture.unit,
                            present: 0,
                            total: 0,
                        };
                    }
                    summary.byUnit[unitId].total++;
                    if (studentAttendance.status === 'present' || studentAttendance.status === 'late') {
                        summary.byUnit[unitId].present++;
                    }
                }
            });

            const unitSummary = Object.values(summary.byUnit).map(s => ({
                ...s,
                percentage: s.total > 0 ? (s.present / s.total) * 100 : 100
            }));
            
            const overallPercentage = summary.total > 0 ? ((summary.present + summary.late) / summary.total) * 100 : 100;

            return {
                childId: child._id,
                childName: child.name,
                overallPercentage,
                ...summary,
                byUnit: unitSummary
            };
        }));

        return NextResponse.json(childrenAttendanceSummary);

    } catch (error) {
        console.error("Error fetching attendance summary for parent:", error);
        return NextResponse.json({ error: "Failed to fetch attendance summary" }, { status: 500 });
    }
}