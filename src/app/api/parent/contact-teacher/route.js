// app/api/contact-teacher/route.js

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import TeacherNotification from '@/models/TeacherNotification';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// Configure nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    // Gmail configuration
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password
    },
    // Alternative SMTP configuration
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    // secure: process.env.SMTP_SECURE === 'true',
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
  });
};

export async function POST(request) {
  try {
    const { teacherEmail, teacherName, unitName, studentName, studentEmail, subject, message } = await request.json();

    // Validate required fields
    if (!teacherEmail || !teacherName || !unitName || !studentName || !studentEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherEmail) || !emailRegex.test(studentEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    // Email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Parent Message</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .info-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            color: white;
          }
          .info-item {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
          }
          .info-item:last-child {
            margin-bottom: 0;
          }
          .info-label {
            font-weight: 600;
            min-width: 80px;
            margin-right: 10px;
          }
          .message-content {
            background-color: #f8fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-style: italic;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }
          .badge {
            display: inline-block;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .content {
              padding: 20px;
            }
            .header {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Prent Message</h1>
            <p>You have received a new message from one of your student's parent</p>
          </div>
          
          <div class="content">
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">👨‍🎓 Student:</span>
                <span>${studentName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📧 Email:</span>
                <span>${studentEmail}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📚 Unit:</span>
                <span>${unitName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📝 Subject:</span>
                <span>${subject}</span>
              </div>
            </div>

            <h3>Message Content:</h3>
            <div class="message-content">
              "${message}"
            </div>

            <p>You can reply directly to this email to respond to the student.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <span class="badge">Student Portal System</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent through the Student Portal System</p>
            <p>Please do not reply to this email if you're not the intended recipient</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textTemplate = `
      Student Message
      
      You have received a new message from one of your students.
      
      Student Details:
      - Name: ${studentName}
      - Email: ${studentEmail}
      - Unit: ${unitName}
      - Subject: ${subject}
      
      Message:
      ${message}
      
      You can reply directly to this email to respond to the student.
      
      ---
      This message was sent through the Student Portal System
    `;

    // Mail options
    const mailOptions = {
      from: {
        name: 'Student Portal System',
        address: studentEmail,
      },
      to: teacherEmail,
      replyTo: studentEmail,
      subject: `Student Message: ${subject} - ${unitName}`,
      text: textTemplate,
      html: htmlTemplate,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Mailer': 'Student Portal System',
      },
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Store notification in database
    await connectDB();
    
    // Find teacher by email
    const teacher = await User.findOne({ email: teacherEmail, role: 'teacher' });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Create notification
    const notification = await TeacherNotification.create({
      teacher: teacher._id,
      studentName,
      studentEmail,
      unitName,
      subject,
      message
    });

    console.log('Email sent and notification stored:', info.messageId);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent and notification stored successfully',
        messageId: info.messageId,
        notificationId: notification._id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Handle specific error types
    if (error.code === 'EAUTH') {
      return NextResponse.json(
        { error: 'Email authentication failed. Please check your email credentials.' },
        { status: 500 }
      );
    }
    
    if (error.code === 'ECONNECTION') {
      return NextResponse.json(
        { error: 'Failed to connect to email server. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to send email. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}