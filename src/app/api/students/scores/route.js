import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
        }

        await connectDB();

        // Find all assignments for the given course
        const allAssessments = await Assignment.find({ course: courseId }).lean();
        
        const studentId = session.user.id;
        let totalScore = 0;
        
        const scoreBreakdown = {
            Assignment: { obtained: 0, total: 0, weight: 10 },
            CAT: { obtained: 0, total: 0, weight: 30 },
            Exam: { obtained: 0, total: 0, weight: 70 },
        };

        allAssessments.forEach(assessment => {
            const submission = assessment.submissions.find(s => s.student.toString() === studentId);
            const type = assessment.assessmentType;

            if (scoreBreakdown[type]) {
                scoreBreakdown[type].total += assessment.maxScore;
                if (submission && typeof submission.grade === 'number') {
                    scoreBreakdown[type].obtained += submission.grade;
                }
            }
        });

        // Calculate weighted score
        let finalWeightedScore = 0;
        for (const type in scoreBreakdown) {
            const { obtained, total, weight } = scoreBreakdown[type];
            if (total > 0) {
                finalWeightedScore += (obtained / total) * weight;
            }
        }

        return NextResponse.json({
            courseId,
            studentId,
            scoreBreakdown,
            totalScore: finalWeightedScore,
        });

    } catch (error) {
        console.error("Error fetching student scores:", error);
        return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
    }
}