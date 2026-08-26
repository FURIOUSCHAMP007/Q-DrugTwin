import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Network,
  Search,
  Filter,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Eye,
  Activity,
  Cpu,
  Dna,
  Pill,
  Radio,
  Flame,
  ArrowUpRight,
  Play,
  RotateCcw,
  Target,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { PatientDigitalTwinState, DrugInteraction } from '../../types';
import { KNOWN_DRUG_INTERACTIONS } from '../../data/mockDatabase';
import { DdiClinicalContextModal } from '../graph/DdiClinicalContextModal';
import {
  BIOMEDICAL_GRAPH_NODES,
  BIOMEDICAL_GRAPH_EDGES,
  PREBUILT_PATH_SCENARIOS,
  BiomedicalNode,
  BiomedicalEdge,
  GraphNodeCategory,
  EdgeSeverity,
  PrebuiltPathScenario
} from '../../data/biomedicalGraphData';

interface InteractionGraphViewProps {
  patient?: PatientDigitalTwinState;
  onNavigate?: (tab: any) => void;
}

export const InteractionGraphView: React.FC<InteractionGraphViewProps> = ({
  patient,
  onNavigate
}) => {
  // --- Graph Data States ---
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const initial: Record<string, { x: number; y: number }> = {};
    BIOMEDICAL_GRAPH_NODES.forEach((n) => {
      initial[n.id] = { x: n.x, y: n.y };
    });
    return initial;
  });

  const [activeCandidates, setActiveCandidates] = useState<string[]>(['Empagliflozin']);

  // --- Interaction & Selection States ---
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('Lisinopril');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>('e5');
  const [selectedDdi, setSelectedDdi] = useState<DrugInteraction | null>(KNOWN_DRUG_INTERACTIONS[0]);
  const [activeScenario, setActiveScenario] = useState<PrebuiltPathScenario | null>(PREBUILT_PATH_SCENARIOS[1]);

  // --- Google Search Grounding Clinical Context Modal State ---
  const [isClinicalContextOpen, setIsClinicalContextOpen] = useState<boolean>(false);
  const [clinicalContextPair, setClinicalContextPair] = useState<{
    drugA: string;
    drugB: string;
    ddiData?: DrugInteraction | null;
  }>({
    drugA: 'Lisinopril',
    drugB: 'Spironolactone',
    ddiData: KNOWN_DRUG_INTERACTIONS[0]
  });

  const handleOpenClinicalContext = (drugA: string, drugB: string, ddi?: DrugInteraction | null) => {
    setClinicalContextPair({
      drugA,
      drugB,
      ddiData: ddi || KNOWN_DRUG_INTERACTIONS.find(
        (k) => (k.drugA === drugA && k.drugB === drugB) || (k.drugA === drugB && k.drugB === drugA)
      ) || null
    });
    setIsClinicalContextOpen(true);
  };

  // --- Filter & Search States ---
  const [categoryFilter, setCategoryFilter] = useState<GraphNodeCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightPatientOnly, setHighlightPatientOnly] = useState<boolean>(false);
  const [enableMetabolicPulses, setEnableMetabolicPulses] = useState<boolean>(true);

  // --- Path Finding Mode States ---
  const [pathFindSource, setPathFindSource] = useState<string>('Omeprazole');
  const [pathFindTarget, setPathFindTarget] = useState<string>('Thrombosis_ADR');
  const [customPathActive, setCustomPathActive] = useState<boolean>(false);

  // --- Canvas Pan & Zoom States ---
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragNodeInitialPos, setDragNodeInitialPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Available visible nodes (including toggled candidates)
  const visibleNodes = useMemo(() => {
    return BIOMEDICAL_GRAPH_NODES.filter((node) => {
      if (node.isCandidate && !activeCandidates.includes(node.id)) {
        return false;
      }
      return true;
    });
  }, [activeCandidates]);

  // Available visible edges
  const visibleEdges = useMemo(() => {
    const nodeIds = new Set(visibleNodes.map((n) => n.id));
    return BIOMEDICAL_GRAPH_EDGES.filter(
      (edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)
    );
  }, [visibleNodes]);

  // Node Map for rapid lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, BiomedicalNode>();
    BIOMEDICAL_GRAPH_NODES.forEach((n) => map.set(n.id, n));
    return map;
  }, []);

  // Adjacency map for 1-hop & 2-hop neighborhood highlighting
  const adjacencyMap = useMemo(() => {
    const adj = new Map<string, Set<string>>();
    visibleNodes.forEach((n) => adj.set(n.id, new Set<string>()));
    visibleEdges.forEach((e) => {
      adj.get(e.from)?.add(e.to);
      adj.get(e.to)?.add(e.from);
    });
    return adj;
  }, [visibleNodes, visibleEdges]);

  // Active Path discovery (BFS shortest path)
  const activePathEdges = useMemo(() => {
    let source = '';
    let target = '';

    if (customPathActive && pathFindSource && pathFindTarget) {
      source = pathFindSource;
      target = pathFindTarget;
    } else if (activeScenario) {
      source = activeScenario.sourceId;
      target = activeScenario.targetId;
    } else {
      return new Set<string>();
    }

    if (source === target || !nodeMap.has(source) || !nodeMap.has(target)) {
      return new Set<string>();
    }

    // BFS search
    const queue: { current: string; path: string[]; edgePath: string[] }[] = [
      { current: source, path: [source], edgePath: [] }
    ];
    const visited = new Set<string>([source]);

    while (queue.length > 0) {
      const { current, path, edgePath } = queue.shift()!;
      if (current === target) {
        return new Set<string>(edgePath);
      }

      // Find outgoing or bidirectional connected edges
      const connectedEdges = visibleEdges.filter(
        (e) => e.from === current || e.to === current
      );

      for (const edge of connectedEdges) {
        const nextNode = edge.from === current ? edge.to : edge.from;
        if (!visited.has(nextNode)) {
          visited.add(nextNode);
          queue.push({
            current: nextNode,
            path: [...path, nextNode],
            edgePath: [...edgePath, edge.id]
          });
        }
      }
    }

    return new Set<string>();
  }, [customPathActive, pathFindSource, pathFindTarget, activeScenario, visibleEdges, nodeMap]);

  // Active Path Nodes
  const activePathNodes = useMemo(() => {
    const nodesInPath = new Set<string>();
    visibleEdges.forEach((e) => {
      if (activePathEdges.has(e.id)) {
        nodesInPath.add(e.from);
        nodesInPath.add(e.to);
      }
    });
    return nodesInPath;
  }, [activePathEdges, visibleEdges]);

  // Focused 1-hop & 2-hop neighborhood
  const focusedNeighborhood = useMemo(() => {
    if (!selectedNodeId) return null;
    const neighbors = new Set<string>([selectedNodeId]);
    const firstHop = adjacencyMap.get(selectedNodeId) || new Set<string>();
    firstHop.forEach((neighbor) => {
      neighbors.add(neighbor);
      // 2-hop expansion
      const secondHop = adjacencyMap.get(neighbor) || new Set<string>();
      secondHop.forEach((n2) => neighbors.add(n2));
    });
    return neighbors;
  }, [selectedNodeId, adjacencyMap]);

  // Filtered DDI pairs
  const filteredDdis = useMemo(() => {
    return KNOWN_DRUG_INTERACTIONS.filter(
      (d) => severityFilter === 'all' || d.severity === severityFilter
    );
  }, [severityFilter]);

  // Selected Node Details
  const activeNodeDetails = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodeMap.get(selectedNodeId) || null;
  }, [selectedNodeId, nodeMap]);

  // Selected Edge Details
  const activeEdgeDetails = useMemo(() => {
    if (!selectedEdgeId) return null;
    return visibleEdges.find((e) => e.id === selectedEdgeId) || null;
  }, [selectedEdgeId, visibleEdges]);

  // Connected Inflow / Outflow for selected node
  const nodeConnections = useMemo(() => {
    if (!selectedNodeId) return { inbound: [], outbound: [] };
    const inbound = visibleEdges.filter((e) => e.to === selectedNodeId);
    const outbound = visibleEdges.filter((e) => e.from === selectedNodeId);
    return { inbound, outbound };
  }, [selectedNodeId, visibleEdges]);

  // Toggle candidate medication in graph
  const handleToggleCandidate = (candidateId: string) => {
    setActiveCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  // Reset graph positions to default
  const handleResetPositions = () => {
    const defaultPos: Record<string, { x: number; y: number }> = {};
    BIOMEDICAL_GRAPH_NODES.forEach((n) => {
      defaultPos[n.id] = { x: n.x, y: n.y };
    });
    setNodePositions(defaultPos);
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  // Node Drag Handlers (Pointer / Mouse Events)
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragNodeInitialPos(nodePositions[nodeId] || { x: 0, y: 0 });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggedNodeId) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        const newX = Math.max(30, Math.min(870, dragNodeInitialPos.x + dx));
        const newY = Math.max(30, Math.min(570, dragNodeInitialPos.y + dy));

        setNodePositions((prev) => ({
          ...prev,
          [draggedNodeId]: { x: newX, y: newY }
        }));
      } else if (isPanning) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    },
    [draggedNodeId, isPanning, dragStart, zoom, dragNodeInitialPos]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNodeId(null);
    setIsPanning(false);
  }, []);

  // Category Icon & Color Helper
  const getCategoryMeta = (cat: GraphNodeCategory) => {
    switch (cat) {
      case 'drug':
        return {
          label: 'Medication (Rx)',
          color: '#2563EB',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Pill
        };
      case 'enzyme':
        return {
          label: 'CYP Isozyme / Enzyme',
          color: '#7C3AED',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Cpu
        };
      case 'transporter':
        return {
          label: 'Transporter (OCT/OATP)',
          color: '#0891B2',
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          icon: Radio
        };
      case 'target':
        return {
          label: 'Biological Target',
          color: '#059669',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Target
        };
      case 'pathway':
        return {
          label: 'Physiological Pathway',
          color: '#4F46E5',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Activity
        };
      case 'adr':
        return {
          label: 'Adverse Toxicity Signal',
          color: '#E11D48',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: AlertTriangle
        };
      case 'pgx':
        return {
          label: 'PGx Genomic Diplotype',
          color: '#9333EA',
          bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
          icon: Dna
        };
      default:
        return {
          label: 'Biomedical Entity',
          color: '#64748B',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Network
        };
    }
  };

  // Severity Meta Helper
  const getSeverityBadge = (sev: EdgeSeverity) => {
    switch (sev) {
      case 'contraindicated':
        return 'bg-rose-600 text-white font-black';
      case 'high':
        return 'bg-rose-100 text-rose-700 border border-rose-200 font-bold';
      case 'moderate':
        return 'bg-amber-100 text-amber-700 border border-amber-200 font-bold';
      case 'genomic':
        return 'bg-purple-100 text-purple-700 border border-purple-200 font-bold';
      case 'therapeutic':
      default:
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium';
    }
  };

  return (
    <div className="space-y-5 pb-12" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Top Banner Header - Clean & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200 flex items-center space-x-1">
              <Network className="w-3.5 h-3.5" />
              <span>PHARMAGNN KNOWLEDGE GRAPH</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {visibleNodes.length} nodes · {visibleEdges.length} links
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#0F172A] mt-1">
            Drug Interaction & <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Metabolic Link Explorer</span>
          </h2>
          <p className="text-xs text-slate-600 font-normal">
            Visualize multi-hop connections between medications, CYP450 enzymes, transporters, and adverse risk pathways.
          </p>
        </div>

        {/* Essential Quick Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => {
              if (selectedDdi) {
                handleOpenClinicalContext(selectedDdi.drugA, selectedDdi.drugB, selectedDdi);
              } else {
                handleOpenClinicalContext('Lisinopril', 'Spironolactone');
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all border bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200 hover:border-blue-300 shadow-xs"
            title="Retrieve Google Search Grounded Peer-Reviewed Literature for Active DDI"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Clinical Context</span>
          </button>

          <button
            onClick={() => setHighlightPatientOnly(!highlightPatientOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all border ${
              highlightPatientOnly
                ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Active Regimen Only</span>
          </button>

          <button
            onClick={handleResetPositions}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all"
            title="Reset Graph Layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prebuilt Scenarios Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-xs font-bold text-[#0F172A] font-mono">
            Highlighted Pathway Scenarios:
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
          {PREBUILT_PATH_SCENARIOS.map((scenario) => {
            const isCurrent = activeScenario?.id === scenario.id && !customPathActive;
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  setActiveScenario(scenario);
                  setCustomPathActive(false);
                  setSelectedNodeId(scenario.sourceId);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all border flex items-center space-x-2 shrink-0 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs border-transparent font-bold'
                    : 'bg-[#F8FAFF] text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    scenario.severity === 'contraindicated'
                      ? 'bg-rose-500'
                      : scenario.severity === 'high'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>{scenario.name}</span>
                <span className={`text-[9px] px-1 py-0.5 rounded-md uppercase font-bold ${
                  isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {scenario.riskBadge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Grid: Graph Canvas (Left 8 Cols) & Knowledge Dossier (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Interactive Canvas & Toolbar */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 lg:p-5 shadow-xs flex flex-col space-y-3">
            {/* Toolbar: Category Filters & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono">
                <span className="text-slate-500 font-semibold uppercase text-[10px] mr-1">Layer:</span>
                {[
                  { id: 'all', label: 'All Layers' },
                  { id: 'drug', label: 'Drugs' },
                  { id: 'enzyme', label: 'CYP Isozymes' },
                  { id: 'transporter', label: 'Transporters' },
                  { id: 'target', label: 'Targets' },
                  { id: 'pathway', label: 'Pathways' },
                  { id: 'adr', label: 'ADR Risks' },
                  { id: 'pgx', label: 'PGx' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap text-[11px] ${
                      categoryFilter === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-52 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Find node / isozyme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono text-[#0F172A]"
                />
              </div>
            </div>

            {/* SVG Graph Canvas Container */}
            <div
              ref={svgContainerRef}
              className="relative w-full h-[580px] bg-[#F8FAFF] rounded-2xl border border-slate-200/90 overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
            >
              {/* Subtle Grid Dot Background */}
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#64748B_1px,transparent_1px)] [background-size:20px_20px]" />

              {/* Canvas Controls Overlay (Bottom Right) */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm text-slate-700">
                <button
                  onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1 text-slate-600">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200" />
                <button
                  onClick={() => {
                    setZoom(1.0);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Fit to Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Candidate Quick Add Tray (Top Left Overlay) */}
              <div className="absolute top-3.5 left-3.5 z-20 flex items-center space-x-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Simulate Candidate:</span>
                </span>
                {[
                  { id: 'Empagliflozin', label: '+ Empagliflozin (SGLT2i)' },
                  { id: 'Pantoprazole', label: '+ Pantoprazole (Safe PPI)' },
                  { id: 'Finerenone', label: '+ Finerenone (MRA)' }
                ].map((cand) => {
                  const isActive = activeCandidates.includes(cand.id);
                  return (
                    <button
                      key={cand.id}
                      onClick={() => handleToggleCandidate(cand.id)}
                      className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {cand.label}
                    </button>
                  );
                })}
              </div>

              {/* Main SVG Graph */}
              <svg
                viewBox="0 0 900 600"
                className="w-full h-full"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center'
                }}
              >
                <defs>
                  {/* Marker Arrows for Directed Edges */}
                  <marker
                    id="arrow-therapeutic"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB" />
                  </marker>
                  <marker
                    id="arrow-high"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#E11D48" />
                  </marker>
                  <marker
                    id="arrow-contraindicated"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#E11D48" />
                  </marker>
                  <marker
                    id="arrow-moderate"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
                  </marker>
                  <marker
                    id="arrow-purple"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#7C3AED" />
                  </marker>
                  <marker
                    id="arrow-emerald"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
                  </marker>

                  {/* Glow filter for active path & selections */}
                  <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* --- RENDER EDGES --- */}
                <g className="edges-layer">
                  {visibleEdges.map((edge) => {
                    const sourcePos = nodePositions[edge.from] || { x: 100, y: 100 };
                    const targetPos = nodePositions[edge.to] || { x: 200, y: 200 };

                    const isInActivePath = activePathEdges.has(edge.id);
                    const isEdgeSelected = selectedEdgeId === edge.id;
                    const isSourceOrTargetSelected =
                      selectedNodeId === edge.from || selectedNodeId === edge.to;

                    // Match search or category dimming
                    let isDimmed = false;
                    if (focusedNeighborhood && !focusedNeighborhood.has(edge.from) && !focusedNeighborhood.has(edge.to)) {
                      isDimmed = true;
                    }
                    if (activePathNodes.size > 0 && !activePathNodes.has(edge.from) && !activePathNodes.has(edge.to)) {
                      isDimmed = true;
                    }

                    // Stroke styles
                    let strokeColor = edge.color;
                    let strokeWidth = isEdgeSelected ? 3.5 : isInActivePath ? 3.0 : isSourceOrTargetSelected ? 2.5 : 1.8;
                    let opacity = isDimmed ? 0.2 : isInActivePath ? 1.0 : isSourceOrTargetSelected ? 0.95 : 0.75;
                    let strokeDash = edge.severity === 'contraindicated' ? '5 3' : edge.severity === 'high' ? '4 2' : 'none';

                    let markerId = 'arrow-therapeutic';
                    if (edge.severity === 'contraindicated' || edge.severity === 'high') {
                      markerId = 'arrow-high';
                    } else if (edge.severity === 'moderate') {
                      markerId = 'arrow-moderate';
                    } else if (edge.severity === 'genomic') {
                      markerId = 'arrow-purple';
                    } else if (edge.color === '#059669') {
                      markerId = 'arrow-emerald';
                    }

                    // Curve path computation for smooth organic graph feel
                    const midX = (sourcePos.x + targetPos.x) / 2;
                    const midY = (sourcePos.y + targetPos.y) / 2;

                    return (
                      <g
                        key={edge.id}
                        className="cursor-pointer transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEdgeId(edge.id);
                        }}
                      >
                        {/* Interactive Click Hitbox */}
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke="transparent"
                          strokeWidth="16"
                        />

                        {/* Visual Edge Line */}
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDash}
                          opacity={opacity}
                          markerEnd={`url(#${markerId})`}
                          filter={isInActivePath || isEdgeSelected ? 'url(#path-glow)' : undefined}
                        />

                        {/* Animated Travelling Particle along active path or when flux pulse is active */}
                        {(isInActivePath || (enableMetabolicPulses && !isDimmed)) && (
                          <circle r={isInActivePath ? '4' : '2.5'} fill={strokeColor} opacity="0.9">
                            <animateMotion
                              path={`M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`}
                              dur={isInActivePath ? '1.8s' : '3.5s'}
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}

                        {/* Edge Label on active selection or path */}
                        {(isEdgeSelected || isInActivePath) && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x="-50"
                              y="-9"
                              width="100"
                              height="18"
                              rx="9"
                              fill="#FFFFFF"
                              stroke={strokeColor}
                              strokeWidth="1.5"
                              className="drop-shadow-xs"
                            />
                            <text
                              x="0"
                              y="3.5"
                              textAnchor="middle"
                              className="fill-slate-800 text-[8.5px] font-mono font-bold select-none"
                            >
                              {edge.label.length > 18 ? edge.label.substring(0, 16) + '…' : edge.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* --- RENDER NODES --- */}
                <g className="nodes-layer">
                  {visibleNodes.map((node) => {
                    const pos = nodePositions[node.id] || { x: node.x, y: node.y };
                    const isSelected = selectedNodeId === node.id;
                    const isInPath = activePathNodes.has(node.id);
                    const isPatientMed = node.patientMatch;

                    // Match Category & Search Filters
                    let isDimmed = false;
                    if (categoryFilter !== 'all' && node.category !== categoryFilter) {
                      isDimmed = true;
                    }
                    if (highlightPatientOnly && !node.patientMatch) {
                      isDimmed = true;
                    }
                    if (searchQuery.trim() !== '') {
                      const q = searchQuery.toLowerCase();
                      if (
                        !node.label.toLowerCase().includes(q) &&
                        !node.subLabel.toLowerCase().includes(q)
                      ) {
                        isDimmed = true;
                      }
                    }
                    if (focusedNeighborhood && !focusedNeighborhood.has(node.id)) {
                      isDimmed = true;
                    }
                    if (activePathNodes.size > 0 && !activePathNodes.has(node.id)) {
                      isDimmed = true;
                    }

                    const meta = getCategoryMeta(node.category);
                    const radius =
                      node.category === 'drug'
                        ? 22
                        : node.category === 'adr'
                        ? 19
                        : node.category === 'enzyme' || node.category === 'transporter'
                        ? 17
                        : 15;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className="cursor-pointer select-none transition-transform"
                        onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(node.id);
                        }}
                        opacity={isDimmed ? 0.25 : 1.0}
                      >
                        {/* Outer Pulsing Halo on Selected or Path Nodes */}
                        {(isSelected || isInPath) && (
                          <circle
                            r={radius + 8}
                            fill="none"
                            stroke={meta.color}
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                            className="animate-spin-slow opacity-80"
                          />
                        )}

                        {/* Patient Regimen In-Vivo Indicator Ring */}
                        {isPatientMed && (
                          <circle
                            r={radius + 4}
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2"
                            className="opacity-90"
                          />
                        )}

                        {/* Node Background Disc */}
                        <circle
                          r={radius}
                          fill={meta.color}
                          stroke={isSelected ? '#0F172A' : '#FFFFFF'}
                          strokeWidth={isSelected ? '3.5' : '2.5'}
                          className="drop-shadow-md hover:scale-110 transition-transform"
                        />

                        {/* Inner Node Icon Initial or Acronym */}
                        <text
                          y="4"
                          textAnchor="middle"
                          className="fill-white text-[10px] font-mono font-extrabold select-none pointer-events-none"
                        >
                          {node.label.substring(0, 3).toUpperCase()}
                        </text>

                        {/* Primary Node Text Label */}
                        <text
                          y={radius + 14}
                          textAnchor="middle"
                          className="fill-[#0F172A] text-[11px] font-sans font-bold select-none drop-shadow-xs"
                        >
                          {node.label}
                        </text>

                        {/* Subtitle Label */}
                        <text
                          y={radius + 25}
                          textAnchor="middle"
                          className="fill-slate-500 text-[8.5px] font-mono font-medium select-none"
                        >
                          {node.category.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Interactive Graph Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-3.5 flex-wrap gap-y-1">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-slate-800 font-semibold">Active Rx</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-600" />
                  <span className="text-slate-800 font-semibold">CYP Isozyme</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-600" />
                  <span className="text-slate-800 font-semibold">Transporter</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="text-slate-800 font-semibold">Target / Pathway</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-600" />
                  <span className="text-slate-800 font-semibold">ADR Toxicity</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-fuchsia-600" />
                  <span className="text-slate-800 font-semibold">PGx Variant</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-blue-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Drag any node to rearrange · Click for deep dossier</span>
              </div>
            </div>
          </div>

          {/* Interactive Multi-Hop Path Custom Tracer Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-[#0F172A]">Custom Multi-Hop Path Discovery (BFS Link Engine):</span>
              </div>
              <button
                onClick={() => setCustomPathActive(!customPathActive)}
                className={`px-3 py-1 rounded-xl font-bold uppercase transition-all ${
                  customPathActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {customPathActive ? 'Active Path Tracing' : 'Enable Custom Trace'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Origin Node:</label>
                <select
                  value={pathFindSource}
                  onChange={(e) => {
                    setPathFindSource(e.target.value);
                    setCustomPathActive(true);
                  }}
                  className="w-full p-2 bg-[#F8FAFF] border border-slate-200 rounded-xl text-xs font-mono text-[#0F172A]"
                >
                  {visibleNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Target Endpoint Node:</label>
                <select
                  value={pathFindTarget}
                  onChange={(e) => {
                    setPathFindTarget(e.target.value);
                    setCustomPathActive(true);
                  }}
                  className="w-full p-2 bg-[#F8FAFF] border border-slate-200 rounded-xl text-xs font-mono text-[#0F172A]"
                >
                  {visibleNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Path status result */}
            {activePathEdges.size > 0 ? (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Found continuous multi-hop causal route ({activePathEdges.size} intermediate hops)</span>
                </span>
                <span className="text-[11px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                  GNN Link Score: 98.4%
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                Select distinct source and destination nodes to trace pharmacological linkage.
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Selected Entity Dossier & Identified DDI Pairs */}
        <div className="lg:col-span-4 space-y-4">
          {/* Deep Node Dossier Card */}
          {activeNodeDetails ? (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getCategoryMeta(activeNodeDetails.category).color }}
                  />
                  <span className="font-bold text-[#0F172A] text-sm font-sans">
                    {activeNodeDetails.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    getCategoryMeta(activeNodeDetails.category).bg
                  }`}
                >
                  {activeNodeDetails.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Classification & Specification:
                </span>
                <p className="text-slate-800 font-sans text-xs mt-0.5 font-medium">
                  {activeNodeDetails.subLabel}
                </p>
              </div>

              {activeNodeDetails.halfLife && (
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Plasma Half-Life:</span>
                    <span className="font-bold text-slate-800">{activeNodeDetails.halfLife}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Route:</span>
                    <span className="font-bold text-slate-800">{activeNodeDetails.route || 'Oral'}</span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Biochemical Mechanism:
                </span>
                <p className="text-slate-700 font-sans text-xs mt-1 leading-relaxed">
                  {activeNodeDetails.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                <span className="text-[10px] text-blue-800 uppercase font-bold block mb-1 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>Clinical Impact & In-Vivo Safety:</span>
                </span>
                <p className="text-slate-800 font-sans text-xs leading-relaxed">
                  {activeNodeDetails.clinicalSignificance}
                </p>
              </div>

              {/* Medication Node Clinical Literature Quick Action */}
              {activeNodeDetails.category === 'medication' && (
                <button
                  onClick={() => {
                    const interactingDdi = KNOWN_DRUG_INTERACTIONS.find(
                      (k) => k.drugA === activeNodeDetails.id || k.drugB === activeNodeDetails.id
                    );
                    if (interactingDdi) {
                      handleOpenClinicalContext(interactingDdi.drugA, interactingDdi.drugB, interactingDdi);
                    } else {
                      handleOpenClinicalContext(activeNodeDetails.id, 'Lisinopril');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Clinical Literature & DDI Context</span>
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 ml-1" />
                </button>
              )}

              {/* Inflow & Outflow Links List */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Connected Pathway Links ({nodeConnections.inbound.length + nodeConnections.outbound.length}):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {nodeConnections.outbound.map((edge) => (
                    <button
                      key={edge.id}
                      onClick={() => {
                        setSelectedNodeId(edge.to);
                        setSelectedEdgeId(edge.id);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-[#F8FAFF] hover:bg-slate-100 border border-slate-200 text-[11px] font-sans flex items-center justify-between group transition-colors"
                    >
                      <span className="text-slate-800 truncate">
                        → <strong className="text-blue-700 font-mono">{edge.to}</strong> ({edge.label})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                    </button>
                  ))}
                  {nodeConnections.inbound.map((edge) => (
                    <button
                      key={edge.id}
                      onClick={() => {
                        setSelectedNodeId(edge.from);
                        setSelectedEdgeId(edge.id);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-[#F8FAFF] hover:bg-slate-100 border border-slate-200 text-[11px] font-sans flex items-center justify-between group transition-colors"
                    >
                      <span className="text-slate-800 truncate">
                        ← <strong className="text-purple-700 font-mono">{edge.from}</strong> ({edge.label})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-slate-500 text-xs font-mono">
              Click any node or link in the graph to inspect its complete biochemical dossier.
            </div>
          )}

          {/* Identified Interaction Pairs List */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Identified Clinical DDI Pairs</span>
              </h3>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                {filteredDdis.length} Flags
              </span>
            </div>

            {/* Severity Filter Chips */}
            <div className="flex items-center space-x-1.5 font-mono text-[10px]">
              {['all', 'contraindicated', 'high', 'moderate'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                    severityFilter === sev
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {filteredDdis.map((ddi) => {
                const isSelected = selectedDdi?.id === ddi.id;
                return (
                  <div
                    key={ddi.id}
                    onClick={() => {
                      setSelectedDdi(ddi);
                      // Auto highlight connected drug nodes in graph if present
                      if (nodeMap.has(ddi.drugA)) setSelectedNodeId(ddi.drugA);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-300'
                        : 'bg-[#F8FAFF] border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-[#0F172A]">
                        {ddi.drugA} ↔ {ddi.drugB}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenClinicalContext(ddi.drugA, ddi.drugB, ddi);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold flex items-center space-x-1 transition-colors"
                          title="Retrieve Peer-Reviewed Literature with Google Search Grounding"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                          <span>Context</span>
                        </button>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getSeverityBadge(
                            ddi.severity as EdgeSeverity
                          )}`}
                        >
                          {ddi.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans mt-1 line-clamp-2">
                      {ddi.mechanism}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected DDI Clinical Management Action Box */}
          {selectedDdi && (
            <div className="rounded-2xl bg-white border border-purple-200/80 p-5 shadow-xs space-y-3.5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-purple-700 font-bold">INTERACTION DOSSIER</span>
                <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                  GNN Confidence: {(selectedDdi.evidenceConfidence * 100).toFixed(0)}%
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pharmacological Mechanism:</span>
                <p className="text-slate-800 font-sans text-xs mt-0.5 leading-relaxed">{selectedDdi.mechanism}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Clinical Impact / Risk:</span>
                <p className="text-rose-700 font-sans text-xs mt-0.5 font-semibold">{selectedDdi.clinicalEffect}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFF] border border-slate-200">
                <span className="text-[10px] text-blue-700 uppercase font-bold block mb-1">
                  Clinician Management Guidance:
                </span>
                <p className="text-slate-700 font-sans text-xs leading-relaxed">
                  {selectedDdi.managementRecommendation}
                </p>
              </div>

              {/* Primary Google Search Grounding Clinical Context Button */}
              <button
                id="ddi-clinical-context-button"
                onClick={() => handleOpenClinicalContext(selectedDdi.drugA, selectedDdi.drugB, selectedDdi)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-mono text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 group"
                title="Retrieve latest peer-reviewed literature via Google Search Grounding"
              >
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse shrink-0" />
                <span>Clinical Context (Literature Grounding)</span>
                <BookOpen className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Navigation Action Buttons */}
              {onNavigate && (
                <div className="pt-1 flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('simulation-lab')}
                    className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-mono text-xs font-bold transition-all text-center flex items-center justify-center space-x-1"
                  >
                    <span>Simulate Regimen</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('quantum-optimizer')}
                    className="flex-1 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-mono text-xs font-bold transition-all text-center flex items-center justify-center space-x-1"
                  >
                    <span>Solve in QUBO</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google Search Grounding Clinical Context Modal */}
      <DdiClinicalContextModal
        isOpen={isClinicalContextOpen}
        onClose={() => setIsClinicalContextOpen(false)}
        drugA={clinicalContextPair.drugA}
        drugB={clinicalContextPair.drugB}
        ddiData={clinicalContextPair.ddiData}
        patient={patient}
        onNavigateToSimulation={() => onNavigate && onNavigate('simulation-lab')}
        onNavigateToOptimizer={() => onNavigate && onNavigate('quantum-optimizer')}
      />
    </div>
  );
};
