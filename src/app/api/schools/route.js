import connectDB from '@/lib/mongodb';
import School from '@/models/School';
import { NextResponse } from 'next/server';

// GET all schools
export async function GET() {
  try {
    await connectDB();
    const schools = await School.find().sort({ createdAt: -1 });
    return NextResponse.json({ schools }, { status: 200 });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST new school
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    if (!data.name || !data.dean) {
      return NextResponse.json({ error: 'Name and dean are required' }, { status: 400 });
    }

    const school = new School(data);
    await school.save();

    return NextResponse.json({ message: 'School created successfully', school }, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'School with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update school
export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const school = await School.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'School updated successfully', school }, { status: 200 });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE school
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const school = await School.findByIdAndDelete(id);

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'School deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
