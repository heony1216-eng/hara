'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface EditableTextProps {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  editMode?: boolean;
  type?: 'text' | 'number';
  placeholder?: string;
}

export function EditableText({
  value,
  onChange,
  className = '',
  editMode = false,
  type = 'text',
  placeholder = '클릭하여 편집',
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (editMode) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== String(value)) {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setTempValue(String(value));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-b-2 border-blue-500 outline-none ${className}`}
        style={{ width: `${Math.max(tempValue.length, 3)}ch` }}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`${className} ${editMode ? 'editable-text cursor-pointer hover:bg-white/10 px-1 rounded' : ''}`}
      title={editMode ? '클릭하여 편집' : undefined}
    >
      {value || placeholder}
    </span>
  );
}
