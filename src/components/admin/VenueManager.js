'use client';

import { useState, useEffect } from 'react';
import timetableStore from '@/lib/stores/timetableStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaUsers, FaTools } from 'react-icons/fa';

export default function VenueManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [filter, setFilter] = useState({
    building: '',
    type: '',
    minCapacity: ''
  });
  const [formData, setFormData] = useState({
    building: '',
    room: '',
    capacity: 30,
    type: 'lecture_hall',
    facilities: [],
    isActive: true
  });
  const [newFacility, setNewFacility] = useState('');

  const { venues, loading, error, fetchVenues } = timetableStore();

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/venues', {
        method: editingVenue ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingVenue ? { ...formData, id: editingVenue._id } : formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save venue');
      }

      await fetchVenues();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving venue:', error);
      alert(error.message);
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      building: venue.building,
      room: venue.room,
      capacity: venue.capacity,
      type: venue.type,
      facilities: venue.facilities || [],
      isActive: venue.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        const response = await fetch(`/api/venues?id=${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete venue');
        }

        await fetchVenues();
      } catch (error) {
        console.error('Error deleting venue:', error);
        alert(error.message);
      }
    }
  };

  const handleToggleActive = async (venue) => {
    try {
      const response = await fetch(`/api/venues?id=${venue._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !venue.isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update venue status');
      }

      await fetchVenues();
    } catch (error) {
      console.error('Error updating venue:', error);
    }
  };

  const addFacility = () => {
    if (newFacility.trim()) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  const removeFacility = (index) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setEditingVenue(null);
    setFormData({
      building: '',
      room: '',
      capacity: 30,
      type: 'lecture_hall',
      facilities: [],
      isActive: true
    });
    setNewFacility('');
  };

  const filteredVenues = venues.filter(venue => {
    if (filter.building && !venue.building.toLowerCase().includes(filter.building.toLowerCase())) {
      return false;
    }
    if (filter.type && venue.type !== filter.type) {
      return false;
    }
    if (filter.minCapacity && venue.capacity < parseInt(filter.minCapacity)) {
      return false;
    }
    return true;
  });

  const getTypeLabel = (type) => {
    const labels = {
      lecture_hall: 'Lecture Hall',
      lab: 'Laboratory',
      tutorial_room: 'Tutorial Room',
      auditorium: 'Auditorium'
    };
    return labels[type] || type;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Venue Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Venue
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Building</label>
            <input
              type="text"
              value={filter.building}
              onChange={(e) => setFilter({ ...filter, building: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Search by building..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All Types</option>
              <option value="lecture_hall">Lecture Hall</option>
              <option value="lab">Laboratory</option>
              <option value="tutorial_room">Tutorial Room</option>
              <option value="auditorium">Auditorium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Min Capacity</label>
            <input
              type="number"
              value={filter.minCapacity}
              onChange={(e) => setFilter({ ...filter, minCapacity: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Minimum capacity..."
            />
          </div>
        </div>
      </div>

      {/* Venue Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Building</label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Room</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="lab">Laboratory</option>
                  <option value="tutorial_room">Tutorial Room</option>
                  <option value="auditorium">Auditorium</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Facilities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Add facility..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFacility();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addFacility}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {facility}
                      <button
                        type="button"
                        onClick={() => removeFacility(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingVenue ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.map((venue) => (
          <div
            key={venue._id}
            className={`bg-white rounded-lg shadow p-4 ${
              !venue.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FaBuilding className="text-gray-500" />
                  {venue.building} - {venue.room}
                </h3>
                <span className="text-sm text-gray-500">{getTypeLabel(venue.type)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(venue)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(venue._id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FaUsers className="text-gray-400" />
                <span>Capacity: {venue.capacity}</span>
              </div>

              {venue.facilities && venue.facilities.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <FaTools className="text-gray-400 mt-1" />
                  <div className="flex flex-wrap gap-1">
                    {venue.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    venue.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {venue.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggleActive(venue)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {venue.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No venues found. {filter.building || filter.type || filter.minCapacity ? 'Try adjusting your filters.' : 'Add one to get started.'}
        </div>
      )}
    </div>
  );
}
