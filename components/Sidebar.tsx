
import React, { useState } from 'react';
import { 
  LayoutDashboard, Menu, X, Lock, DollarSign, 
  FileText, ClipboardCheck
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps { isOpen: boolean; setIsOpen: (isOpen: boolean) => void; }

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Visão Geral (Painel)', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Relatório Financeiro', path: '/finance', icon: <DollarSign size={20} /> },
    { name: 'RDQA', path: '/pmspel', icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden" onClick={() => setIsOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 transition-transform duration-300 ease-in-out print:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl uppercase tracking-tighter">
            <span className="text-blue-400">Painel</span><span>Estratégico</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Menu Principal</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} 
                onClick={() => setIsOpen(false)}
              >
                {item.icon} <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex-1"></div>

        <div className="p-4 space-y-2 border-t border-slate-800">
          <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`} onClick={() => setIsOpen(false)}>
            <Lock size={18} /> <span className="font-medium text-sm">Administração</span>
          </NavLink>
        </div>

        <div className="shrink-0 w-full p-6 bg-slate-950 text-center">
            <div className="text-[10px] text-slate-500 font-medium tracking-tight opacity-70">
              Desenvolvimento por Samuel Amaro
            </div>
        </div>
      </div>
    </>
  );
};
