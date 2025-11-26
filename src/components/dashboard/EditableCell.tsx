import { useState, useEffect, useRef } from 'react';

interface EditableCellProps {
  value: number | string;
  onSave: (value: number | string) => Promise<void>;
  type?: 'number' | 'text';
  className?: string;
}

export function EditableCell({ value, onSave, type = 'number', className = '' }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalValue = type === 'number' ? Number(editValue) || 0 : editValue;
      await onSave(finalValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(String(value));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={saving}
        className={`w-full bg-background-secondary border border-primary rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-background-secondary/50 rounded px-2 py-1 transition-colors ${className}`}
    >
      {value}
    </div>
  );
}
