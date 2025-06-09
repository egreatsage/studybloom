import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload a file buffer to Cloudinary
const bufferUpload = async (file) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    file.stream().on('data', (chunk) => {
      chunks.push(chunk);
    });
    file.stream().on('end', () => {
      const buffer = Buffer.concat(chunks);
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "submissions" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    file.stream().on('error', (error) => reject(error));
  });
};

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assignmentId } = params;
    const formData = await request.formData();
    const files = formData.getAll('files');
    const comment = formData.get('comment');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for submission.' }, { status: 400 });
    }

    await connectDB();
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Upload files to Cloudinary
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await bufferUpload(file);
        return { url: uploadResult.secure_url, name: file.name };
      })
    );

    // Check if the student has already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === session.user.id
    );

    const newSubmission = {
      student: session.user.id,
      files: uploadedFiles,
      comment: comment,
      submittedAt: new Date(),
    };

    if (existingSubmissionIndex > -1) {
      // Update existing submission if resubmitting
      assignment.submissions[existingSubmissionIndex] = newSubmission;
    } else {
      // Add new submission
      assignment.submissions.push(newSubmission);
    }

    await assignment.save();

    // Populate the assignment to return the full data
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('submissions.student', 'name email');

    return NextResponse.json(populatedAssignment, { status: 200 });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 });
  }
}