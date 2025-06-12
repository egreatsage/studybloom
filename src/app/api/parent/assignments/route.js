import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Assignment from '@/models/Assignment';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'parent') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const parent = await User.findById(session.user.id).populate('children', 'name course');

        if (!parent || !parent.children || parent.children.length === 0) {
            return NextResponse.json([]);
        }

        const childrenAssignments = await Promise.all(parent.children.map(async (child) => {
            const assignments = await Assignment.find({ course: child.course })
                .populate('unit', 'name code')
                .lean();

            const assignmentsWithSubmissions = assignments.map(assignment => {
                const submission = assignment.submissions.find(sub => sub.student.toString() === child._id.toString());
                return {
                    ...assignment,
                    submission: submission || null
                };
            });
            
            return {
                childId: child._id,
                childName: child.name,
                assignments: assignmentsWithSubmissions
            };
        }));

        return NextResponse.json(childrenAssignments);

    } catch (error) {
        console.error("Error fetching assignments for parent:", error);
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
    }
}