'use client';

import { useState, useEffect } from 'react';
import { FaExpand, FaCompress, FaPrint, FaDownload } from 'react-icons/fa';

export default function TimetableWrapper({ children, title, onExport, onPrint }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <div className="flex gap-2">
            {onExport && (
              <button
                onClick={onExport}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title="Export"
              >
                <FaDownload className="text-sm" />
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Print"
            >
              <FaPrint className="text-sm" />
            </button>
            {!isMobile && (
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'overflow-x-auto' : ''}`}>
        <div className={`${isMobile ? 'min-w-[800px]' : ''} p-4`}>
          {children}
        </div>
      </div>

      {/* Mobile scroll indicator */}
      {isMobile && (
        <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 border-t border-blue-200">
          <p className="flex items-center gap-2">
            <span>👆</span>
            <span>Swipe horizontally to view full timetable</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Print styles
export const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    
    .timetable-print-area, .timetable-print-area * {
      visibility: visible;
    }
    
    .timetable-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    
    /* Hide non-printable elements */
    button, .no-print {
      display: none !important;
    }
    
    /* Ensure colors print */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Page setup */
    @page {
      size: landscape;
      margin: 1cm;
    }
  }
`;
