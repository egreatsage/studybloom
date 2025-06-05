'use client';

import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';

export default function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option",
  displayKey = "name",
  valueKey = "_id",
  required = false,
  disabled = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const displayValue = typeof option === 'object' ? option[displayKey] : option;
    return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get display value for selected option
  const getDisplayValue = () => {
    if (!value) return '';
    const selectedOption = options.find(option => {
      const optionValue = typeof option === 'object' ? option[valueKey] : option;
      return optionValue === value;
    });
    if (!selectedOption) return '';
    return typeof selectedOption === 'object' ? selectedOption[displayKey] : selectedOption;
  };

  const handleSelect = (option) => {
    const optionValue = typeof option === 'object' ? option[valueKey] : option;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        className={`w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-500'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {getDisplayValue() || placeholder}
        </span>
        <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-gray-500 text-center">No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'object' ? option[valueKey] : option;
                const displayValue = typeof option === 'object' ? option[displayKey] : option;
                const isSelected = optionValue === value;

                return (
                  <div
                    key={optionValue || index}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {displayValue}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ''}
          required={required}
          className="sr-only"
          onChange={() => {}}
        />
      )}
    </div>
  );
}
