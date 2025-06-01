import connectDB from '@/lib/mongodb';
import Department from '@/models/Department';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    const filter = schoolId ? { school: schoolId } : {};
    
    const departments = await Department.find(filter)
      .populate('school', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ departments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const formData = await request.formData();
    const school = formData.get('school');
    const name = formData.get('name');
    const head = formData.get('head');

    if (!school || !name || !head) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const department = new Department({
      school,
      name,
      head
    });

    await department.save();
    await department.populate('school', 'name');

    return NextResponse.json(
      { message: 'Department created successfully', department },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const updateData = {};

    for (const [key, value] of formData.entries()) {
      if (value) {
        updateData[key] = value;
      }
    }

    const department = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('school', 'name');

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Department updated successfully', department },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Department deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
