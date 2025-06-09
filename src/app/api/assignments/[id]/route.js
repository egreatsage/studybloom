// src/app/api/assignments/[id]/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import TeachingAssignment from '@/models/TeachingAssignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import Unit from '@/models/Unit';
import Course from '@/models/Course';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const assignment = await Assignment.findById(id)
      .populate({
        path: 'unit',
        select: 'name code course'
      })
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .populate({
        path: 'submissions.student',
        model: 'User',
        select: 'name email photoUrl'
      });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    // --- MORE ROBUST AUTHORIZATION LOGIC ---
    if (session.user.role === 'teacher') {
      // First, check if the teacher is the creator (simplest case)
      const isCreator = assignment.createdBy?._id.toString() === session.user.id;

      if (!isCreator) {
        // If not the creator, check if they are an assigned teacher for the unit.
        
        // 1. Defensively check if the unit and its course exist.
        if (!assignment.unit || !assignment.unit.course) {
          console.error(`Data integrity issue: Assignment ${id} has a missing or invalid unit/course reference.`);
          return NextResponse.json({ error: 'Forbidden due to inconsistent assignment data.' }, { status: 403 });
        }

        // 2. Check for an active teaching assignment for this specific unit.
        const teachingAssignment = await TeachingAssignment.findOne({
            teacher: session.user.id,
            course: assignment.unit.course,
            units: { $elemMatch: { unit: assignment.unit._id, isActive: true } }
        });

        // 3. If no assignment is found, they do not have permission.
        if (!teachingAssignment) {
            return NextResponse.json({ error: 'Forbidden: You are not assigned to teach this unit.' }, { status: 403 });
        }
      }
    }
    console.log(assignment)
    return NextResponse.json(assignment);
    
  } catch (error) {
    // This will catch TypeErrors if they still occur.
    console.error('Error fetching assignment [ID Route]:', error);
    // Provide a more specific error message back to the client if possible.
    if (error instanceof TypeError) {
        return NextResponse.json({ error: `A server-side TypeError occurred: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch assignment due to a server error.' }, { status: 500 });
  }
}