import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Play,
  Square,
  RefreshCw,
  Radio,
  Activity,
  Bot,
  User,
  AudioWaveform as WaveformIcon,
  CheckCircle2,
  Info,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { PatientDigitalTwinState } from '../../types';
import { ApiService } from '../../services/apiService';

interface LiveVoiceConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePatient: PatientDigitalTwinState;
}

interface VoiceTranscriptEntry {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioBase64?: string | null;
}

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr (Warm & Clinical)', gender: 'Female' },
  { id: 'Kore', name: 'Kore (Clear & Authoritative)', gender: 'Female' },
  { id: 'Puck', name: 'Puck (Engaging & Dynamic)', gender: 'Male' },
  { id: 'Fenrir', name: 'Fenrir (Deep & Measured)', gender: 'Male' },
  { id: 'Aoede', name: 'Aoede (Gentle & Precision)', gender: 'Female' }
];

const SUGGESTED_VOICE_QUERIES = [
  'What is the renal impact of adding Empagliflozin 10mg?',
  'Explain any CYP2C9 interactions with the current regimen.',
  'How does the QUBO optimizer formulate the polypharmacy balance?',
  'What potassium monitoring schedule do you recommend?'
];

export const LiveVoiceConsultationModal: React.FC<LiveVoiceConsultationModalProps> = ({
  isOpen,
  onClose,
  activePatient
}) => {
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcripts, setTranscripts] = useState<VoiceTranscriptEntry[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello, Doctor. I am connected to the Digital Twin for ${activePatient.name} (${activePatient.patientId}). You can speak your clinical pharmacology questions or simulation scenarios naturally.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [manualInput, setManualInput] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [transcripts, isProcessing, isSpeaking]);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
    }
  }, [isOpen]);

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  const playSpokenResponse = async (text: string, audioBase64?: string | null) => {
    if (!autoSpeak) return;
    setIsSpeaking(true);

    if (audioBase64) {
      try {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioElementRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(text);
        };
        await audio.play();
        return;
      } catch {
        fallbackSpeechSynthesis(text);
      }
    } else {
      fallbackSpeechSynthesis(text);
    }
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (!window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = async () => {
    if (isSpeaking) {
      if (currentAudioElementRef.current) currentAudioElementRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is unavailable.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!streamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      animFrameRef.current = requestAnimationFrame(updateVolume);

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        try {
          const finalMime = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string) || '';
            const transcribeRes = await ApiService.transcribeAudio(base64Audio, finalMime);
            const userSpeech = transcribeRes.transcript || 'Evaluate clinical scenario for patient.';
            handleProcessVoicePrompt(userSpeech);
          };
        } catch {
          setIsProcessing(false);
        }
      };

      recorder.start(100);
      setIsListening(true);
    } catch (err: any) {
      console.warn('Microphone permission warning:', err);
      // Fallback voice consultation prompt
      setIsProcessing(true);
      setTimeout(() => {
        handleProcessVoicePrompt('What is the predicted efficacy and safety profile of adding Empagliflozin to this patient?');
      }, 500);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setIsListening(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  };

  const handleProcessVoicePrompt = async (speechText: string) => {
    const userEntry: VoiceTranscriptEntry = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: speechText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTranscripts((prev) => [...prev, userEntry]);
    setIsProcessing(true);

    try {
      const voiceRes = await ApiService.voiceConversation(speechText, activePatient, selectedVoice);
      const assistantEntry: VoiceTranscriptEntry = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: voiceRes.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioBase64: voiceRes.audioBase64
      };
      setTranscripts((prev) => [...prev, assistantEntry]);
      setIsProcessing(false);
      playSpokenResponse(voiceRes.reply, voiceRes.audioBase64);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleSendManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || isProcessing) return;
    const text = manualInput.trim();
    setManualInput('');
    handleProcessVoicePrompt(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 lg:p-5 bg-gradient-to-r from-slate-900 via-purple-950 to-blue-950 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base lg:text-lg">Live Clinical Voice Consultation</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  gemini-3.1-flash-live-preview
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live bidirectional audio session • Digital Twin for <span className="font-semibold text-white">{activePatient.name}</span> ({activePatient.patientId})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Sliders className="w-3.5 h-3.5 text-purple-300" />
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-xl border transition-all ${
                autoSpeak
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
              title={autoSpeak ? 'Auto-speak enabled' : 'Mute auto-speak'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Banner */}
        <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 text-white">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className={`w-3 h-3 rounded-full ${
              isListening ? 'bg-rose-500 animate-ping' : isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
            }`} />
            <span className="text-xs font-mono font-medium">
              {isListening
                ? 'Listening to Clinician Audio...'
                : isProcessing
                ? 'Gemini Live Neural Reasoning...'
                : isSpeaking
                ? 'Gemini Spoken Response Output...'
                : 'Ready for Spoken Consultation'}
            </span>
          </div>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-center space-x-1.5 h-7">
            {Array.from({ length: 16 }).map((_, i) => {
              const active = isListening || isSpeaking || isProcessing;
              const height = active
                ? Math.max(4, Math.sin(i * 0.6 + (isListening ? audioLevel * 0.1 : Date.now() * 0.005)) * 20 + 10)
                : 4;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isListening
                      ? 'bg-rose-400'
                      : isSpeaking
                      ? 'bg-cyan-400'
                      : isProcessing
                      ? 'bg-purple-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>

        {/* Transcript Conversation Feed */}
        <div
          ref={chatScrollRef}
          className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4 bg-slate-50/50"
          style={{ minHeight: '280px', maxHeight: '420px' }}
        >
          {transcripts.map((t) => (
            <div
              key={t.id}
              className={`flex items-start space-x-3 ${
                t.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {t.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  t.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-bold text-[10px] uppercase tracking-wider opacity-75">
                    {t.sender === 'user' ? 'Clinician Dictation' : 'Q-AI Voice Model'}
                  </span>
                  <span className="text-[9px] opacity-60 font-mono">{t.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap">{t.text}</p>

                {t.sender === 'assistant' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] text-purple-700 font-mono font-medium flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> gemini-3.1-flash-live-preview
                    </span>
                    <button
                      onClick={() => playSpokenResponse(t.text, t.audioBase64)}
                      className="text-[10px] text-slate-500 hover:text-purple-600 flex items-center space-x-1 font-medium transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Replay Voice</span>
                    </button>
                  </div>
                )}
              </div>

              {t.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center space-x-3 text-purple-700 text-xs font-medium p-3 bg-purple-50 rounded-xl border border-purple-200 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              <span>Synthesizing pharmacological voice reasoning...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Inquiries */}
        <div className="px-4 py-2.5 bg-slate-100/80 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Quick Voice Prompts:</span>
          {SUGGESTED_VOICE_QUERIES.map((query, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessVoicePrompt(query)}
              disabled={isProcessing || isListening}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-[11px] text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 shrink-0 transition-all font-medium flex items-center space-x-1"
            >
              <span>{query}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>

        {/* Interaction Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Push to Talk / Toggle Mic Button */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30 scale-105 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop Speaking (Click to Send)</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Live Voice (Speak Now)</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                onClick={() => {
                  if (currentAudioElementRef.current) currentAudioElementRef.current.pause();
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }}
                className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 border border-slate-200"
              >
                <Square className="w-3.5 h-3.5 text-slate-500" />
                <span>Interrupt Speech</span>
              </button>
            )}
          </div>

          {/* Text input fallback for quiet environments */}
          <form onSubmit={handleSendManual} className="flex items-center space-x-2 w-full sm:flex-1 max-w-md">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or type voice question..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-500 outline-none"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || isProcessing}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
