
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({ id, defaultText, className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultText);
  const [tempText, setTempText] = useState(defaultText);

  useEffect(() => {
    const saved = storage.getSync(id);
    if (saved) {
      setText(saved);
      setTempText(saved);
    }
  }, [id]);

  const handleSave = () => {
    setText(tempText);
    storage.setItem(id, tempText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempText(text);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <span className={`flex items-center gap-2 ${className}`}>
        <input
          type="text"
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <button onClick={handleSave} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
          <Check size={16} />
        </button>
        <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
          <X size={16} />
        </button>
      </span>
    );
  }

  return (
    <span 
      className={`group relative flex items-center gap-2 cursor-pointer ${className}`} 
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      <span>{text}</span>
      <Edit2 size={12} className="opacity-0 group-hover:opacity-40 transition-opacity text-slate-400" />
    </span>
  );
};
