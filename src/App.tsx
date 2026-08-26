import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { ViewLoadingFallback } from './components/common/ViewLoadingFallback';
import { INITIAL_PATIENTS as SYNTHETIC_PATIENTS, KNOWN_DRUG_INTERACTIONS } from './data/mockDatabase';
import { PatientDigitalTwinState, Medication } from './types';

// Lazy-loaded Views for High-Performance Code Splitting
const HomeLandingView = lazy(() => import('./components/views/HomeLandingView').then(m => ({ default: m.HomeLandingView })));
const OverviewView = lazy(() => import('./components/views/OverviewView').then(m => ({ default: m.OverviewView })));
const PatientsView = lazy(() => import('./components/views/PatientsView').then(m => ({ default: m.PatientsView })));
const DigitalTwinView = lazy(() => import('./components/views/DigitalTwinView').then(m => ({ default: m.DigitalTwinView })));
const MedicationWorkspaceView = lazy(() => import('./components/views/MedicationWorkspaceView').then(m => ({ default: m.MedicationWorkspaceView })));
const SimulationLabView = lazy(() => import('./components/views/SimulationLabView').then(m => ({ default: m.SimulationLabView })));
const InteractionGraphView = lazy(() => import('./components/views/InteractionGraphView').then(m => ({ default: m.InteractionGraphView })));
const QuantumOptimizerView = lazy(() => import('./components/views/QuantumOptimizerView').then(m => ({ default: m.QuantumOptimizerView })));
const AiInsightsView = lazy(() => import('./components/views/AiInsightsView').then(m => ({ default: m.AiInsightsView })));
const ExplainabilityView = lazy(() => import('./components/views/ExplainabilityView').then(m => ({ default: m.ExplainabilityView })));
const ModelPerformanceView = lazy(() => import('./components/views/ModelPerformanceView').then(m => ({ default: m.ModelPerformanceView })));
const ScenarioComparisonView = lazy(() => import('./components/views/ScenarioComparisonView').then(m => ({ default: m.ScenarioComparisonView })));

// Lazy-loaded Modals
const GuidedDemoModal = lazy(() => import('./components/modals/GuidedDemoModal').then(m => ({ default: m.GuidedDemoModal })));
const AddPatientModal = lazy(() => import('./components/modals/AddPatientModal').then(m => ({ default: m.AddPatientModal })));
const LiveVoiceConsultationModal = lazy(() => import('./components/modals/LiveVoiceConsultationModal').then(m => ({ default: m.LiveVoiceConsultationModal })));
const GoogleSearchGroundingModal = lazy(() => import('./components/modals/GoogleSearchGroundingModal').then(m => ({ default: m.GoogleSearchGroundingModal })));

export default function App() {
  const [patients, setPatients] = useState<PatientDigitalTwinState[]>(SYNTHETIC_PATIENTS);
  const [activePatient, setActivePatient] = useState<PatientDigitalTwinState>(SYNTHETIC_PATIENTS[0]);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isSearchGroundingOpen, setIsSearchGroundingOpen] = useState(false);
  const [stagedCandidateForSimulation, setStagedCandidateForSimulation] = useState<Medication | null>(null);

  // Memoized callback handlers to avoid cascading re-renders
  const handleSelectPatient = useCallback((patient: PatientDigitalTwinState) => {
    setActivePatient(patient);
  }, []);

  const handleAddPatient = useCallback((newPatient: PatientDigitalTwinState) => {
    setPatients((prev) => [newPatient, ...prev]);
    setActivePatient(newPatient);
    setCurrentTab('digital-twin');
  }, []);

  const handleStageCandidate = useCallback((candidate: Medication) => {
    setStagedCandidateForSimulation(candidate);
    setCurrentTab('simulation-lab');
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleOpenGuidedDemo = useCallback(() => setIsGuidedDemoOpen(true), []);
  const handleCloseGuidedDemo = useCallback(() => setIsGuidedDemoOpen(false), []);
  const handleOpenAddPatient = useCallback(() => setIsAddPatientOpen(true), []);
  const handleCloseAddPatient = useCallback(() => setIsAddPatientOpen(false), []);
  const handleOpenLiveVoice = useCallback(() => setIsLiveVoiceOpen(true), []);
  const handleCloseLiveVoice = useCallback(() => setIsLiveVoiceOpen(false), []);
  const handleOpenSearchGrounding = useCallback(() => setIsSearchGroundingOpen(true), []);
  const handleCloseSearchGrounding = useCallback(() => setIsSearchGroundingOpen(false), []);
  const handleNavigateHome = useCallback(() => setCurrentTab('home'), []);
  const handleNavigateTab = useCallback((tab: string) => setCurrentTab(tab as NavigationTab), []);

  const highRiskInteractionsCount = useMemo(() => {
    return KNOWN_DRUG_INTERACTIONS.filter((i) => i.severity === 'high' || i.severity === 'contraindicated').length;
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#0F172A] flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 relative overflow-x-hidden">
      {/* Ambient background glows with GPU layer acceleration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden will-change-transform">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main Top Header */}
      <Header
        activePatient={activePatient}
        patients={patients}
        interactions={KNOWN_DRUG_INTERACTIONS}
        onSelectPatient={handleSelectPatient}
        onOpenGuidedDemo={handleOpenGuidedDemo}
        onOpenAddPatient={handleOpenAddPatient}
        onOpenLiveVoice={handleOpenLiveVoice}
        onOpenSearchGrounding={handleOpenSearchGrounding}
        onNavigateHome={handleNavigateHome}
        onNavigateTab={handleNavigateTab}
        activeView={currentTab}
      />

      {/* Application Body Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Futuristic Glass Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          highRiskCount={highRiskInteractionsCount}
        />

        {/* Dynamic Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F8FAFF]">
          <div className="max-w-7xl mx-auto space-y-5">
            <Suspense fallback={<ViewLoadingFallback label="Loading intelligence module..." />}>
              {currentTab === 'home' && (
                <HomeLandingView
                  activePatient={activePatient}
                  patients={patients}
                  onSelectPatient={handleSelectPatient}
                  onNavigate={setCurrentTab}
                  onOpenGuidedDemo={handleOpenGuidedDemo}
                  onOpenAddPatient={handleOpenAddPatient}
                />
              )}

              {currentTab === 'overview' && (
                <OverviewView
                  activePatient={activePatient}
                  patients={patients}
                  interactions={KNOWN_DRUG_INTERACTIONS}
                  onNavigate={setCurrentTab}
                  onOpenGuidedDemo={handleOpenGuidedDemo}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {currentTab === 'patients' && (
                <PatientsView
                  patients={patients}
                  activePatient={activePatient}
                  onSelectPatient={handleSelectPatient}
                  onNavigate={setCurrentTab}
                  onOpenAddPatient={handleOpenAddPatient}
                />
              )}

              {currentTab === 'digital-twin' && (
                <DigitalTwinView
                  patient={activePatient}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'medications' && (
                <MedicationWorkspaceView
                  patient={activePatient}
                  onNavigate={setCurrentTab}
                  onSelectCandidateForSimulation={handleStageCandidate}
                />
              )}

              {currentTab === 'simulation-lab' && (
                <SimulationLabView
                  patient={activePatient}
                  onNavigate={setCurrentTab}
                  initialCandidate={stagedCandidateForSimulation}
                />
              )}

              {currentTab === 'interactions' && (
                <InteractionGraphView
                  patient={activePatient}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'quantum-optimizer' && (
                <QuantumOptimizerView
                  patient={activePatient}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'ai-insights' && (
                <AiInsightsView
                  patient={activePatient}
                />
              )}

              {currentTab === 'explainability' && (
                <ExplainabilityView
                  patient={activePatient}
                />
              )}

              {currentTab === 'scenario-comparison' && (
                <ScenarioComparisonView
                  patient={activePatient}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'model-performance' && (
                <ModelPerformanceView />
              )}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Modals rendered on-demand with Suspense */}
      <Suspense fallback={null}>
        {isGuidedDemoOpen && (
          <GuidedDemoModal
            isOpen={isGuidedDemoOpen}
            onClose={handleCloseGuidedDemo}
            onNavigateTab={setCurrentTab}
            activePatient={activePatient}
          />
        )}

        {isAddPatientOpen && (
          <AddPatientModal
            isOpen={isAddPatientOpen}
            onClose={handleCloseAddPatient}
            onAddPatient={handleAddPatient}
          />
        )}

        {isLiveVoiceOpen && (
          <LiveVoiceConsultationModal
            isOpen={isLiveVoiceOpen}
            onClose={handleCloseLiveVoice}
            activePatient={activePatient}
          />
        )}

        {isSearchGroundingOpen && (
          <GoogleSearchGroundingModal
            isOpen={isSearchGroundingOpen}
            onClose={handleCloseSearchGrounding}
            activePatient={activePatient}
          />
        )}
      </Suspense>
    </div>
  );
}
