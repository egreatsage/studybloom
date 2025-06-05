'use client';

import { useState, useEffect } from 'react';
import SearchableSelect from '@/components/SearchableSelect';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

export default function TeachingAssignmentManager() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    courseId: '',
    semesterId: '',
    unitIds: []
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teachersRes, coursesRes, semestersRes, assignmentsRes] = await Promise.all([
          fetch('/api/users?role=teacher', { credentials: 'include' }),
          fetch('/api/courses', { credentials: 'include' }),
          fetch('/api/semesters', { credentials: 'include' }),
          fetch('/api/teaching-assignments', { credentials: 'include' })
        ]);

        const [teachersData, coursesData, semestersData, assignmentsData] = await Promise.all([
          teachersRes.json(),
          coursesRes.json(),
          semestersRes.json(),
          assignmentsRes.json()
        ]);

        setTeachers(Array.isArray(teachersData) ? teachersData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setSemesters(Array.isArray(semestersData) ? semestersData : (semestersData.semesters || []));
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } catch (error) {
        setError('Failed to load data');
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch units when course is selected
  useEffect(() => {
    const fetchUnits = async () => {
      if (formData.courseId) {
        try {
          const response = await fetch(`/api/units?courseId=${formData.courseId}`, {
            credentials: 'include'
          });
          const data = await response.json();
          setUnits(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching units:', error);
        }
      } else {
        setUnits([]);
      }
    };

    fetchUnits();
  }, [formData.courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAssignment 
        ? `/api/teaching-assignments?id=${editingAssignment._id}`
        : '/api/teaching-assignments';
      
      const method = editingAssignment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save assignment');
      }

      const newAssignment = await response.json();
      
      setAssignments(prev => 
        editingAssignment
          ? prev.map(a => a._id === editingAssignment._id ? newAssignment : a)
          : [...prev, newAssignment]
      );
      
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/teaching-assignments?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete assignment');
      }

      setAssignments(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      teacherId: assignment.teacher._id,
      courseId: assignment.course._id,
      semesterId: assignment.semester._id,
      unitIds: assignment.units.filter(u => u.isActive).map(u => u.unit._id)
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingAssignment(null);
    setFormData({
      teacherId: '',
      courseId: '',
      semesterId: '',
      unitIds: []
    });
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Current Assignments</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Assignment
        </button>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <tr key={assignment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assignment.teacher.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assignment.course.code} - {assignment.course.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assignment.semester.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {assignment.units
                      .filter(u => u.isActive)
                      .map(u => (
                        <span
                          key={u.unit._id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {u.unit.code}
                        </span>
                      ))
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Teacher</label>
                  <SearchableSelect
                    options={teachers.map(teacher => ({
                      _id: teacher._id,
                      name: teacher.name
                    }))}
                    value={formData.teacherId}
                    onChange={(value) => setFormData({ ...formData, teacherId: value })}
                    placeholder="Select teacher..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Course</label>
                  <SearchableSelect
                    options={courses.map(course => ({
                      _id: course._id,
                      name: `${course.code} - ${course.name}`
                    }))}
                    value={formData.courseId}
                    onChange={(value) => setFormData({ ...formData, courseId: value, unitIds: [] })}
                    placeholder="Select course..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Semester</label>
                  <SearchableSelect
                    options={semesters.map(semester => ({
                      _id: semester._id,
                      name: semester.name
                    }))}
                    value={formData.semesterId}
                    onChange={(value) => setFormData({ ...formData, semesterId: value })}
                    placeholder="Select semester..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Units</label>
                  <select
                    multiple
                    value={formData.unitIds}
                    onChange={(e) => setFormData({
                      ...formData,
                      unitIds: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="w-full p-2 border rounded-lg"
                    size={5}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit._id} value={unit._id}>
                        {unit.code} - {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingAssignment ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
