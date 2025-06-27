'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import timetableStore from '@/lib/stores/timetableStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchableSelect from '@/components/SearchableSelect';
import { FaPlus, FaEdit, FaTrash, FaClock, FaMapMarkerAlt, FaUser, FaVideo } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

// Draggable Lecture Card
function LectureCard({ lecture, onEdit, onDelete }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'lecture',
    item: { lecture },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`p-2 rounded cursor-move transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ backgroundColor: lecture.color || '#3B82F6' }}
    >
      <div className="text-white text-xs">
        <div className="font-semibold">{lecture.unit?.code}</div>
        <div className="flex items-center gap-1 mt-1">
          <FaClock className="text-xs" />
          {lecture.startTime} - {lecture.endTime}
        </div>
        <div className="flex items-center gap-1">
          <FaMapMarkerAlt className="text-xs" />
          {lecture.venue.building} {lecture.venue.room}
        </div>
        <div className="flex items-center gap-1">
          <FaUser className="text-xs" />
          {lecture.teacher?.name}
        </div>
        {lecture.metadata?.isOnline && (
          <div className="flex items-center gap-1">
            <FaVideo className="text-xs" />
            Online
          </div>
        )}
      </div>
      <div className="flex gap-1 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(lecture);
          }}
          className="text-white hover:text-gray-200 text-xs"
        >
          <FaEdit />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(lecture._id);
          }}
          className="text-white hover:text-gray-200 text-xs"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

// Droppable Time Slot
function TimeSlot({ day, time, lectures, onDrop, onEdit, onDelete }) {
  const [{ isOver }, drop] = useDrop({
    accept: 'lecture',
    drop: (item) => onDrop(item.lecture, day, time),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const slotLectures = lectures.filter(
    (lecture) => lecture.dayOfWeek === day && lecture.startTime === time
  );

  return (
    <td
      ref={drop}
      className={`border p-1 h-24 relative ${
        isOver ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'
      }`}
    >
      {slotLectures.map((lecture) => (
        <LectureCard
          key={lecture._id}
          lecture={lecture}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </td>
  );
}

export default function LectureScheduler({ timetableId }) {
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [timetableDetails, setTimetableDetails] = useState(null);
  const [formData, setFormData] = useState({
    unit: '',
    teacher: '',
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    venue: {
      building: '',
      room: '',
      capacity: 30
    },
    lectureType: 'lecture',
    isRecurring: true,
    frequency: 'weekly',
    color: '#3B82F6',
    metadata: {
      credits: 1,
      isOnline: false,
      onlineLink: ''
    }
  });

  const {
    lectures,
    units,
    teachers,
    venues,
    loading,
    error,
    fetchLectures,
    fetchUnits,
    fetchTeachers,
    fetchVenues,
    createLecture,
    updateLecture,
    deleteLecture,
    checkConflicts
  } = timetableStore();

  useEffect(() => {
    const loadData = async () => {
      if (timetableId) {
        try {
          // Fetch timetable details first
          const response = await fetch(`/api/timetables?id=${timetableId}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const timetable = await response.json();
            console.log('Timetable details:', timetable);
            setTimetableDetails(timetable);
            
            // Now fetch units for the course
            if (timetable.course?._id) {
              console.log('Fetching units for course:', timetable.course._id);
              const fetchedUnits = await fetchUnits(timetable.course._id);
              console.log('Fetched units:', fetchedUnits);
            } else {
              console.log('No course ID found in timetable');
            }
          }
          
          // Fetch other required data
          await fetchLectures(timetableId);
          await fetchTeachers(); // This already fetches only teachers
          await fetchVenues();
        } catch (error) {
          console.error('Error loading data:', error);
        }
      }
    };
    
    loadData();
  }, [timetableId]);

  const handleDrop = async (lecture, newDay, newTime) => {
    try {
      const updates = {
        dayOfWeek: newDay,
        startTime: newTime,
        // Calculate end time based on duration
        endTime: calculateEndTime(newTime, lecture.duration || 120)
      };

      // Check for conflicts
      const conflictCheckPayload = {
        ...lecture,
        ...updates,
        _id: lecture._id, 
        unit: lecture.unit._id,
        teacher: lecture.teacher._id,
        timetable: timetableId
      };
      const conflicts = await checkConflicts(conflictCheckPayload);

      if (conflicts.teacher || conflicts.venue) {
        toast.error('Conflict detected! ' + conflicts.details.map(c => c.message).join(', '));
        return;
      }

      await updateLecture(lecture._id, updates);
    } catch (error) {
      console.error('Error updating lecture:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const lectureData = {
        ...formData,
        timetable: timetableId
      };

      // Check for conflicts
      const conflicts = await checkConflicts(lectureData);
      if (conflicts.teacher || conflicts.venue) {
        alert('Conflict detected! ' + conflicts.details.map(c => c.message).join(', '));
        return;
      }

      if (editingLecture) {
        await updateLecture(editingLecture._id, lectureData);
      } else {
        await createLecture(lectureData);
      }
      
      setShowLectureForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving lecture:', error);
    }
  };

  const handleEdit = (lecture) => {
    setEditingLecture(lecture);
    setFormData({
      unit: lecture.unit?._id || '',
      teacher: lecture.teacher?._id || '',
      dayOfWeek: lecture.dayOfWeek,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      venue: {
        building: lecture.venue?.building || '',
        room: lecture.venue?.room || '',
        capacity: lecture.venue?.capacity || 30
      },
      lectureType: lecture.lectureType || 'lecture',
      isRecurring: lecture.isRecurring !== undefined ? lecture.isRecurring : true,
      frequency: lecture.frequency || 'weekly',
      color: lecture.color || '#3B82F6',
      metadata: {
        credits: lecture.metadata?.credits || 1,
        isOnline: lecture.metadata?.isOnline || false,
        onlineLink: lecture.metadata?.onlineLink || ''
      }
    });
    setShowLectureForm(true);
  };

  const handleDelete = async (lectureId) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await deleteLecture(lectureId);
      } catch (error) {
        console.error('Error deleting lecture:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingLecture(null);
    setFormData({
      unit: '',
      teacher: '',
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      venue: {
        building: '',
        room: '',
        capacity: 30
      },
      lectureType: 'lecture',
      isRecurring: true,
      frequency: 'weekly',
      color: '#3B82F6',
      metadata: {
        credits: 1,
        isOnline: false,
        onlineLink: ''
      }
    });
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Schedule Lectures</h2>
          <button
            onClick={() => setShowLectureForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Lecture
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Weekly Schedule Grid */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  <td className="border px-4 py-2 font-medium text-sm text-gray-700">
                    {time}
                  </td>
                  {DAYS.map((day, dayIndex) => (
                    <TimeSlot
                      key={`${day}-${time}`}
                      day={dayIndex + 1} // Monday = 1
                      time={time}
                      lectures={lectures}
                      onDrop={handleDrop}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lecture Form Modal */}
        {showLectureForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">
                {editingLecture ? 'Edit Lecture' : 'Add New Lecture'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    {console.log('Units in form:', units)}
                    <SearchableSelect
                      options={units.map(unit => ({
                        _id: unit._id,
                        name: `${unit.code} - ${unit.name}`
                      }))}
                      value={formData.unit}
                      onChange={(value) => setFormData({ ...formData, unit: value })}
                      placeholder="Search and select unit..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Teacher</label>
                    <SearchableSelect
                      options={teachers}
                      value={formData.teacher}
                      onChange={(value) => setFormData({ ...formData, teacher: value })}
                      placeholder="Search and select teacher..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Day of Week</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                      required
                    >
                      {DAYS.map((day, index) => (
                        <option key={day} value={index + 1}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Lecture Type</label>
                    <select
                      value={formData.lectureType}
                      onChange={(e) => setFormData({ ...formData, lectureType: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="lecture">Lecture</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="lab">Lab</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <input
                        type="checkbox"
                        checked={formData.metadata.isOnline}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, isOnline: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      Online Class
                    </label>
                  </div>

                  {formData.metadata.isOnline && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Online Link</label>
                      <input
                        type="url"
                        value={formData.metadata.onlineLink}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, onlineLink: e.target.value }
                        })}
                        className="w-full p-2 border rounded-lg"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  )}

                  {!formData.metadata.isOnline && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Building</label>
                        <select
                          value={formData.venue.building}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              venue: { 
                                ...formData.venue, 
                                building: e.target.value,
                                room: '' // Reset room when building changes
                              }
                            });
                          }}
                          className="w-full p-2 border rounded-lg"
                          required={!formData.metadata.isOnline}
                        >
                          <option value="">Select Building</option>
                          {[...new Set(venues.map(v => v.building))].map(building => (
                            <option key={building} value={building}>{building}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Room</label>
                        <select
                          value={formData.venue.room}
                          onChange={(e) => setFormData({
                            ...formData,
                            venue: { ...formData.venue, room: e.target.value }
                          })}
                          className="w-full p-2 border rounded-lg"
                          required={!formData.metadata.isOnline}
                          disabled={!formData.venue.building} // Disable if no building selected
                        >
                          <option value="">Select Room</option>
                          {venues
                            .filter(v => v.building === formData.venue.building)
                            .map(venue => (
                              <option key={venue.room} value={venue.room}>{venue.room}({venue.type})</option>
                            ))
                          }
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full p-2 border rounded-lg h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="mr-2"
                      />
                      Recurring
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingLecture ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLectureForm(false);
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
      </div>
    </DndProvider>
  );
}
