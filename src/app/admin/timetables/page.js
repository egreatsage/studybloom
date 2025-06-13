'use client';

import { useState } from 'react';
import TimetableManager from '@/components/admin/TimetableManager';
import TeachingAssignmentManager from '@/components/admin/TeachingAssignmentManager';
import { FaCalendarAlt, FaChalkboardTeacher } from 'react-icons/fa';

export default function TimetablesPage() {
  const [activeTab, setActiveTab] = useState('timetables');

  const tabs = [
     { id: 'teaching', label: 'Teaching Assignments', icon: FaChalkboardTeacher },
    { id: 'timetables', label: 'Timetables', icon: FaCalendarAlt },
   
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon 
                  className={`mr-2 h-5 w-5 ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === 'timetables' && <TimetableManager />}
        {activeTab === 'teaching' && <TeachingAssignmentManager />}
      </div>
    </div>
  );
}
