import React from 'react';

interface DdiPickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ddiOptions = [
  { value: '+55', label: '🇧🇷 +55' },
  { value: '+598', label: '🇺🇾 +598' },
];

const DdiPicker: React.FC<DdiPickerProps> = ({ id, value, onChange, className = 'theme-input px-3 py-3 font-medium' }) => {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={className}
      style={{ width: '7.5rem', minWidth: '7.5rem', flex: '0 0 7.5rem' }}
    >
      {ddiOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default DdiPicker;