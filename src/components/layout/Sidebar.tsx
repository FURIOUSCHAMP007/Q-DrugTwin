import React from 'react';
import {
  Home,
  LayoutDashboard,
  Users,
  Activity,
  Pill,
  FlaskConical,
  Network,
  Cpu,
  Bot,
  SlidersHorizontal,
  BarChart3,
  GitCompare,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export type NavigationTab =
  | 'home'
  | 'overview'
  | 'patients'
  | 'digital-twin'
  | 'medications'
  | 'simulation-lab'
  | 'interactions'
  | 'quantum-optimizer'
  | 'ai-insights'
  | 'explainability'
  | 'model-performance'
  | 'scenario-comparison';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  highRiskCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  highRiskCount = 3
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    group: 'primary' | 'simulation' | 'intelligence' | 'analytics';
  }[] = [
    { id: 'home', label: 'Home Portal', icon: Home, badge: 'Home', badgeColor: 'bg-cyan-500/20 text-cyan-300', group: 'primary' },
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard, group: 'primary' },
    { id: 'patients', label: 'Patient Cohort', icon: Users, badge: '6 Synthetics', group: 'primary' },
    { id: 'digital-twin', label: 'Patient Digital Twin', icon: Activity, badge: 'State Pt', badgeColor: 'bg-cyan-500/20 text-cyan-300', group: 'primary' },
    { id: 'medications', label: 'Medication Workspace', icon: Pill, group: 'primary' },

    { id: 'simulation-lab', label: 'Simulation Lab', icon: FlaskConical, badge: 'What-If', badgeColor: 'bg-sky-500/20 text-sky-300', group: 'simulation' },
    { id: 'interactions', label: 'Biomedical Graph', icon: Network, badge: `${highRiskCount} Alerts`, badgeColor: 'bg-rose-500/20 text-rose-300', group: 'simulation' },
    { id: 'quantum-optimizer', label: 'Quantum Optimizer', icon: Cpu, badge: 'QUBO/QAOA', badgeColor: 'bg-violet-500/20 text-violet-300', group: 'simulation' },

    { id: 'ai-insights', label: 'Q-AI Assistant', icon: Bot, badge: 'Gemini 3.7', badgeColor: 'bg-indigo-500/20 text-indigo-300', group: 'intelligence' },
    { id: 'explainability', label: 'Explainable AI (XAI)', icon: SlidersHorizontal, badge: 'SHAP', group: 'intelligence' },

    { id: 'scenario-comparison', label: 'Scenario Matrix', icon: GitCompare, group: 'analytics' },
    { id: 'model-performance', label: 'NVIDIA AI Engine', icon: BarChart3, badge: 'CUDA/RAPIDS', badgeColor: 'bg-emerald-500/20 text-emerald-300', group: 'analytics' }
  ];

  return (
    <aside
      className={`bg-white text-slate-700 border-r border-slate-200 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 z-20 shadow-sm ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand header for sidebar */}
        <button
          onClick={() => onSelectTab('home')}
          className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} bg-[#F8FAFF] hover:bg-[#F1F5FF] border-b border-slate-200 text-left transition-colors cursor-pointer group`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] via-[#3B82F6] to-[#7C3AED] flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            Q
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent leading-none">
                Q-DRUGTWIN
              </span>
              <span className="text-[10px] text-blue-600 font-mono font-medium mt-1">
                Deep-Tech Decision Portal
              </span>
            </div>
          )}
        </button>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Group 1: Core */}
          <div>
            {!collapsed && (
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1 mb-1 font-mono">
                Overview & Core
              </div>
            )}
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === 'primary')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        collapsed ? 'justify-center px-0' : 'justify-between px-3'
                      } py-2.5 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            isActive
                              ? 'bg-blue-100/80 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </nav>
          </div>

          {/* Group 2: Simulation & Quantum */}
          <div>
            {!collapsed && (
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1 mb-1 font-mono">
                Simulation & Quantum
              </div>
            )}
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === 'simulation')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        collapsed ? 'justify-center px-0' : 'justify-between px-3'
                      } py-2.5 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 font-bold border border-purple-200/80 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            isActive
                              ? 'bg-purple-100/80 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </nav>
          </div>

          {/* Group 3: Intelligence & Analytics */}
          <div>
            {!collapsed && (
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1 mb-1 font-mono">
                Intelligence & Benchmarks
              </div>
            )}
            <nav className="space-y-1">
              {navItems
                .filter((item) => item.group === 'intelligence' || item.group === 'analytics')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        collapsed ? 'justify-center px-0' : 'justify-between px-3'
                      } py-2.5 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            isActive
                              ? 'bg-blue-100/80 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Footer Site Operator / Collapse Button */}
        <div className="p-3 border-t border-slate-200 bg-[#F8FAFF] flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-xs text-white font-extrabold shadow-md shadow-blue-500/20">
                DR
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 leading-none">Dr. Clinical Lead</p>
                <p className="text-blue-600 text-[10px] mt-0.5 font-medium">Precision Pharmacologist</p>
              </div>
            </div>
          ) : null}
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-xs ${
              collapsed ? 'mx-auto' : ''
            }`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
