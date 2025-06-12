'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useCourseStore from '@/lib/stores/courseStore';

const roles = ['admin', 'teacher', 'student','parent'];

const UserForm = ({ onSubmit, loading, onClose, defaultValues }) => {
  const { courses, fetchCourses } = useCourseStore();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      role: 'admin',
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      photo: null,
    },
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(defaultValues?.photoUrl || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(defaultValues?.course || null);
  
  // Parent-Student Linking States
  const [allStudents, setAllStudents] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (defaultValues?.photoUrl) {
      setPhotoPreview(defaultValues.photoUrl);
      setPhotoUrl(defaultValues.photoUrl);
    }
    if (defaultValues?.course) {
      setSelectedCourse(defaultValues.course);
      // Set the course search field with the course name
      if (typeof defaultValues.course === 'object') {
        setCourseSearch(`${defaultValues.course.code} - ${defaultValues.course.name}`);
      }
    }
    if (defaultValues?.role === 'parent' && defaultValues?.children) {
      setSelectedChildren(defaultValues.children);
    }
  }, [defaultValues]);

  // Fetch students based on search input when role is parent
  useEffect(() => {
    const fetchStudents = async () => {
      if (!studentSearch.trim()) {
        setAllStudents([]);
        return;
      }
      try {
        const res = await fetch(`/api/users?role=student&search=${encodeURIComponent(studentSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setAllStudents(data);
        }
      } catch (e) {
        toast.error('Could not load student list.');
      }
    };
    if (watch('role') === 'parent') {
      fetchStudents();
    } else {
      setAllStudents([]);
    }
  }, [studentSearch, watch('role')]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    const toastId = toast.loading('Uploading Image...');
 

    // Upload to Cloudinary
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await res.json();
      setPhotoUrl(data.imageUrl);
      
     toast.success('Image uploaded successfully!', {
      id: toastId,
    });
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show error message
      toast.error('Failed to upload photo. Please try again.', {
        id: toastId,
      });
      
      // Reset preview if upload failed
      setPhotoPreview(defaultValues?.photoUrl || null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Parent-Student Linking Handlers
  const handleAddChild = (student) => {
    if (!selectedChildren.find(child => child._id === student._id)) {
      setSelectedChildren([...selectedChildren, student]);
    }
    setStudentSearch('');
  };

  const handleRemoveChild = (studentId) => {
    setSelectedChildren(selectedChildren.filter(child => child._id !== studentId));
  };
  
  const filteredAvailableStudents = allStudents.filter(student => 
    !selectedChildren.some(child => child._id === student._id)
  );

  const internalOnSubmit = (data) => {
    // Validate course selection for teachers and students
    if ((data.role === 'teacher' || data.role === 'student') && !selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    const formData = new FormData();
    
    // Debug log
    console.log('Form data before submission:', data);
    
    // Add all form data except photo
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'photo' && value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Add photoUrl if available
    if (photoUrl) {
      formData.append('photoUrl', photoUrl);
    }

    // Add courseId if selected and role is teacher or student
    if ((data.role === 'teacher' || data.role === 'student') && selectedCourse) {
      formData.append('courseId', selectedCourse._id);
    }

    // Add children IDs if role is parent
    if (data.role === 'parent') {
      formData.append('childrenIds', selectedChildren.map(c => c._id).join(','));
    }

    // Debug log
    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    console.log('FormData being submitted:', formDataObj);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(internalOnSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Upload */}
        <div className="md:col-span-2 flex flex-col items-center space-y-2">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
            <img
              src={photoPreview || '/default-profile.png'}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </div>
          <label 
            className={`cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center gap-2 ${
              uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingPhoto ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              'Choose Photo'
            )}
            <input
              type="file"
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
              disabled={uploadingPhoto}
            />
          </label>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register('password', { 
                required: !defaultValues ? 'Password is required' : false,
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              placeholder={defaultValues ? 'Leave blank to keep current password' : ''}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9+\-\s()]*$/,
                  message: 'Invalid phone number'
                }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Registration Number (only for students) */}
          {watch('role') === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="text"
                {...register('regNumber', {
                  required: 'Registration number is required for students'
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.regNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.regNumber.message}</p>
              )}
            </div>
          )}

          {/* Course Selection (only for teachers and students) */}
          {(watch('role') === 'teacher' || watch('role') === 'student') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <div className="relative">
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search for a course..."
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {courseSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {courses
                      .filter(course => 
                        course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                        course.code.toLowerCase().includes(courseSearch.toLowerCase())
                      )
                      .map(course => (
                        <div
                          key={course._id}
                          onClick={() => {
                            setSelectedCourse(course);
                            setCourseSearch(`${course.code} - ${course.name}`);
                          }}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">{course.code} - {course.name}</div>
                          {course.department?.name && (
                            <div className="text-sm text-gray-500">{course.department.name}</div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              {selectedCourse && (
                <p className="mt-1 text-sm text-green-600">
                  Selected: {selectedCourse.code} - {selectedCourse.name}
                </p>
              )}
              {(watch('role') === 'teacher' || watch('role') === 'student') && !selectedCourse && (
                <p className="mt-1 text-sm text-red-600">Course is required for teachers and students</p>
              )}
            </div>
          )}
        </div>

        {/* Parent-Student Linking UI */}
        {watch('role') === 'parent' && (
          <div className="md:col-span-2 p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Students to this Parent</label>
            
            {/* Display Selected Children */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedChildren.map(child => (
                <span key={child._id} className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {child.name}
                  <button type="button" onClick={() => handleRemoveChild(child._id)} className="text-blue-600 hover:text-blue-800">
                    <FaTimes size={12}/>
                  </button>
                </span>
              ))}
            </div>

            {/* Search and Select Input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search for students to add..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              {studentSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredAvailableStudents.map(student => (
                    <div
                      key={student._id}
                      onClick={() => handleAddChild(student)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {student.name} ({student.email})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
