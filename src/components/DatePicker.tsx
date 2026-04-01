import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  onDateSelected?: () => void;
  timeSlotsLoaded?: boolean;
  stickyTitle?: boolean;
  stickyTopClassName?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  onSelectDate, 
  selectedDate, 
  onDateSelected,
  timeSlotsLoaded = false,
  stickyTitle = false,
  stickyTopClassName = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

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
        } else {
          const top = timeSlotsSection.getBoundingClientRect().top + window.scrollY - 172;
          window.scrollTo({
            top: Math.max(top, 0),
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
      <div className={`${stickyTitle ? `sticky z-20 bg-[var(--color-background)] py-2 ${stickyTopClassName}` : 'mb-4'} flex items-center`}>
        <Calendar size={20} className="theme-text-accent mr-2" />
        <h3 className="theme-text-primary text-lg font-semibold">Selecione a Data</h3>
      </div>
      
      {/* Month navigation */}
      <div className="theme-card-soft mb-4 flex items-center justify-between p-2">
        <button 
          onClick={prevMonth}
          className="theme-secondary-btn rounded-full p-2"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="theme-text-primary text-lg font-semibold">
          {monthNames[month]} {year}
        </h3>
        <button 
          onClick={nextMonth}
          className="theme-secondary-btn rounded-full p-2"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day names */}
        {dayNames.map(day => (
          <div key={day.key} className="theme-text-secondary py-2 text-sm font-medium">
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
                  ${isPastDate(day) ? 'bg-[var(--color-disabled-date-bg)] text-[var(--color-disabled-date-text)] cursor-not-allowed' : 'hover:bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)]'}
                  ${isSelected(day) ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]' : !isPastDate(day) ? 'theme-text-primary' : ''}
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