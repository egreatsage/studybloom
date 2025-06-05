import { NextResponse } from 'next/server';
import Course from '@/models/Course';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();
    // Populate school and department fields for courses
    const courses = await Course.find({})
      .populate('school', 'name')
      .populate('department', 'name');
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, code, description, school, department } = body;

    if (!name || !code || !description || !school || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if course code already exists in the same school
    const existingCourse = await Course.findOne({ code, school });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course code already exists in this school' },
        { status: 400 }
      );
    }

    const course = await Course.create({
      name,
      code,
      description,
      school,
      department
    });

    // Populate school and department details
    await course.populate([
      { path: 'school', select: 'name' },
      { path: 'department', select: 'name' }
    ]);

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, code, description, school, department } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (name) course.name = name;
    if (code) course.code = code;
    if (description) course.description = description;
    if (school) course.school = school;
    if (department) course.department = department;

    // If code is being updated, check for uniqueness within the school
    if (code) {
      const existingCourse = await Course.findOne({
        _id: { $ne: id }, // exclude current course
        code,
        school: course.school
      });
      if (existingCourse) {
        return NextResponse.json(
          { error: 'Course code already exists in this school' },
          { status: 400 }
        );
      }
    }

    await course.save();

    // Populate school and department details
    await course.populate([
      { path: 'school', select: 'name' },
      { path: 'department', select: 'name' }
    ]);

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get course ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
