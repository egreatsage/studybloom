import { NextResponse } from 'next/server';
import Semester from '@/models/Semester';
import connectDB from '@/lib/mongodb';

export async function POST(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    const { courseIds } = await request.json();

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    // Add courses to semester if not already present
    courseIds.forEach((courseId) => {
      if (!semester.courses.includes(courseId)) {
        semester.courses.push(courseId);
      }
    });

    await semester.save();
    await semester.populate('courses');

    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  await connectDB();
  try {
    const { semesterId } = await context.params;
    const { courseIds } = await request.json();

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }

    // Remove courses from semester
    semester.courses = semester.courses.filter(
      (courseId) => !courseIds.includes(courseId.toString())
    );

    await semester.save();
    await semester.populate('courses');

    return NextResponse.json({ semester });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
