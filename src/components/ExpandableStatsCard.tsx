
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MonthlyData } from '../types';

interface ExpandableStatsCardProps {
  title: string;
  totalValue: number;
  monthlyData: MonthlyData[];
  color: string;
}

export const ExpandableStatsCard: React.FC<ExpandableStatsCardProps> = ({ title, totalValue, monthlyData, color }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border transition-all duration-300 cursor-pointer overflow-hidden
        ${isExpanded ? 'border-blue-400 ring-2 ring-blue-100 col-span-1 md:col-span-2' : 'border-slate-200 hover:border-blue-300'}
      `}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} transition-colors`}>
              <Calendar size={20} />
            </div>
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</span>
          </div>
          <button className="text-slate-400">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{totalValue.toLocaleString('pt-BR')}</h3>
            <p className="text-xs text-slate-400 mt-1">Atendimentos Totais</p>
          </div>
          {!isExpanded && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Clique para detalhar
            </span>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`bg-slate-50 border-t border-slate-100 transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 h-64 w-full">
           <p className="text-xs font-bold text-slate-500 mb-2 uppercase text-center">Distribuição Mensal</p>
           <ResponsiveContainer width="100%" height="90%">
             <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <XAxis dataKey="month" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
               <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
               <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 cursor={{ fill: '#e2e8f0', opacity: 0.4 }}
               />
               <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
                 {monthlyData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={color} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
