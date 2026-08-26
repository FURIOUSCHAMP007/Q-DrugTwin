import React from 'react';
import { Activity } from 'lucide-react';

export const ViewLoadingFallback: React.FC<{ label?: string }> = ({ label = 'Loading neural twin workspace...' }) => {
  return (
    <div className="w-full min-h-[420px] flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
          <Activity className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 blur-sm opacity-40 animate-pulse -z-10" />
      </div>

      <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
        Q-DRUGTWIN ENGINE
      </h4>
      <p className="text-xs text-slate-500 font-medium animate-pulse">
        {label}
      </p>

      {/* Lightweight pulse skeleton blocks */}
      <div className="w-full max-w-md mt-6 space-y-2.5">
        <div className="h-3 bg-slate-200/70 rounded-full w-full animate-pulse" />
        <div className="h-3 bg-slate-200/50 rounded-full w-4/5 mx-auto animate-pulse" />
        <div className="h-3 bg-slate-200/40 rounded-full w-2/3 mx-auto animate-pulse" />
      </div>
    </div>
  );
};
