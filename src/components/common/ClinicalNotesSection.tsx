import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Filter,
  X,
  Save,
  Copy,
  ChevronDown,
  ChevronUp,
  Pill,
  Dna,
  Activity,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { PatientDigitalTwinState, ClinicalNote } from '../../types';

interface ClinicalNotesSectionProps {
  patients: PatientDigitalTwinState[];
  activePatient: PatientDigitalTwinState;
  onSelectPatient?: (patient: PatientDigitalTwinState) => void;
  selectedPatientId?: string;
}

const STORAGE_KEY = 'quantum_rx_patient_clinical_notes';

const INITIAL_NOTES: ClinicalNote[] = [
  {
    id: 'NOTE-8821',
    patientId: 'PT-001',
    title: 'Pharmacogenomics Assessment: CYP2C9 *1/*3 Intermediate Clearance',
    content: 'Reviewed NGS PGx sequencing panel. Patient carries CYP2C9 *1/*3 diplotype resulting in approximately 50% impaired clearance for sulfonylurea agents. Recommend titrating Glipizide downward or switching to DPP-4i/GLP-1 RA with low hypoglycemia propensity to protect renal parenchyma.',
    author: 'Dr. Sarah Lin, MD',
    authorRole: 'Clinical Pharmacogenomics Specialist',
    category: 'genomic_consult',
    priority: 'urgent',
    tags: ['CYP2C9', 'Sulfonylurea', 'Hypoglycemia-Risk', 'Dose-Titration'],
    createdAt: '2026-08-22 09:30 AM',
    updatedAt: '2026-08-23 02:15 PM'
  },
  {
    id: 'NOTE-8822',
    patientId: 'PT-001',
    title: 'Renal Function & SGLT2 Inhibitor Initiation Follow-up',
    content: 'Patient eGFR recorded at 58 mL/min/1.73m² with uACR of 185 mg/g indicating early stage 2 diabetic nephropathy. SGLT2 inhibitor therapy (Empagliflozin 10mg) initiated for nephroprotection. Recheck serum creatinine and potassium in 4 weeks.',
    author: 'Dr. Marcus Vance, MD',
    authorRole: 'Nephrology Attending',
    category: 'lab_followup',
    priority: 'routine',
    tags: ['eGFR-Monitoring', 'SGLT2i', 'Microalbuminuria', 'KDIGO-2024'],
    createdAt: '2026-08-19 11:45 AM'
  },
  {
    id: 'NOTE-8823',
    patientId: 'PT-002',
    title: 'QTc Prolongation Risk with Combined Antimicrobial Regimen',
    content: 'Digital Twin ODE simulation identified potential additive QTc prolongation (>460ms) if Azithromycin is co-prescribed with baseline antiarrhythmics. Shifted recommendation to Doxycycline for atypical respiratory coverage. Serial ECG scheduled.',
    author: 'Dr. Elena Rostova, PharmD',
    authorRole: 'Cardiovascular Pharmacist',
    category: 'adverse_reaction',
    priority: 'critical',
    tags: ['QTc-Prolongation', 'Antimicrobial-Stewardship', 'ECG-Surveillance'],
    createdAt: '2026-08-24 04:10 PM'
  },
  {
    id: 'NOTE-8824',
    patientId: 'PT-003',
    title: 'Metformin Dose Adjustment for Mild Hepatorenal Fluctuation',
    content: 'Patient demonstrates stable LFTs with baseline eGFR 62 mL/min. Metformin maintained at 1000mg BID with strict instruction to suspend during acute dehydrating illnesses or radiocontrast procedures.',
    author: 'Dr. Sarah Lin, MD',
    authorRole: 'Endocrinology Fellow',
    category: 'pharmacotherapy',
    priority: 'routine',
    tags: ['Metformin', 'Hepatorenal', 'Patient-Education'],
    createdAt: '2026-08-20 08:20 AM'
  }
];

const NOTE_TEMPLATES = [
  {
    label: '💊 PGx Titration Plan',
    title: 'Pharmacogenomic Dose Modification Plan',
    category: 'genomic_consult' as const,
    priority: 'urgent' as const,
    tags: ['PGx-Guided', 'Metabolism-Alert', 'Dose-Adjustment'],
    content: 'Based on patient\'s polymorphic enzyme diplotype (*1/*3 Intermediate Metabolizer), hepatic clearance is reduced by ~50%. Recommended action: Reduce initial dosage by 50% and monitor plasma kinetics closely.'
  },
  {
    label: '⚠️ Adverse Interaction Flag',
    title: 'Drug-Drug Interaction Safety Alert',
    category: 'adverse_reaction' as const,
    priority: 'critical' as const,
    tags: ['DDI-Alert', 'Toxicity-Prevention', 'QUBO-Checked'],
    content: 'Quantum QUBO interaction analysis identified high-risk competitive CYP inhibition between current regimen agents. Recommend discontinuing candidate inhibitor and substituting non-interacting alternative.'
  },
  {
    label: '🧪 Renal & Lab Surveillance',
    title: 'Renal Clearance & Electrolyte Follow-up',
    category: 'lab_followup' as const,
    priority: 'routine' as const,
    tags: ['eGFR-Tracking', 'Creatinine-Clearance', 'Electrolyte-Panel'],
    content: 'eGFR and serum creatinine checked. Clearance remains within acceptable parameters. Schedule repeat basic metabolic panel in 6 weeks to ensure hemodynamic stability.'
  },
  {
    label: '📋 General Multidisciplinary Review',
    title: 'Comprehensive Polypharmacy Reconciliation Note',
    category: 'general' as const,
    priority: 'routine' as const,
    tags: ['Med-Reconciliation', 'Care-Plan', 'Digital-Twin-Review'],
    content: 'Full medication regimen reconciled against Digital Twin baseline parameters. Patient is tolerating current drug combination well with no reported adverse symptoms.'
  }
];

export const ClinicalNotesSection: React.FC<ClinicalNotesSectionProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  selectedPatientId
}) => {
  const [currentPatientId, setCurrentPatientId] = useState<string>(
    selectedPatientId || activePatient.patientId
  );
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('Dr. Sarah Lin, MD');
  const [formAuthorRole, setFormAuthorRole] = useState('Clinical Pharmacologist');
  const [formCategory, setFormCategory] = useState<ClinicalNote['category']>('pharmacotherapy');
  const [formPriority, setFormPriority] = useState<ClinicalNote['priority']>('routine');
  const [formTags, setFormTags] = useState('');

  // Update selected patient when activePatient prop changes
  useEffect(() => {
    if (selectedPatientId) {
      setCurrentPatientId(selectedPatientId);
    } else if (activePatient) {
      setCurrentPatientId(activePatient.patientId);
    }
  }, [activePatient, selectedPatientId]);

  // Load from localStorage or initialize
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          return;
        }
      }
      setNotes(INITIAL_NOTES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTES));
    } catch {
      setNotes(INITIAL_NOTES);
    }
  }, []);

  const saveNotes = (updated: ClinicalNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const currentPatient =
    patients.find((p) => p.patientId === currentPatientId) || activePatient;

  // Filter notes for the selected patient
  const patientNotes = notes.filter((n) => n.patientId === currentPatientId);

  const filteredNotes = patientNotes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || n.category === categoryFilter;

    const matchesPriority =
      priorityFilter === 'all' || n.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleApplyTemplate = (tmpl: typeof NOTE_TEMPLATES[0]) => {
    setFormTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormPriority(tmpl.priority);
    setFormTags(tmpl.tags.join(', '));
    setFormContent(tmpl.content);
  };

  const handleStartAdd = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('pharmacotherapy');
    setFormPriority('routine');
    setFormTags('Digital-Twin, Care-Plan');
    setShowAddForm(true);
  };

  const handleStartEdit = (note: ClinicalNote) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormAuthor(note.author);
    setFormAuthorRole(note.authorRole || 'Clinician');
    setFormCategory(note.category);
    setFormPriority(note.priority);
    setFormTags(note.tags.join(', '));
    setShowAddForm(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const tagArray = formTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (editingNoteId) {
      // Update existing note
      const updated = notes.map((n) => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            title: formTitle.trim(),
            content: formContent.trim(),
            author: formAuthor.trim() || 'Attending Clinician',
            authorRole: formAuthorRole.trim() || 'Clinical Pharmacologist',
            category: formCategory,
            priority: formPriority,
            tags: tagArray.length > 0 ? tagArray : ['Clinical-Update'],
            updatedAt: nowFormatted
          };
        }
        return n;
      });
      saveNotes(updated);
    } else {
      // Create new note
      const newNote: ClinicalNote = {
        id: `NOTE-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: currentPatientId,
        title: formTitle.trim(),
        content: formContent.trim(),
        author: formAuthor.trim() || 'Attending Clinician',
        authorRole: formAuthorRole.trim() || 'Clinical Pharmacologist',
        category: formCategory,
        priority: formPriority,
        tags: tagArray.length > 0 ? tagArray : ['General'],
        createdAt: nowFormatted
      };
      saveNotes([newNote, ...notes]);
    }

    setShowAddForm(false);
    setEditingNoteId(null);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this clinical note? This action cannot be undone.')) {
      const updated = notes.filter((n) => n.id !== id);
      saveNotes(updated);
    }
  };

  const handleCopyNote = (note: ClinicalNote) => {
    const textToCopy = `[${note.priority.toUpperCase()} - ${note.category.toUpperCase()}] ${note.title}\nPatient: ${currentPatient.name} (${note.patientId})\nAuthor: ${note.author} (${note.authorRole})\nDate: ${note.createdAt}\n\n${note.content}\n\nTags: ${note.tags.join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (cat: ClinicalNote['category']) => {
    switch (cat) {
      case 'pharmacotherapy':
        return { label: 'Pharmacotherapy', icon: Pill, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'genomic_consult':
        return { label: 'PGx Consult', icon: Dna, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'adverse_reaction':
        return { label: 'Adverse Reaction', icon: AlertTriangle, color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'lab_followup':
        return { label: 'Lab Follow-up', icon: Activity, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'General Progress', icon: FileText, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getPriorityBadge = (prio: ClinicalNote['priority']) => {
    switch (prio) {
      case 'critical':
        return 'bg-rose-600 text-white border-rose-600 font-bold';
      case 'urgent':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Clinical Documentation & Pharmacotherapy Notes
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                  {patientNotes.length} {patientNotes.length === 1 ? 'Note' : 'Notes'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Maintain longitudinal clinical reasoning, pharmacogenomic interpretations, and medication titration records.
              </p>
            </div>
          </div>
        </div>

        {/* Patient Switcher & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center space-x-1.5 bg-[#F8FAFF] px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500 font-semibold">Patient:</span>
            <select
              value={currentPatientId}
              onChange={(e) => {
                const newId = e.target.value;
                setCurrentPatientId(newId);
                const selectedP = patients.find((p) => p.patientId === newId);
                if (selectedP && onSelectPatient) {
                  onSelectPatient(selectedP);
                }
              }}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer font-sans"
            >
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name.split(' (')[0]} ({p.patientId})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartAdd}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Clinical Note</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal / Card */}
      {showAddForm && (
        <form
          onSubmit={handleSaveNote}
          className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/40 to-white border-2 border-blue-200 shadow-sm space-y-4 transition-all"
        >
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-[#0F172A]">
                {editingNoteId ? 'Edit Clinical Note' : 'Create New Clinical Note'} for {currentPatient.name.split(' (')[0]}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Note Templates */}
          {!editingNoteId && (
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1.5">
                Quick Clinical Templates:
              </span>
              <div className="flex flex-wrap gap-2">
                {NOTE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 text-[11px] font-medium transition-colors shadow-2xs"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Note Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note Title / Clinical Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. PGx Evaluation for CYP2C9 intermediate metabolism"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ClinicalNote['category'])}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              >
                <option value="pharmacotherapy">💊 Pharmacotherapy & Regimen</option>
                <option value="genomic_consult">🧬 PGx & Genomic Consult</option>
                <option value="adverse_reaction">⚠️ Adverse Reaction (ADR)</option>
                <option value="lab_followup">🧪 Lab & Chemistry Follow-up</option>
                <option value="general">📋 General Progress Note</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['routine', 'urgent', 'critical'] as const).map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setFormPriority(prio)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold capitalize transition-all border ${
                      formPriority === prio
                        ? prio === 'critical'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : prio === 'urgent'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinician Author
              </label>
              <input
                type="text"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="Dr. Name, MD/PharmD"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Tags (comma separated)
              </label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="CYP2C9, eGFR, Glipizide"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Note Body Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Clinical Assessment & Plan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Document therapeutic rationales, dosage titration calculations, genetic pathway interpretations, and multidisciplinary follow-up schedules..."
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono transition-all shadow-xs flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingNoteId ? 'Update Note' : 'Save Clinical Note'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#F8FAFF] border border-slate-200/80 rounded-xl text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, authors, tags..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="pharmacotherapy">Pharmacotherapy</option>
              <option value="genomic_consult">PGx Consult</option>
              <option value="adverse_reaction">Adverse Reaction</option>
              <option value="lab_followup">Lab Follow-up</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#F8FAFF] border border-dashed border-slate-200 text-center space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">No Clinical Notes Found</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            {patientNotes.length === 0
              ? `No documentation logged yet for ${currentPatient.name.split(' (')[0]}. Click 'Add Clinical Note' above to record initial observations.`
              : 'No notes match your current search or category filters.'}
          </p>
          {patientNotes.length === 0 && (
            <button
              onClick={handleStartAdd}
              className="mt-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.map((note) => {
            const catBadge = getCategoryBadge(note.category);
            const CatIcon = catBadge.icon;
            return (
              <div
                key={note.id}
                className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 hover:border-blue-300 transition-all shadow-2xs space-y-3"
              >
                {/* Note Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center space-x-1 ${catBadge.color}`}>
                        <CatIcon className="w-3 h-3" />
                        <span>{catBadge.label}</span>
                      </span>

                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono uppercase border ${getPriorityBadge(note.priority)}`}>
                        {note.priority}
                      </span>

                      <span className="font-mono text-[10px] text-slate-400">
                        ID: {note.id}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0F172A] mt-1">
                      {note.title}
                    </h4>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center space-x-1 self-end sm:self-start shrink-0">
                    <button
                      onClick={() => handleCopyNote(note)}
                      title="Copy note content"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {copiedId === note.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleStartEdit(note)}
                      title="Edit note"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      title="Delete note"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="text-xs text-slate-700 leading-relaxed bg-[#F8FAFF] p-3.5 rounded-xl border border-slate-100 font-sans whitespace-pre-wrap">
                  {note.content}
                </div>

                {/* Tags & Footer Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {note.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono flex items-center space-x-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Author & Timestamp */}
                  <div className="flex items-center space-x-3 text-slate-500 font-mono text-[10px]">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-700">{note.author}</span>
                      {note.authorRole && (
                        <span className="text-slate-400 hidden md:inline">({note.authorRole})</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{note.createdAt}</span>
                    </div>

                    {note.updatedAt && (
                      <span className="text-purple-600 italic hidden lg:inline">
                        (Edited: {note.updatedAt})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
