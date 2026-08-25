import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { SafetyBanner } from './components/layout/SafetyBanner';
import { HomeLandingView } from './components/views/HomeLandingView';
import { OverviewView } from './components/views/OverviewView';
import { PatientsView } from './components/views/PatientsView';
import { DigitalTwinView } from './components/views/DigitalTwinView';
import { MedicationWorkspaceView } from './components/views/MedicationWorkspaceView';
import { SimulationLabView } from './components/views/SimulationLabView';
import { InteractionGraphView } from './components/views/InteractionGraphView';
import { QuantumOptimizerView } from './components/views/QuantumOptimizerView';
import { AiInsightsView } from './components/views/AiInsightsView';
import { ExplainabilityView } from './components/views/ExplainabilityView';
import { ModelPerformanceView } from './components/views/ModelPerformanceView';
import { ScenarioComparisonView } from './components/views/ScenarioComparisonView';
import { GuidedDemoModal } from './components/modals/GuidedDemoModal';
import { AddPatientModal } from './components/modals/AddPatientModal';
import { INITIAL_PATIENTS as SYNTHETIC_PATIENTS, KNOWN_DRUG_INTERACTIONS } from './data/mockDatabase';
import { PatientDigitalTwinState, Medication } from './types';

export default function App() {
  const [patients, setPatients] = useState<PatientDigitalTwinState[]>(SYNTHETIC_PATIENTS);
  const [activePatient, setActivePatient] = useState<PatientDigitalTwinState>(SYNTHETIC_PATIENTS[0]);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [stagedCandidateForSimulation, setStagedCandidateForSimulation] = useState<Medication | null>(null);

  const handleSelectPatient = (patient: PatientDigitalTwinState) => {
    setActivePatient(patient);
  };

  const handleAddPatient = (newPatient: PatientDigitalTwinState) => {
    setPatients((prev) => [newPatient, ...prev]);
    setActivePatient(newPatient);
    setCurrentTab('digital-twin');
  };

  const handleStageCandidate = (candidate: Medication) => {
    setStagedCandidateForSimulation(candidate);
    setCurrentTab('simulation-lab');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-[#0F172A] flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      {/* Global Safety Compliance Banner */}
      <SafetyBanner />

      {/* Main Top Header */}
      <Header
        activePatient={activePatient}
        patients={patients}
        onSelectPatient={handleSelectPatient}
        onOpenGuidedDemo={() => setIsGuidedDemoOpen(true)}
        onOpenAddPatient={() => setIsAddPatientOpen(true)}
        onNavigateHome={() => setCurrentTab('home')}
        activeView={currentTab}
      />

      {/* Application Body Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Futuristic Glass Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          highRiskCount={KNOWN_DRUG_INTERACTIONS.filter((i) => i.severity === 'high' || i.severity === 'contraindicated').length}
        />

        {/* Dynamic Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F8FAFF]">
          <div className="max-w-7xl mx-auto space-y-5">
            {currentTab === 'home' && (
              <HomeLandingView
                activePatient={activePatient}
                patients={patients}
                onSelectPatient={handleSelectPatient}
                onNavigate={setCurrentTab}
                onOpenGuidedDemo={() => setIsGuidedDemoOpen(true)}
                onOpenAddPatient={() => setIsAddPatientOpen(true)}
              />
            )}

            {currentTab === 'overview' && (
              <OverviewView
                activePatient={activePatient}
                patients={patients}
                interactions={KNOWN_DRUG_INTERACTIONS}
                onNavigate={setCurrentTab}
                onOpenGuidedDemo={() => setIsGuidedDemoOpen(true)}
              />
            )}

            {currentTab === 'patients' && (
              <PatientsView
                patients={patients}
                activePatient={activePatient}
                onSelectPatient={handleSelectPatient}
                onNavigate={setCurrentTab}
                onOpenAddPatient={() => setIsAddPatientOpen(true)}
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
          </div>
        </main>
      </div>

      {/* Guided SIH Demo Tour Modal */}
      <GuidedDemoModal
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
        onNavigateTab={setCurrentTab}
        activePatient={activePatient}
      />

      {/* Custom Patient Digital Twin Creator Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
}
