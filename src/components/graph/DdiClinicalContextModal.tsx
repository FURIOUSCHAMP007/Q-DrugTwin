import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Filter,
  ShieldCheck,
  FileText,
  Dna,
  Cpu,
  Layers,
  Share2,
  ArrowUpRight,
  ShieldAlert,
  HelpCircle,
  Pill,
  Radio,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { PatientDigitalTwinState, DrugInteraction, DdiClinicalLiteratureResult, DdiLiteratureCitation } from '../../types';
import { ApiService } from '../../services/apiService';
import { VoiceDictationButton } from '../common/VoiceDictationButton';

interface DdiClinicalContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  drugA: string;
  drugB: string;
  ddiData?: DrugInteraction | null;
  patient?: PatientDigitalTwinState;
  onNavigateToSimulation?: (drugIds?: string[]) => void;
  onNavigateToOptimizer?: () => void;
}

const PRESET_CLINICAL_QUESTIONS = [
  'What are the renal clearance and pharmacokinetic consequences of concomitant use?',
  'What clinical trials or case reports evaluate this interaction in CKD/T2D patients?',
  'Are there FDA boxed warnings or dose adjustment thresholds for this combination?',
  'What therapeutic alternatives avoid this metabolic pathway overlap?'
];

const FOCUS_AREAS = [
  { id: 'all', label: 'All Literature', icon: BookOpen },
  { id: 'trials', label: 'Clinical Trials (PubMed)', icon: FileText },
  { id: 'kinetics', label: 'CYP450 & Kinetics', icon: Cpu },
  { id: 'fda', label: 'FDA Safety Alerts', icon: ShieldAlert },
  { id: 'guidelines', label: 'KDIGO & CPIC Guidelines', icon: ShieldCheck }
];

export const DdiClinicalContextModal: React.FC<DdiClinicalContextModalProps> = ({
  isOpen,
  onClose,
  drugA,
  drugB,
  ddiData,
  patient,
  onNavigateToSimulation,
  onNavigateToOptimizer
}) => {
  const [activeFocusArea, setActiveFocusArea] = useState<string>('all');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [literatureResult, setLiteratureResult] = useState<DdiClinicalLiteratureResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'sources' | 'pharmacology' | 'guidance'>('synthesis');

  // Trigger search grounding whenever modal opens or drug pair changes
  useEffect(() => {
    if (isOpen && drugA && drugB) {
      fetchClinicalLiterature();
    }
  }, [isOpen, drugA, drugB]);

  if (!isOpen || !drugA || !drugB) return null;

  const fetchClinicalLiterature = async (overrideQuery?: string) => {
    setIsLoading(true);
    try {
      const result = await ApiService.getDdiClinicalLiterature(drugA, drugB, {
        severity: ddiData?.severity || 'high',
        mechanism: ddiData?.mechanism,
        clinicalEffect: ddiData?.clinicalEffect,
        patient,
        customQuery: overrideQuery || customQuery || undefined
      });
      setLiteratureResult(result);
    } catch (err) {
      console.error('Failed to retrieve DDI clinical literature:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!literatureResult) return;
    const exportText = `=== CLINICAL CONTEXT & PEER-REVIEWED EVIDENCE: ${drugA} ↔ ${drugB} ===\n` +
      `Severity: ${literatureResult.severity.toUpperCase()} | Evidence Level: ${literatureResult.evidenceLevel}\n` +
      `Patient Context: ${patient?.name || 'Active Patient'} (eGFR: ${patient?.organFunction.eGFR ?? 'N/A'} mL/min)\n\n` +
      `LITERATURE SYNTHESIS:\n${literatureResult.summary}\n\n` +
      `MANAGEMENT GUIDANCE:\n${literatureResult.managementGuidance}\n\n` +
      `GROUNDED SOURCES (${literatureResult.sources.length}):\n` +
      literatureResult.sources.map((s, idx) => `[${idx + 1}] ${s.title}\n    URL: ${s.uri}\n    Journal: ${s.journal || 'N/A'}`).join('\n\n');

    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'contraindicated':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'moderate':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getSourceIcon = (sourceType?: string) => {
    switch (sourceType) {
      case 'fda':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'guideline':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'trial':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  // Filter sources based on active focus area
  const displayedSources = (literatureResult?.sources || []).filter((s) => {
    if (activeFocusArea === 'all') return true;
    if (activeFocusArea === 'trials') return s.sourceType === 'trial' || s.sourceType === 'journal';
    if (activeFocusArea === 'fda') return s.sourceType === 'fda';
    if (activeFocusArea === 'guidelines') return s.sourceType === 'guideline';
    return true;
  });

  return (
    <div
      id="ddi-clinical-context-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight flex items-center space-x-2">
                  <span>Clinical Context & Literature Grounding</span>
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/40 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>Google Search Grounding (gemini-3.7-flash)</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                PubMed, MEDLINE, FDA, and KDIGO/CPIC peer-reviewed evidence for{' '}
                <strong className="text-white font-mono">{drugA} ↔ {drugB}</strong>
                {patient && (
                  <span> · In-Vivo Context: <strong>{patient.name}</strong> (eGFR {patient.organFunction.eGFR} mL/min)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={!literatureResult || isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center space-x-1 text-xs font-mono disabled:opacity-50"
              title="Copy Evidence Synthesis"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Export'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drug Pair Information Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Pill className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">{drugA}</span>
              <span className="text-slate-400 font-sans">↔</span>
              <Pill className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-900 text-sm">{drugB}</span>
            </div>

            <span className={`px-2.5 py-1 rounded-lg border font-bold uppercase text-[10px] ${getSeverityBadge(ddiData?.severity || literatureResult?.severity || 'high')}`}>
              Severity: {ddiData?.severity || literatureResult?.severity || 'High Risk'}
            </span>

            {literatureResult?.evidenceLevel && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
                {literatureResult.evidenceLevel}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchClinicalLiterature()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Grounding...' : 'Re-Ground Evidence'}</span>
            </button>
          </div>
        </div>

        {/* Search Refinement & Preset Inquiries Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-200 shrink-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchClinicalLiterature(customQuery);
                }}
                placeholder={`Search specific literature question for ${drugA} + ${drugB} (e.g. "dose reduction in eGFR < 45")...`}
                className="w-full pl-9.5 pr-24 py-2 bg-[#F8FAFF] border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <VoiceDictationButton
                  onTranscript={(transcript) => {
                    setCustomQuery(transcript);
                    fetchClinicalLiterature(transcript);
                  }}
                  className="p-1.5"
                />
              </div>
            </div>

            <button
              onClick={() => fetchClinicalLiterature(customQuery)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Query Literature</span>
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px] font-sans">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold shrink-0">Quick Queries:</span>
            {PRESET_CLINICAL_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomQuery(q);
                  fetchClinicalLiterature(q);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-600 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-[#F8FAFC]">
          {isLoading ? (
            <div className="p-12 text-center space-y-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="relative inline-block">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-pulse">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-base">Retrieving Grounded Biomedical Evidence</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Google Search Grounding is scanning PubMed, MEDLINE, FDA safety advisories, and clinical trial registries for <strong className="text-blue-600 font-mono">{drugA} ↔ {drugB}</strong>...
                </p>
              </div>

              {/* Progress step indicators */}
              <div className="max-w-md mx-auto pt-2 grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Querying Index</span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold flex items-center justify-center space-x-1">
                  <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                  <span>2. Grounding Trials</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center space-x-1">
                  <span>3. Gemini Synthesis</span>
                </div>
              </div>
            </div>
          ) : literatureResult ? (
            <>
              {/* Focus Area Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {FOCUS_AREAS.map((f) => {
                    const Icon = f.icon;
                    const isActive = activeFocusArea === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setActiveFocusArea(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                  <span className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{displayedSources.length} Peer-Reviewed Citations</span>
                  </span>
                </div>
              </div>

              {/* Main Evidence Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 7 cols: Synthesized Literature & Clinical Breakdown */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Synthesis Review Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="font-bold text-[#0F172A] text-sm flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Peer-Reviewed Evidence Synthesis</span>
                      </h4>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                        {literatureResult.model}
                      </span>
                    </div>

                    <div className="prose prose-slate prose-sm max-w-none text-slate-700 text-xs leading-relaxed space-y-3">
                      {literatureResult.summary.split('\n\n').map((para, i) => {
                        if (para.startsWith('###') || para.startsWith('####')) {
                          return (
                            <h5 key={i} className="font-bold text-slate-900 text-xs font-sans mt-3 mb-1 text-blue-900 flex items-center space-x-1.5">
                              <span>{para.replace(/#/g, '').trim()}</span>
                            </h5>
                          );
                        }
                        if (para.startsWith('-')) {
                          return (
                            <ul key={i} className="list-disc pl-4 space-y-1 my-1">
                              {para.split('\n').map((line, liIdx) => (
                                <li key={liIdx} className="text-slate-700 text-xs">
                                  {line.replace(/^- /, '')}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={i} className="text-slate-700 leading-relaxed font-sans text-xs">
                            {para}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pharmacokinetic Mechanism Deep Dive */}
                  <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-purple-700 font-bold flex items-center space-x-1.5">
                        <Cpu className="w-4 h-4 text-purple-600" />
                        <span>Pharmacokinetic & Clearance Pathway</span>
                      </span>
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                        CYP450 / Transporter Kinetics
                      </span>
                    </div>
                    <p className="text-slate-800 font-sans text-xs leading-relaxed">
                      {literatureResult.pharmacokineticMechanism}
                    </p>
                  </div>

                  {/* Actionable Clinical Protocol */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-2.5">
                    <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs font-mono">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Actionable Management & Monitoring Protocols:</span>
                    </div>
                    <p className="text-slate-800 font-sans text-xs leading-relaxed whitespace-pre-line">
                      {literatureResult.managementGuidance}
                    </p>
                  </div>
                </div>

                {/* Right 5 cols: Grounded Peer-Reviewed Sources & Query Telemetry */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Grounding Citations Shelf */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="font-bold text-[#0F172A] text-sm flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span>Indexed Peer-Reviewed Sources</span>
                      </h4>
                      <span className="text-xs font-mono text-slate-500 font-bold">
                        {displayedSources.length} Links
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {displayedSources.map((source, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-xl bg-[#F8FAFF] hover:bg-slate-100 border border-slate-200 transition-all space-y-1.5 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                              {getSourceIcon(source.sourceType)}
                              <span className="font-bold text-slate-800 uppercase">
                                {source.journal || 'Peer-Reviewed Literature'}
                              </span>
                              {source.year && (
                                <span className="text-slate-400">({source.year})</span>
                              )}
                            </div>
                            <a
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors shrink-0"
                              title="Open literature link in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-xs text-[#0F172A] hover:text-blue-600 font-sans block leading-snug group-hover:underline"
                          >
                            {source.title}
                          </a>

                          {source.snippet && (
                            <p className="text-[11px] text-slate-600 font-sans line-clamp-2 leading-relaxed">
                              {source.snippet}
                            </p>
                          )}

                          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="truncate max-w-[200px] text-slate-500">
                              {source.uri.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                            </span>
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified Reference</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search Queries Executed Box */}
                  {literatureResult.searchQueries && literatureResult.searchQueries.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 text-xs font-mono">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center space-x-1">
                        <Search className="w-3 h-3 text-blue-600" />
                        <span>Google Search Grounding Telemetry:</span>
                      </span>
                      <div className="space-y-1">
                        {literatureResult.searchQueries.map((query, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center space-x-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="truncate font-mono">{query}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Jump Action Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-2.5">
                    <h5 className="font-bold text-blue-900 text-xs font-mono flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-700" />
                      <span>Take Action on this Interaction</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {onNavigateToSimulation && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToSimulation([drugA, drugB]);
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-800 font-bold transition-all flex items-center justify-center space-x-1 text-center shadow-xs"
                        >
                          <span>Simulate Lab</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onNavigateToOptimizer && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToOptimizer();
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-purple-600 hover:text-white border border-purple-200 text-purple-800 font-bold transition-all flex items-center justify-center space-x-1 text-center shadow-xs"
                        >
                          <span>QUBO Solver</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Grounded peer-reviewed citations are synthesized for clinical decision support. Always verify against institutional protocols.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={!literatureResult || isLoading}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied Summary' : 'Copy Literature Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold transition-all shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
