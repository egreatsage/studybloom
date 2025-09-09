import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UnitRegistration from '@/models/UnitRegistration';
import Assignment from '@/models/Assignment';
import LectureInstance from '@/models/LectureInstance';
import Lecture from '@/models/Lecture';
import Course from '@/models/Course';
import Unit from '@/models/Unit';
    

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'parent') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Find the parent and populate their children's basic info
        const parent = await User.findById(session.user.id)
            .populate({
                path: 'children',
                select: 'name regNumber course photoUrl',
                populate: {
                    path: 'course',
                    select: 'name code'
                }
            })
            .lean();

        if (!parent || !parent.children) {
            return NextResponse.json({ childrenData: [] });
        }
        
        // Ensure children are unique before processing
        const uniqueChildren = Array.from(new Map(parent.children.map(child => [child._id.toString(), child])).values());

        // For each child, fetch their detailed academic records
        const childrenData = await Promise.all(uniqueChildren.map(async (child) => {
            // Get registered units for the current semester
            const unitRegistrations = await UnitRegistration.find({ student: child._id, status: 'active' })
                .populate({
                    path: 'unit',
                    populate: {
                        path: 'createdBy',
                        model: 'User',
                        select: 'name email phoneNumber'
                    }
                })
                .lean();

            // Get all assignment submissions
            const assignments = await Assignment.find({ course: child.course._id }).lean();
            const assignmentResults = assignments.map(asm => {
                const submission = asm.submissions.find(sub => sub.student.toString() === child._id.toString());
                return {
                    title: asm.title,
                    dueDate: asm.dueDate,
                    grade: submission?.grade,
                    submittedAt: submission?.submittedAt,
                };
            });
            
            // Get attendance summary
            const childLectures = await Lecture.find({ unit: { $in: unitRegistrations.map(ur => ur.unit._id) } }).select('_id');
            const lectureInstances = await LectureInstance.find({ lecture: { $in: childLectures.map(l => l._id) } }).lean();

            let attended = 0;
            let missed = 0;
            lectureInstances.forEach(instance => {
                const attendance = instance.attendance.find(a => a.student.toString() === child._id.toString());
                if (attendance) {
                    if (attendance.status === 'present' || attendance.status === 'late') {
                        attended++;
                    } else if (attendance.status === 'absent') {
                        missed++;
                    }
                }
            });

            return {
                ...child,
                registeredUnits: unitRegistrations.map(ur => ur.unit),
                assignmentResults,
                attendance: {
                    attended,
                    missed,
                    total: lectureInstances.length,
                }
            };
        }));

        return NextResponse.json({ childrenData });

    } catch (error) {
        console.error("Error fetching parent dashboard data:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}