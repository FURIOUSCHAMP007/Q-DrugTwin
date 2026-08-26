import React, { useState } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  Sparkles,
  X,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Filter,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { PatientDigitalTwinState, GroundingSource } from '../../types';
import { ApiService } from '../../services/apiService';
import { VoiceDictationButton } from '../common/VoiceDictationButton';

interface GoogleSearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePatient: PatientDigitalTwinState;
}

const RESEARCH_PRESETS = [
  {
    title: 'FDA SGLT2i Safety Updates',
    query: 'FDA 2024-2025 SGLT2 inhibitors prescribing safety label updates euglycemic DKA eGFR thresholds',
    topic: 'FDA Regulatory'
  },
  {
    title: 'KDIGO 2024 CKD Guidelines',
    query: 'KDIGO 2024 clinical practice guidelines diabetes chronic kidney disease SGLT2i nonsteroidal MRA',
    topic: 'Clinical Practice Guidelines'
  },
  {
    title: 'CPIC CYP2C9 Pharmacogenomics',
    query: 'CPIC guidelines CYP2C9 diplotype warfarin NSAIDs dosing recommendations',
    topic: 'Pharmacogenomics'
  },
  {
    title: 'EMPA-KIDNEY & DAPA-CKD Trials',
    query: 'EMPA-KIDNEY DAPA-CKD trials cardiorenal outcome reduction Stage 3 CKD',
    topic: 'Randomized Clinical Trials'
  }
];

export const GoogleSearchGroundingModal: React.FC<GoogleSearchGroundingModalProps> = ({
  isOpen,
  onClose,
  activePatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All Guidelines & Trials');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    response: string;
    sources: GroundingSource[];
    searchQueries: string[];
    model: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (queryToRun?: string) => {
    const q = queryToRun || searchQuery;
    if (!q.trim()) return;
    setIsLoading(true);
    setSearchQuery(q);

    try {
      const data = await ApiService.searchGrounded(q, activePatient, activeTopic);
      setResult(data);
    } catch (err) {
      console.error('Search grounding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 lg:p-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base lg:text-lg">Google Search Grounded Evidence Engine</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  gemini-3.7-flash (with googleSearch)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live biomedical literature, FDA alerts, and CPIC guidelines grounded to <span className="font-semibold text-white">{activePatient.name}</span> ({activePatient.patientId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Dictation Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search latest FDA warnings, trial evidence, CPIC alleles, drug interactions..."
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceDictationButton
                  size="sm"
                  onTranscribed={(transcript) => {
                    setSearchQuery(transcript);
                    handleSearch(transcript);
                  }}
                  tooltip="Dictate biomedical search query"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Grounding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Search Evidence</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Queries */}
          <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Grounding Presets:
            </span>
            {RESEARCH_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(preset.query)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-[11px] text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 shrink-0 transition-all font-medium flex items-center space-x-1.5"
              >
                <span>{preset.title}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100/70 text-blue-800 font-mono">
                  {preset.topic}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-5 bg-[#F8FAFC]">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-bounce shadow-sm">
                <Globe className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Querying Google Search Grounding with Gemini 3.7 Flash...</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Synthesizing real-time FDA registries, KDIGO/ADA guidelines, PubMed publications, and clinical trial databases.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-5">
              {/* Generated Queries Tag List */}
              {result.searchQueries && result.searchQueries.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Search className="w-3 h-3 text-blue-600" /> Google Search Grounding Queries:
                  </span>
                  {result.searchQueries.map((sq, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono"
                    >
                      "{sq}"
                    </span>
                  ))}
                </div>
              )}

              {/* Synthesized Grounded Clinical Summary */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900">Verified Evidence Synthesis</h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Evidence</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans space-y-2">
                  {result.response}
                </div>
              </div>

              {/* Verified Sources & Grounding Citations */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Verified External Grounding Sources ({result.sources.length})
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Live Google Search Index</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between shadow-xs group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 text-blue-600 font-medium text-xs group-hover:underline">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{source.title || 'Biomedical Reference'}</span>
                        </div>
                        {source.snippet && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                            {source.snippet}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono truncate mt-2 group-hover:text-blue-700">
                        {source.uri}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Real-time Biomedical Search Grounding</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select a preset query above or enter a drug name, trial name, or interaction to retrieve verified clinical trials and FDA evidence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
