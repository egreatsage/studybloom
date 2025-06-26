import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Venue from '@/models/Venue';

// GET /api/venues - List all venues
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const building = searchParams.get('building');
    const type = searchParams.get('type');

    const query = {};
    if (building) query.building = building;
    if (type) query.type = type;

    const venues = await Venue.find(query).sort({ building: 1, room: 1 });

    return NextResponse.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

// POST /api/venues - Create venue
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { building, room, type } = data;

    // Validate required fields
    if (!building || !room) {
      return NextResponse.json(
        { error: 'Building and room are required' },
        { status: 400 }
      );
    }

    // Check if venue already exists
    const existingVenue = await Venue.findOne({ building, room });
    if (existingVenue) {
      return NextResponse.json(
        { error: 'Venue already exists' },
        { status: 400 }
      );
    }

    // Create venue
    const venue = await Venue.create({
      building,
      room,
      type: type || 'lecture_hall'
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}

// PUT /api/venues - Update venue
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { building, room, type } = data;

    const venue = await Venue.findById(id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (building) venue.building = building;
    if (room) venue.room = room;
    if (type) venue.type = type;

    await venue.save();

    return NextResponse.json(venue);
  } catch (error) {
    console.error('Error updating venue:', error);
    return NextResponse.json(
      { error: 'Failed to update venue' },
      { status: 500 }
    );
  }
}

// DELETE /api/venues - Delete venue
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      );
    }

    const venue = await Venue.findById(id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check if venue is used in any lectures
    const Lecture = (await import('@/models/Lecture')).default;
    const lectureCount = await Lecture.countDocuments({
      'venue.building': venue.building,
      'venue.room': venue.room
    });

    if (lectureCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete venue that is used in lectures' },
        { status: 400 }
      );
    }

    await venue.deleteOne();

    return NextResponse.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    );
  }
}
