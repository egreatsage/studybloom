'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaEnvelope, FaUser, FaBook, FaArrowLeft, FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function ContactTeacher() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    teacherEmail: '',
    teacherName: '',
    unitName: '',
    studentName: '',
    studentEmail: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  // Populate form data from URL parameters
  useEffect(() => {
    const teacherEmail = searchParams.get('email');
    const teacherName = searchParams.get('name');
    const unitName = searchParams.get('unit');
    
    if (teacherEmail || teacherName || unitName) {
      setFormData(prev => ({
        ...prev,
        teacherEmail: teacherEmail || '',
        teacherName: teacherName || '',
        unitName: unitName || ''
      }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.teacherEmail.trim()) {
      newErrors.teacherEmail = 'Teacher email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.teacherEmail)) {
      newErrors.teacherEmail = 'Please enter a valid email address';
    }
    
    if (!formData.teacherName.trim()) {
      newErrors.teacherName = 'Teacher name is required';
    }
    
    if (!formData.unitName.trim()) {
      newErrors.unitName = 'Unit name is required';
    }
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Your name is required';
    }
    
    if (!formData.studentEmail.trim()) {
      newErrors.studentEmail = 'Your email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.studentEmail)) {
      newErrors.studentEmail = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/parent/contact-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setFormData({
          teacherEmail: formData.teacherEmail,
          teacherName: formData.teacherName,
          unitName: formData.unitName,
          studentName: '',
          studentEmail: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Failed to send email:', result.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <FaEnvelope className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Teacher</h1>
            <p className="text-gray-600">Send a message to your instructor</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Teacher Info Header */}
          {(formData.teacherName || formData.teacherEmail || formData.unitName) && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
              <div className="text-white">
                <h2 className="text-xl font-bold mb-2">Message Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {formData.teacherName && (
                    <div className="flex items-center gap-2">
                      <FaUser className="text-blue-200" />
                      <span>{formData.teacherName}</span>
                    </div>
                  )}
                  {formData.teacherEmail && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-blue-200" />
                      <span>{formData.teacherEmail}</span>
                    </div>
                  )}
                  {formData.unitName && (
                    <div className="flex items-center gap-2">
                      <FaBook className="text-blue-200" />
                      <span>{formData.unitName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Teacher Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Teacher Information
                </h3>
                
                <div>
                  <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Name *
                  </label>
                  <input
                    type="text"
                    id="teacherName"
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.teacherName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter teacher's name"
                  />
                  {errors.teacherName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.teacherName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="teacherEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Email *
                  </label>
                  <input
                    type="email"
                    id="teacherEmail"
                    name="teacherEmail"
                    value={formData.teacherEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.teacherEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="teacher@example.com"
                  />
                  {errors.teacherEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.teacherEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Name *
                  </label>
                  <input
                    type="text"
                    id="unitName"
                    name="unitName"
                    value={formData.unitName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.unitName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter unit name"
                  />
                  {errors.unitName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.unitName}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Student Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Your Information
                </h3>
                
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.studentName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.studentName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.studentName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="studentEmail"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.studentEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.studentEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.studentEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter message subject"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mt-8">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                  errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Type your message here..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {errors.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.message.length} characters (minimum 10 required)
              </p>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <FaCheckCircle className="text-green-500 text-lg" />
                <div>
                  <p className="text-green-800 font-medium">Message sent successfully!</p>
                  <p className="text-green-600 text-sm">Your teacher will receive your message shortly.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <FaExclamationTriangle className="text-red-500 text-lg" />
                <div>
                  <p className="text-red-800 font-medium">Failed to send message</p>
                  <p className="text-red-600 text-sm">Please try again later or contact support.</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Make sure to provide a clear subject and detailed message. 
            Your teacher will be able to reply directly to your email address.
          </p>
        </div>
      </div>
    </div>
  );
}