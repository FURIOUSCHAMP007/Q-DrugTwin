import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Sparkles,
  Play,
  ChevronDown,
  Download,
  Search,
  Bell,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  activePatient: PatientDigitalTwinState;
  patients: PatientDigitalTwinState[];
  onSelectPatient: (p: PatientDigitalTwinState) => void;
  onOpenGuidedDemo: () => void;
  onOpenAddPatient: () => void;
  onNavigateHome?: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  activePatient,
  patients,
  onSelectPatient,
  onOpenGuidedDemo,
  onOpenAddPatient,
  onNavigateHome,
  activeView
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePatient, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Q-DrugTwin_${activePatient.patientId}_DigitalTwin.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & Deep Tech Identity */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-3 text-left group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] via-[#3B82F6] to-[#7C3AED] shadow-md shadow-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-white text-lg">Q</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base lg:text-lg tracking-tight text-[#0F172A] flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent group-hover:text-blue-600 transition-colors">
                  Q-DRUGTWIN
                </span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#F5F0FF] text-[#7C3AED] border border-purple-200 uppercase tracking-wider">
                NEURAL TWIN v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block font-medium">
              Quantum & AI Precision Pharmacology Decision Support
            </p>
          </div>
        </button>
      </div>

      {/* Center Search Bar for Rapid Drug / Patient Query */}
      <div className="hidden xl:flex items-center w-80 relative">
        <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search drugs, targets, genes, twins..."
          className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#F1F5FF] border border-blue-200/60 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs text-[#0F172A] placeholder-slate-400 outline-none transition-all"
        />
      </div>

      {/* Patient Switcher & Clinical Actions */}
      <div className="flex items-center space-x-3">
        {/* Active Patient Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all text-left group shadow-xs"
          >
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-xs" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                Digital Twin Context
              </span>
              <span className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <span className="font-mono text-blue-600 font-bold">{activePatient.patientId}</span>
                <span className="text-slate-400">•</span>
                <span className="truncate max-w-[110px] sm:max-w-[160px] text-[#0F172A]">{activePatient.name.split(' (')[0]}</span>
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-84 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-400/20 z-50 overflow-hidden divide-y divide-slate-100">
              <div className="p-3 bg-[#F8FAFF] flex items-center justify-between border-b border-slate-200/80">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Cohort Digital Twins
                </span>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenAddPatient();
                  }}
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  + Add Custom
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {patients.map((p) => {
                  const isSelected = p.patientId === activePatient.patientId;
                  return (
                    <button
                      key={p.patientId}
                      onClick={() => {
                        onSelectPatient(p);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start justify-between ${
                        isSelected ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-3 border-blue-600' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-600">{p.patientId}</span>
                          <span className="text-xs font-semibold text-[#0F172A]">{p.name.split(' (')[0]}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Age {p.demographics.age} • {p.conditions[0]?.name || 'Healthy'} • {p.currentMedications.length} Meds
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          p.treatmentComplexity === 'CRITICAL'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : p.treatmentComplexity === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.treatmentComplexity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Guided SIH Demo Launch Button with Gradient */}
        <button
          onClick={onOpenGuidedDemo}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] flex items-center space-x-2"
        >
          <Play className="w-3.5 h-3.5 fill-white text-white" />
          <span className="tracking-wide">GUIDED TOUR</span>
        </button>

        {/* Notification Bell */}
        <button
          title="System Notifications"
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors relative hidden sm:flex items-center justify-center shadow-xs"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* Export Twin Record */}
        <button
          onClick={handleExportJson}
          title="Export Patient Digital Twin State (JSON)"
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors hidden md:block shadow-xs"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

