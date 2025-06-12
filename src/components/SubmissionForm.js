'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaUpload, FaTimes, FaFileAlt, FaCloudUploadAlt, FaCheckCircle, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { handleError, handleSuccess, validateFileUpload } from '@/lib/utils/errorHandler';

const SubmissionForm = ({ assignmentId, onClose, onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
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
      processFiles(fileList);
    } catch (error) {
      handleError(error);
      event.target.value = ''; // Reset file input
    }
  };

  const processFiles = (fileList) => {
    try {
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

      setFiles(prev => [...prev, ...fileList]);
    } catch (error) {
      handleError(error);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileList = Array.from(e.dataTransfer.files);
      processFiles(fileList);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return '🖼️';
    } else if (extension === 'pdf') {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    }
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      onClose();
    } catch (error) {
      handleError(error, 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaCloudUploadAlt className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Submit Assignment</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaFileAlt className="w-4 h-4 text-blue-600" />
                Attach Files
                <span className="text-red-500">*</span>
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : files.length > 0 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className={`p-4 rounded-full mb-4 transition-colors ${
                      dragActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <FaUpload className={`w-8 h-8 transition-colors ${
                        dragActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-700 mb-1">
                        {dragActive ? 'Drop files here' : 'Upload your files'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-gray-400">
                        Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                      </p>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaCheckCircle className="w-4 h-4 text-green-600" />
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">
                            {getFileIcon(file.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          aria-label={`Remove ${file.name}`}
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaPaperPlane className="w-4 h-4 text-blue-600" />
                Additional Comments
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  {...register('comment')}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 shadow-sm px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-gray-50 focus:bg-white"
                  placeholder="Share any thoughts, questions, or additional context about your submission..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  Optional
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 hover:border-gray-400 order-2 sm:order-1"
                disabled={uploading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none order-1 sm:order-2"
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4" />
                    <span>Submit Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;