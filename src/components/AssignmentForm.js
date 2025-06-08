'use client';

import { useForm } from 'react-hook-form';
import { FaSpinner, FaUpload, FaFileAlt } from 'react-icons/fa';
import { handleError, handleSuccess, validateFileUpload } from '@/lib/utils/errorHandler';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AssignmentForm = ({ onSubmit, loading, onClose, defaultValues, unitId }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      dueDate: '',
      unitId: unitId || '',
      fileUrl: '',
    },
  });

  // State for file uploading
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(defaultValues?.fileUrl || null);
  const [fileName, setFileName] = useState(null);

  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      setFileUrl(defaultValues.fileUrl);
    } else if (unitId) {
      reset({ unitId });
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
      toast.success('File uploaded!', { id: toastId });
    } catch (error) {
        handleError(error, 'Upload failed. Please try again.');
        event.target.value = ''; // Reset file input
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmitHandler = async (data) => {
    try {
      // Add the uploaded fileUrl to the form data
      await onSubmit({ ...data, fileUrl });
      handleSuccess('Assignment saved successfully');
      onClose();
    } catch (error) {
      handleError(error, 'Failed to save assignment');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Assignment Title</label>
        <input
          type="text"
          {...register('title', { 
            required: 'Assignment title is required',
            minLength: { value: 3, message: 'Title must be at least 3 characters' }
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        {/* CHANGE: Label changed from Description to Instructions */}
        <label className="block text-sm font-medium text-gray-700">Instructions</label>
        <textarea
          {...register('description', { 
            required: 'Instructions are required',
            minLength: { value: 10, message: 'Instructions must be at least 10 characters' }
          })}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>
      
      {/* ADD: File Upload Section */}
      <div>
          <label className="block text-sm font-medium text-gray-700">Attach File (Optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, PNG, JPG up to 15MB</p>
              </div>
          </div>
          {isUploading && <div className="flex items-center mt-2 text-sm text-gray-500"><FaSpinner className="animate-spin mr-2"/> Uploading...</div>}
          {fileUrl && !isUploading && <div className="mt-2 text-sm text-green-600">Uploaded: {fileName || 'File'}</div>}
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="datetime-local"
          {...register('dueDate', { 
            required: 'Due date is required',
            validate: value => new Date(value) > new Date() || 'Due date must be in the future'
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
      </div>

      <input type="hidden" {...register('unitId')} />

      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading || isUploading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2">
          {(loading || isUploading) ? (<><FaSpinner className="animate-spin" /><span>Saving...</span></>) : (<span>Save</span>)}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;