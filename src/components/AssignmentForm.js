'use client';

import { useForm, Controller } from 'react-hook-form';
import { FaSpinner, FaUpload, FaFileAlt, FaTimes, FaCheck, FaCalendarAlt, FaEdit } from 'react-icons/fa';
import { handleError, handleSuccess, validateFileUpload } from '@/lib/utils/errorHandler';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

// --- NEW ---
const assessmentTypes = [
  { value: 'Assignment', label: 'Assignment (10 Mks)', maxScore: 10 },
  { value: 'CAT', label: 'CAT (30 Mks)', maxScore: 30 },
  { value: 'Exam', label: 'Exam (70 Mks)', maxScore: 70 },
];
// --- END NEW ---

const AssignmentForm = ({ onSubmit, loading, onClose, defaultValues, unitId }) => {
  const {
    register,
    handleSubmit,
    reset,
    control, // --- NEW ---
    watch,   // --- NEW ---
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      dueDate: '',
      unitId: unitId || '',
      fileUrl: '',
      assessmentType: 'Assignment', // --- NEW ---
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(defaultValues?.fileUrl || null);
  const [fileName, setFileName] = useState(null);

  // --- NEW ---
  const selectedAssessmentType = watch('assessmentType');
  const maxScore = assessmentTypes.find(t => t.value === selectedAssessmentType)?.maxScore || 10;
  // --- END NEW ---

  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      setFileUrl(defaultValues.fileUrl);
    } else if (unitId) {
      reset({ unitId, assessmentType: 'Assignment' });
    }
  }, [defaultValues, unitId, reset]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      validateFileUpload(file, {
          maxSize: 15 * 1024 * 1024, // 15MB
          allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
          ]
      });

      setIsUploading(true);
      const toastId = toast.loading('Uploading file...');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('File upload failed');

      const data = await res.json();
      setFileUrl(data.imageUrl);
      setFileName(file.name);
      toast.success('File uploaded!', { id: toastId, duration: 2000 });
    } catch (error) {
        handleError(error, 'Upload failed. Please try again.');
        event.target.value = ''; // Reset file input
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmitHandler = async (data) => {
    try {
      await onSubmit({ ...data, fileUrl });
      onClose();
    } catch (error) {
      handleError(error, 'Failed to save assignment');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-5xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaEdit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {defaultValues ? 'Edit Assessment' : 'Create Assessment'}
                  </h2>
                  <p className="text-blue-100 text-sm">Fill in the details below</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-8">
              {/* --- MODIFIED SECTION --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Assessment Type
                  </label>
                  <select
                    {...register('assessmentType', { required: 'Please select an assessment type' })}
                    className="w-full px-4 py-3 bg-gray-50/50 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:bg-white border-gray-200 focus:border-blue-500 hover:border-gray-300"
                  >
                    {assessmentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    {...register('title', {
                      required: 'Title is required',
                      minLength: { value: 3, message: 'Title must be at least 3 characters' }
                    })}
                    className={`w-full px-4 py-3 bg-gray-50/50 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:bg-white ${
                      errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                    }`}
                    placeholder="e.g., Mid-term CAT"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">⚠️ {errors.title.message}</p>}
                </div>
              </div>
              {/* --- END MODIFIED SECTION --- */}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Instructions
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Instructions are required',
                    minLength: { value: 10, message: 'Instructions must be at least 10 characters' }
                  })}
                  rows={5}
                  className={`w-full px-4 py-3 bg-gray-50/50 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:bg-white resize-y ${
                    errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                  }`}
                  placeholder="Provide detailed instructions..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">⚠️ {errors.description.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Attach File (Optional)
                  </label>
                  <div className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    isUploading ? 'border-blue-300 bg-blue-50' : 
                    fileUrl ? 'border-green-300 bg-green-50' : 
                    'border-gray-300 hover:border-gray-400 bg-gray-50/30'
                  }`}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      disabled={isUploading}
                    />
                    <div className="p-6 text-center">
                      {isUploading ? (
                        <div className="flex flex-col items-center space-y-2">
                          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
                          <p className="text-sm text-blue-600 font-medium">Uploading...</p>
                        </div>
                      ) : fileUrl ? (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaFileAlt className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-green-600 font-medium">{fileName || 'File uploaded'}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setFileUrl(null);
                                setFileName(null);
                              }}
                              className="text-xs text-red-500 hover:text-red-600 mt-1"
                            >
                              Remove file
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaUpload className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Drop your file here or click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 15MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Due Date & Max Score */}
                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <FaCalendarAlt className="w-4 h-4 text-blue-600" />
                      <span>Due Date</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register('dueDate', {
                        required: 'Due date is required',
                        validate: value => new Date(value) > new Date() || 'Due date must be in the future'
                      })}
                      className={`w-full px-4 py-3 bg-gray-50/50 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:bg-white ${
                        errors.dueDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    />
                    {errors.dueDate && <p className="text-red-500 text-sm mt-1">⚠️ {errors.dueDate.message}</p>}
                  </div>
                  
                  {/* --- NEW Max Score Display --- */}
                  <div className="space-y-2">
                     <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Maximum Score
                      </label>
                      <div className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-700 font-bold">
                        {maxScore} Marks
                      </div>
                  </div>
                   {/* --- END NEW --- */}
                </div>
              </div>

              <input type="hidden" {...register('unitId')} />

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || isUploading} 
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {(loading || isUploading) ? (
                    <><FaSpinner className="animate-spin" /><span>Saving...</span></>
                  ) : (
                    <><FaCheck className="w-4 h-4" /><span>Save Assessment</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;