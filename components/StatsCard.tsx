import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  colorClass?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, trendUp, icon, colorClass = "bg-white" }) => {
  return (
    <div className={`${colorClass} p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};