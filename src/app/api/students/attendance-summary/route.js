import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import LectureInstance from '@/models/LectureInstance';
import UnitRegistration from '@/models/UnitRegistration';
import Lecture from '@/models/Lecture';
import Unit from '@/models/Unit';


export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Find all active registrations for the student for the current semester
        const registrations = await UnitRegistration.find({
            student: session.user.id,
            status: 'active'
        }).populate('unit', 'name code');

        if (registrations.length === 0) {
            return NextResponse.json({ overallPercentage: 100, totalInstances: 0, totalPresent: 0, byUnit: [] });
        }
        
        const unitIds = registrations.map(reg => reg.unit._id);

        // Find all lecture instances for the student's registered units that have already passed
        const lectures = await Lecture.find({ unit: { $in: unitIds } }).select('_id');
        const lectureIds = lectures.map(l => l._id);

        const instances = await LectureInstance.find({
            lecture: { $in: lectureIds },
            date: { $lte: new Date() } // Only count past or current lectures
        }).populate({
            path: 'lecture',
            select: 'unit'
        });

        let totalPresent = 0;
        let totalInstances = 0;
        const byUnit = {};

        registrations.forEach(reg => {
            byUnit[reg.unit._id] = {
                unit: reg.unit,
                present: 0,
                total: 0
            };
        });

        instances.forEach(instance => {
            const unitId = instance.lecture.unit.toString();
            const attendanceRecord = instance.attendance.find(a => a.student.toString() === session.user.id);
            
            if (byUnit[unitId]) {
                byUnit[unitId].total++;
                totalInstances++;
                if (attendanceRecord && (attendanceRecord.status === 'present' || attendanceRecord.status === 'late')) {
                    byUnit[unitId].present++;
                    totalPresent++;
                }
            }
        });
        
        const unitSummary = Object.values(byUnit).map(summary => ({
            ...summary,
            percentage: summary.total > 0 ? (summary.present / summary.total) * 100 : 100,
        }));

        const overallPercentage = totalInstances > 0 ? (totalPresent / totalInstances) * 100 : 100;

        return NextResponse.json({
            overallPercentage,
            totalInstances,
            totalPresent,
            byUnit: unitSummary,
        });

    } catch (error) {
        console.error('Error fetching attendance summary:', error);
        return NextResponse.json({ error: 'Failed to fetch attendance summary' }, { status: 500 });
    }
}