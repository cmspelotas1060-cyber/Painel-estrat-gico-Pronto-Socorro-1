
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Plus, Trash2, MessageSquare, Save, X } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  timestamp: number;
}

interface DynamicNotesProps {
  sectionId: string;
  requestPassword?: (message: string, onConfirm: (password: string) => void) => void;
}

export const DynamicNotes: React.FC<DynamicNotesProps> = ({ sectionId, requestPassword }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");

  const storageKey = `notes_${sectionId}`;

  useEffect(() => {
    const saved = storage.getSync(storageKey);
    if (saved && Array.isArray(saved)) {
      setNotes(saved);
    }
  }, [sectionId]);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    storage.setItem(storageKey, updatedNotes);
  };

  const handleAdd = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: Date.now()
    };
    saveNotes([...notes, note]);
    setNewNote("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja excluir esta nota?")) {
      saveNotes(notes.filter(n => n.id !== id));
    }
  };

  return (
    <div className="mt-8 space-y-4 print:hidden">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={16} /> Notas e Observações
        </h3>
        <button 
          onClick={() => {
            if (requestPassword) {
              requestPassword("Para adicionar uma nota, é necessário autenticação do Conselho.", (pw) => {
                if (pw === 'Conselho@2026') {
                  setIsAdding(true);
                } else {
                  alert("Senha incorreta!");
                }
              });
            } else {
              setIsAdding(true);
            }
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> Adicionar Nota
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-amber-50 border border-amber-100 p-4 rounded-xl relative group shadow-sm">
            <button 
              onClick={() => handleDelete(note.id)}
              className="absolute top-2 right-2 p-1 text-amber-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
            <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
              {note.text}
            </p>
            <div className="mt-3 text-[10px] font-bold text-amber-400 uppercase">
              {new Date(note.timestamp).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
        
        {notes.length === 0 && !isAdding && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium italic">Nenhuma observação registrada para este eixo.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="bg-white border-2 border-blue-100 p-6 rounded-2xl shadow-xl animate-fade-in">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Digite sua observação aqui..."
            className="w-full h-32 p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 flex items-center gap-2"
            >
              <X size={16} /> Cancelar
            </button>
            <button 
              onClick={handleAdd}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg flex items-center gap-2"
            >
              <Save size={16} /> Salvar Nota
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
