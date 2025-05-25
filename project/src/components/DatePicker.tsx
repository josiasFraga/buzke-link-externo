import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  onDateSelected?: () => void;
  timeSlotsLoaded?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  onSelectDate, 
  selectedDate, 
  onDateSelected,
  timeSlotsLoaded = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Set initial month to current month
    setCurrentMonth(new Date());
  }, []);

  // Handle scroll when time slots are loaded
  useEffect(() => {
    if (selectedDate && timeSlotsLoaded) {
      const timeSlotsSection = document.getElementById('time-slot-section');
      if (timeSlotsSection) {
        const modalElement = timeSlotsSection.closest('.overflow-y-auto');
        if (modalElement) {
          const scrollTo = timeSlotsSection.offsetTop - 20;
          modalElement.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          });
        }
        if (onDateSelected) {
          onDateSelected();
        }
      }
    }
  }, [selectedDate, timeSlotsLoaded, onDateSelected]);
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  // Format date as YYYY-MM-DD
  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  // Check if a date is in the past
  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(year, month, day);
    return date < today;
  };
  
  // Check if a date is selected
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate === formatDate(day);
  };
  
  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };
  
  // Handle date selection
  const handleDateSelect = (day: number) => {
    if (!isPastDate(day)) {
      const formattedDate = formatDate(day);
      onSelectDate(formattedDate);
    }
  };
  
  // Month names in Portuguese
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Day names with unique keys
  const dayNames = [
    { key: 'dom', label: 'D' },
    { key: 'seg', label: 'S' },
    { key: 'ter', label: 'T' },
    { key: 'qua', label: 'Q' },
    { key: 'qui', label: 'Q' },
    { key: 'sex', label: 'S' },
    { key: 'sab', label: 'S' }
  ];
  
  return (
    <div className="w-full" ref={datePickerRef}>
      <div className="flex items-center mb-4">
        <Calendar size={20} className="text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Selecione a Data</h3>
      </div>
      
      {/* Month navigation */}
      <div className="flex justify-between items-center mb-4 bg-gray-50 rounded-lg p-2">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day names */}
        {dayNames.map(day => (
          <div key={day.key} className="text-sm font-medium text-gray-500 py-2">
            {day.label}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => (
          <div key={`${month}-${day || `empty-${index}`}`} className="py-1">
            {day !== null ? (
              <button
                onClick={() => handleDateSelect(day)}
                disabled={isPastDate(day)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm
                  ${isPastDate(day) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-indigo-100'}
                  ${isSelected(day) ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                  ${isToday(day) && !isSelected(day) ? 'border border-indigo-600 text-indigo-600' : ''}
                  transition-colors
                `}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;