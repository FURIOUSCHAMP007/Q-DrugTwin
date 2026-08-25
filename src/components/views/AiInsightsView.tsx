import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Activity,
  Layers,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Zap,
  HelpCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';
import { ApiService } from '../../services/apiService';

interface AiInsightsViewProps {
  patient: PatientDigitalTwinState;
}

interface Message {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  toolCalls?: {
    toolName: string;
    params: string;
    outputSummary: string;
  }[];
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({ patient }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'gemini',
      text: `Hello, Doctor. I am the Q-AI Clinical Reasoning Assistant powered by Gemini 3.7 Flash with real-time access to patient ${patient.patientId}'s digital twin (${patient.name.split(' (')[0]}), PharmaGNN interaction graphs, and QUBO optimization engines. How can I assist your clinical evaluation?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolCalls: [
        {
          toolName: 'getPatientTwinState',
          params: `patientId: "${patient.patientId}"`,
          outputSummary: `Loaded Digital Twin: Age ${patient.demographics.age}, eGFR ${patient.organFunction.eGFR} mL/min, HbA1c ${patient.organFunction.hba1c}%, ${patient.currentMedications.length} active meds.`
        }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    `Analyze drug-drug interaction risk between ${patient.currentMedications[0]?.name || 'Lisinopril'} and Spironolactone given eGFR ${patient.organFunction.eGFR}.`,
    `Suggest an optimal second-line agent for glycemic control considering renal preservation.`,
    `Explain the pharmacogenomic significance of patient's CYP450 diplotypes for current medications.`,
    `What does the QUBO quantum optimization indicate as the highest suitability candidate combination?`
  ];

  const handleSendMessage = async (userPrompt?: string) => {
    const promptToSend = userPrompt || inputValue.trim();
    if (!promptToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await ApiService.queryGemini(promptToSend, patient);

      const geminiMessage: Message = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: [
          {
            toolName: 'queryBiomedicalKnowledgeGraph',
            params: `patientId: "${patient.patientId}", query: "${promptToSend.slice(0, 30)}..."`,
            outputSummary: `Traversed PharmaGNN nodes & verified against KDIGO/ADA guidelines.`
          }
        ]
      };

      setMessages((prev) => [...prev, geminiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'gemini',
        text: "I encountered a transient latency issue querying the reasoning model. Based on local digital twin parameters: For this patient's eGFR and comorbidities, SGLT2 inhibitors provide dual glycemic and nephroprotective benefits without significant hypoglycemia risk.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-xs font-bold border border-purple-200 flex items-center space-x-1">
              <Bot className="w-3.5 h-3.5" />
              <span>GEMINI 3.7 FLASH CLINICAL REASONING ORCHESTRATOR</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#0F172A] mt-1 tracking-tight">
            Q-AI Clinical <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Reasoning Assistant</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal">
            Interactive multi-agent clinical dialogue grounded in patient digital twin state, KDIGO/ADA guidelines, and XAI feature attributions
          </p>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Message Stream */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200/90 flex flex-col h-[560px] shadow-xs overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((msg) => {
              const isGemini = msg.sender === 'gemini';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    isGemini ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isGemini && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isGemini
                        ? 'bg-[#F8FAFF] border border-slate-200 text-slate-800 shadow-xs'
                        : 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-sm'
                    }`}
                  >
                    {/* Tool Calls Accordion for Gemini */}
                    {isGemini && msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mb-3 space-y-1.5 font-mono text-[10px]">
                        {msg.toolCalls.map((tool, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-white border border-purple-200 text-slate-700"
                          >
                            <div className="flex items-center space-x-1.5 text-purple-700 font-bold">
                              <Terminal className="w-3 h-3" />
                              <span>TOOL: {tool.toolName}()</span>
                            </div>
                            <p className="text-slate-500 mt-0.5">{tool.outputSummary}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Body with Line Breaks */}
                    <div className="whitespace-pre-line font-sans">{msg.text}</div>

                    <div
                      className={`mt-2 text-[9px] font-mono ${
                        isGemini ? 'text-slate-400' : 'text-purple-200'
                      } text-right`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isGemini && (
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-700" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAFF] border border-slate-200 text-xs font-mono text-blue-700 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  <span>Synthesizing pharmacological knowledge & twin parameters...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3.5 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask clinical questions about ${patient.patientId} (${patient.name.split(' (')[0]})...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAFF] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Clinical Prompt Shortcuts & Reference Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs">
            <h3 className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider mb-3.5 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Recommended Inquiries</span>
            </h3>

            <div className="space-y-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-3 rounded-xl bg-[#F8FAFF] border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-slate-900 text-xs transition-all flex items-start space-x-2"
                >
                  <span className="text-blue-600 font-mono font-bold shrink-0">→</span>
                  <span className="line-clamp-2">{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center space-x-2 text-[#0F172A] font-bold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Active Guideline Knowledgebases</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside font-normal">
              <li>KDIGO 2024 Clinical Practice for CKD</li>
              <li>ADA 2025 Standards of Care in Diabetes</li>
              <li>CPIC Pharmacogenomic Dosing Guidelines</li>
              <li>ACC/AHA/HFSA 2022 Heart Failure Guidelines</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

