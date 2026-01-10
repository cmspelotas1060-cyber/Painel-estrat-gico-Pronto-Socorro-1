
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { EditableText } from './EditableText';

interface Note {
  id: string;
}

interface DynamicNotesProps {
  sectionId: string;
}

export const DynamicNotes: React.FC<DynamicNotesProps> = ({ sectionId }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(`ui_notes_ids_${sectionId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');

  useEffect(() => {
    const handleModeChange = () => {
      setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    };
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  const addNote = () => {
    const newNote = { id: Date.now().toString() };
    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem(`ui_notes_ids_${sectionId}`, JSON.stringify(updated));
  };

  const deleteNote = (id: string) => {
    if (!confirm("Excluir este bloco de texto?")) return;
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`ui_notes_ids_${sectionId}`, JSON.stringify(updated));
    localStorage.removeItem(`ui_text_note_${sectionId}_${id}`);
  };

  if (notes.length === 0 && !editorMode) return null;

  return (
    <div className="space-y-4 mt-6">
      {notes.map((note) => (
        <div key={note.id} className="relative group/note bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
          <div className="flex items-start gap-3">
            <FileText size={16} className="text-amber-500 mt-1 shrink-0" />
            <EditableText 
              id={`note_${sectionId}_${note.id}`} 
              defaultText="Clique aqui para escrever uma observação ou análise complementar..." 
              multiline={true}
              className="text-slate-600 text-sm italic leading-relaxed w-full"
            />
            {editorMode && (
              <button 
                onClick={() => deleteNote(note.id)}
                className="opacity-0 group-hover/note:opacity-100 p-1.5 text-red-400 hover:text-red-600 transition-all shrink-0"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {editorMode && (
        <button 
          onClick={addNote}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest"
        >
          <Plus size={16} /> Acrescentar Bloco de Texto
        </button>
      )}
    </div>
  );
};
