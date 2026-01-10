
import React, { useState, useEffect } from 'react';
import { Check, Edit2 } from 'lucide-react';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ id, defaultText, className = "", multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(() => localStorage.getItem(`ui_text_${id}`) || defaultText);
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');

  useEffect(() => {
    const handleModeChange = () => {
      setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    };
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  const handleSave = () => {
    localStorage.setItem(`ui_text_${id}`, text);
    setIsEditing(false);
  };

  if (!editorMode) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`relative inline-block group/edit border-b border-dashed border-amber-300 hover:bg-amber-50 rounded px-1 transition-colors ${className}`}>
      {isEditing ? (
        <div className="flex items-center gap-2">
          {multiline ? (
            <textarea 
              autoFocus
              className="w-full p-2 border border-amber-400 rounded bg-white text-slate-800 font-normal min-h-[100px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleSave}
            />
          ) : (
            <input 
              autoFocus
              className="p-1 border border-amber-400 rounded bg-white text-slate-800 font-normal"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          )}
          <button onClick={handleSave} className="p-1 bg-emerald-500 text-white rounded shadow-sm hover:bg-emerald-600">
            <Check size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2" onClick={() => setIsEditing(true)}>
          {text}
          <Edit2 size={12} className="text-amber-500 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
        </div>
      )}
    </span>
  );
};
