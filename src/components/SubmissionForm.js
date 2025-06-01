'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaUpload } from 'react-icons/fa';
import { handleError, handleSuccess, validateFileUpload } from '@/lib/utils/errorHandler';

const SubmissionForm = ({ assignmentId, onClose, onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      comment: '',
    },
  });

  const handleFileChange = (event) => {
    try {
      const fileList = Array.from(event.target.files);
      
      // Validate each file
      fileList.forEach(file => {
        validateFileUpload(file, {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
          ]
        });
      });

      setFiles(fileList);
    } catch (error) {
      handleError(error);
      event.target.value = ''; // Reset file input
    }
  };

  const onSubmitHandler = async (data) => {
    try {
      setUploading(true);

      if (files.length === 0) {
        throw new Error('Please attach at least one file');
      }

      const formData = new FormData();
      formData.append('assignmentId', assignmentId);
      formData.append('comment', data.comment);
      files.forEach(file => formData.append('files', file));

      await onSubmit(formData);
      handleSuccess('Assignment submitted successfully');
      onClose();
    } catch (error) {
      handleError(error, 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Submit Assignment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Files
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500">
                <FaUpload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Click to upload files
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </div>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              {...register('comment')}
              rows={4}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any comments about your submission..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;
