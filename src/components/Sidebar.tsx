
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, X, Lock, DollarSign, 
  ClipboardCheck, Bookmark, Target, Edit3, Eye,
  Trash2, Plus, Check, LayoutGrid, BarChart3, Settings,
  Wallet, Sparkles, RefreshCw
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { syncService } from '../services/supabase';

interface NavItem {
  id: string;
  name: string;
  path: string;
  iconName: string;
}

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  finance: <DollarSign size={20} />,
  pms: <ClipboardCheck size={20} />,
  target: <Target size={20} />,
  bookmark: <Bookmark size={20} />,
  grid: <LayoutGrid size={20} />,
  chart: <BarChart3 size={20} />,
  settings: <Settings size={18} />,
  lock: <Lock size={18} />,
  wallet: <Wallet size={20} />
};

const DEFAULT_MENU: NavItem[] = [
  { id: '1', name: 'Relatório Técnico P.S', path: '/', iconName: 'dashboard' },
  { id: '2', name: 'Relatório Financeiro', path: '/finance', iconName: 'finance' },
  { id: '3', name: 'RDQA (PMS Pelotas)', path: '/pmspel', iconName: 'pms' },
  { id: '4', name: 'PPA, LDO e LOA', path: '/ppa', iconName: 'target' },
  { id: '5', name: '17ª Conferência', path: '/proposals', iconName: 'bookmark' },
];

interface SidebarProps { 
  isOpen: boolean; 
  setIsOpen: (isOpen: boolean) => void; 
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [isEditorMode, setIsEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');
  const [menuItems, setMenuItems] = useState<NavItem[]>(() => {
    const saved = localStorage.getItem('ui_menu_config');
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  });
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Partial<NavItem>>({ name: '', path: '/', iconName: 'dashboard' });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleModeChange = () => setIsEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  const saveMenu = (updatedMenu: NavItem[]) => {
    setMenuItems(updatedMenu);
    localStorage.setItem('ui_menu_config', JSON.stringify(updatedMenu));
  };

  const toggleEditorMode = () => {
    const newVal = !isEditorMode;
    if (newVal) {
      const pw = prompt("Digite a senha de editor:");
      if (pw !== 'Conselho@2026') return;
    }
    setIsEditorMode(newVal);
    localStorage.setItem('ui_editor_mode', newVal.toString());
    window.dispatchEvent(new Event('ui_editor_mode_changed'));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Excluir este item do menu?")) return;
    saveMenu(menuItems.filter(item => item.id !== id));
  };

  const handleRename = (id: string, newName: string) => {
    saveMenu(menuItems.map(item => item.id === id ? { ...item, name: newName } : item));
  };

  const handleAddNew = () => {
    if (!newItem.name) return;
    const item: NavItem = {
      id: Date.now().toString(),
      name: newItem.name!,
      path: newItem.path || '/',
      iconName: newItem.iconName || 'dashboard'
    };
    saveMenu([...menuItems, item]);
    setIsAddingNew(false);
    setNewItem({ name: '', path: '/', iconName: 'dashboard' });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncService.syncAllLocalToSupabase();
      alert('Sincronização com Supabase concluída com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao sincronizar com Supabase.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden" onClick={() => setIsOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 transition-transform duration-300 ease-in-out print:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen flex flex-col shadow-2xl`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Target size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg leading-none uppercase tracking-tighter text-white">Painel</span>
              <span className="font-black text-lg leading-none uppercase tracking-tighter text-blue-400">Estratégico</span>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-800"></div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] shadow-sm">
                  CMSPEL
                </span>
                <div className="h-px w-4 bg-slate-800"></div>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        
        <div className="px-4 py-4 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Menu Principal</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id} className="group relative">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} 
                  onClick={() => !isEditorMode && setIsOpen(false)}
                >
                  <span className="shrink-0">{ICON_COMPONENTS[item.iconName] || <LayoutDashboard size={20} />}</span>
                  {isEditorMode ? (
                    <input 
                      className="bg-transparent border-b border-blue-400/30 focus:border-blue-400 outline-none w-full text-sm font-bold text-white"
                      value={item.name}
                      onClick={(e) => e.preventDefault()}
                      onChange={(e) => handleRename(item.id, e.target.value)}
                    />
                  ) : (
                    <span className="font-medium text-sm truncate">{item.name}</span>
                  )}
                </NavLink>
                {isEditorMode && (
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-red-500 bg-slate-800/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            {isEditorMode && !isAddingNew && (
              <button 
                onClick={() => setIsAddingNew(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-400 hover:bg-blue-900/20 border border-dashed border-blue-900/50 mt-4 transition-all"
              >
                <Plus size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Novo Menu</span>
              </button>
            )}

            {isAddingNew && (
              <div className="p-3 bg-slate-800/50 rounded-xl border border-blue-900/50 mt-4 space-y-3 animate-fade-in">
                <input 
                  autoFocus
                  placeholder="Nome do Menu"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold outline-none focus:border-blue-500"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] font-bold outline-none"
                    value={newItem.path}
                    onChange={(e) => setNewItem({...newItem, path: e.target.value})}
                  >
                    <option value="/">Dashboard</option>
                    <option value="/finance">Financeiro</option>
                    <option value="/pmspel">RDQA</option>
                    <option value="/ppa">PPA/LDO</option>
                    <option value="/proposals">Conferência</option>
                    <option value="/admin">Admin</option>
                  </select>
                  <select 
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] font-bold outline-none"
                    value={newItem.iconName}
                    onChange={(e) => setNewItem({...newItem, iconName: e.target.value})}
                  >
                    {Object.keys(ICON_COMPONENTS).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsAddingNew(false)} className="flex-1 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white">Cancelar</button>
                  <button onClick={handleAddNew} className="flex-1 py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase text-white shadow-lg">Adicionar</button>
                </div>
              </div>
            )}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-800">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Configurações</p>
             <button 
               onClick={toggleEditorMode}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isEditorMode ? 'bg-amber-500 text-white font-bold shadow-lg shadow-amber-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
             >
               {isEditorMode ? <Eye size={20}/> : <Edit3 size={20}/>}
               <span className="text-sm">{isEditorMode ? 'Visualizar Site' : 'Modo Editor'}</span>
             </button>
             
             <button 
               onClick={handleManualSync}
               disabled={isSyncing}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-2 text-slate-400 hover:bg-slate-800 hover:text-blue-400 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
               <span className="text-sm">{isSyncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}</span>
             </button>
          </div>
        </div>

        <div className="p-4 space-y-2 border-t border-slate-800 bg-slate-900/50">
          <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`} onClick={() => setIsOpen(false)}>
            <div className="shrink-0">{ICON_COMPONENTS.lock}</div> 
            <span className="font-medium text-sm">Administração</span>
          </NavLink>
        </div>

        {/* Rodapé removido conforme solicitação */}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 10px;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
