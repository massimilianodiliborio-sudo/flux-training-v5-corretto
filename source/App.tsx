import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Area, SessionData, TrainingBlock, AthleteProfile, DEFAULT_AREAS, getAreaColor, Parameter } from './types';
import { 
  Settings, User, LayoutDashboard, ArrowRight, Search, Menu, Lock, Key, LogIn, ShieldCheck, 
  Plus, Share2, Mail, FileSpreadsheet, FolderOpen, ArrowLeft, Trash2, Phone, BrainCircuit, 
  Activity, Save, Send, AlertCircle, Calendar, CheckCircle2, Zap, Trophy, HelpCircle, X, Info,
  TrendingUp, TrendingDown, Minus, BarChart3, Filter, ChevronDown, ZoomIn, History, PlayCircle, 
  DownloadCloud, Database, Hexagon, Edit2, Check, Wifi, WifiOff
} from 'lucide-react';
import { 
  BarChart, Bar, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// UTILS
// ==========================================
function safeLocalStorageGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`localStorage corrotto per chiave "${key}", uso default`, e);
    return defaultValue;
  }
}

// ==========================================
// COMPONENT: BUTTON
// ==========================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white focus:ring-cyan-500 shadow-lg shadow-cyan-900/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500",
    danger: "bg-red-900/50 hover:bg-red-900/80 text-red-200 border border-red-800 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// ==========================================
// COMPONENT: SETUP PARAMETERS
// ==========================================

interface SetupParametersProps {
  areas: Area[];
  onUpdateAreas: (newAreas: Area[]) => void;
  onClose: () => void;
}

const SetupParameters: React.FC<SetupParametersProps> = ({ areas, onUpdateAreas, onClose }) => {
  const [localAreas, setLocalAreas] = useState<Area[]>(JSON.parse(JSON.stringify(areas)));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Handlers for Areas
  const addArea = () => {
    const newArea: Area = {
      id: `area-${Date.now()}`,
      name: 'Nuova Area',
      parameters: [{ id: `p-${Date.now()}`, name: 'Parametro 1' }],
    };
    setLocalAreas([...localAreas, newArea]);
  };

  const removeArea = (id: string) => {
    setLocalAreas(localAreas.filter(a => a.id !== id));
  };

  const updateAreaName = (id: string, name: string) => {
    setLocalAreas(localAreas.map(a => a.id === id ? { ...a, name } : a));
    setEditingId(null);
  };

  // Handlers for Parameters
  const addParameter = (areaId: string) => {
    setLocalAreas(localAreas.map(area => {
      if (area.id !== areaId) return area;
      return {
        ...area,
        parameters: [...area.parameters, { id: `p-${Date.now()}`, name: 'Nuovo Parametro' }]
      };
    }));
  };

  const removeParameter = (areaId: string, paramId: string) => {
    setLocalAreas(localAreas.map(area => {
      if (area.id !== areaId) return area;
      return {
        ...area,
        parameters: area.parameters.filter(p => p.id !== paramId)
      };
    }));
  };

  const updateParameterName = (areaId: string, paramId: string, name: string) => {
    setLocalAreas(localAreas.map(area => {
      if (area.id !== areaId) return area;
      return {
        ...area,
        parameters: area.parameters.map(p => p.id === paramId ? { ...p, name } : p)
      };
    }));
    setEditingId(null);
  };

  // Edit Mode Handler
  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSave = () => {
    onUpdateAreas(localAreas);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-950/90 backdrop-blur z-10">
        <div>
          <h2 className="text-2xl font-bold text-white">Configurazione Sistema</h2>
          <p className="text-slate-400 text-sm">Personalizza il tuo modello di valutazione.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Check size={18} /> Applica Modifiche
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full">
        {localAreas.map((area) => (
          <div key={area.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3 flex-1">
                {editingId === area.id ? (
                  <div className="flex items-center gap-2 w-full max-w-xs">
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="bg-slate-800 border border-cyan-500/50 rounded px-3 py-1 text-white w-full outline-none"
                    />
                    <button onClick={() => updateAreaName(area.id, editValue)} className="text-cyan-400 hover:text-cyan-300"><Check size={18}/></button>
                  </div>
                ) : (
                  <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-3">
                    {area.name}
                    <button onClick={() => startEditing(area.id, area.name)} className="text-slate-600 hover:text-slate-400"><Edit2 size={16}/></button>
                  </h3>
                )}
              </div>
              <Button variant="danger" size="sm" onClick={() => removeArea(area.id)} title="Rimuovi Area">
                <Trash2 size={16} />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {area.parameters.map((param) => (
                <div key={param.id} className="flex items-center justify-between bg-slate-950/50 p-3 rounded border border-slate-800/50 hover:border-slate-700 transition-colors">
                   {editingId === param.id ? (
                     <div className="flex items-center gap-2 w-full">
                       <input
                         autoFocus
                         type="text"
                         value={editValue}
                         onChange={(e) => setEditValue(e.target.value)}
                         className="bg-slate-800 border border-cyan-500/50 rounded px-2 py-1 text-sm text-white w-full outline-none"
                       />
                       <button onClick={() => updateParameterName(area.id, param.id, editValue)} className="text-cyan-400"><Check size={16}/></button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                        {param.name}
                        <button onClick={() => startEditing(param.id, param.name)} className="text-slate-600 hover:text-slate-400 ml-2"><Edit2 size={12}/></button>
                     </div>
                   )}
                   <button onClick={() => removeParameter(area.id, param.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                     <X size={16} />
                   </button>
                </div>
              ))}
              <button 
                onClick={() => addParameter(area.id)}
                className="flex items-center justify-center gap-2 p-3 rounded border border-dashed border-slate-700 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all text-sm"
              >
                <Plus size={16} /> Aggiungi Parametro
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addArea}
          className="w-full py-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all flex flex-col items-center gap-2"
        >
          <div className="p-3 bg-slate-900 rounded-full">
            <Plus size={24} />
          </div>
          <span className="font-medium">Aggiungi Area di Valutazione</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: ATHLETE VIEW
// ==========================================

interface AthleteViewProps {
  areas: Area[];
  sessions: SessionData[];
  onSaveSessions: (sessions: SessionData[]) => void;
  onSubmitBlock: (sessions: SessionData[]) => void;
  onOpenSettings: () => void;
}

const AthleteView: React.FC<AthleteViewProps> = ({ 
  areas, 
  sessions, 
  onSaveSessions, 
  onSubmitBlock, 
  onOpenSettings
}) => {
  const { id: routeId } = useParams<{ id: string }>(); // Use hook directly for display
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0].id);
  const [localSessions, setLocalSessions] = useState<SessionData[]>(sessions);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setLocalSessions(sessions);
    const currentIdExists = sessions.some(s => s.id === activeSessionId);
    if (!currentIdExists && sessions.length > 0) {
        setActiveSessionId(sessions[0].id);
        setShowSuccess(true);
        const timer = setTimeout(() => setShowSuccess(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [sessions, activeSessionId]);

  const activeSession = localSessions.find(s => s.id === activeSessionId) || localSessions[0];

  // Helper to count "active" sessions (where RPE is set or IsRace is true)
  const sessionsFilledCount = localSessions.filter(s => s.rpe > 0 || s.isRace).length;
  const canSubmit = sessionsFilledCount > 0;

  const updateSession = (updater: (s: SessionData) => SessionData) => {
    const updated = localSessions.map(s => 
      s.id === activeSessionId ? updater(s) : s
    );
    setLocalSessions(updated);
  };

  const handleScoreChange = (paramId: string, value: number) => {
    updateSession(s => ({
      ...s,
      scores: { ...s.scores, [paramId]: value }
    }));
  };

  const handleRpeChange = (value: number) => {
    updateSession(s => ({ ...s, rpe: value }));
  };

  const handleNotesChange = (text: string) => {
    updateSession(s => ({ ...s, notes: text }));
  };

  const handleRaceToggle = () => {
      updateSession(s => ({ ...s, isRace: !s.isRace }));
  };

  const handleMinutesChange = (val: string) => {
      updateSession(s => ({ ...s, matchMinutes: val }));
  };

  const handleResultChange = (val: string) => {
      updateSession(s => ({ ...s, matchResult: val }));
  };

  const handleManualSave = () => {
    onSaveSessions(localSessions);
    setLastSaved(new Date());
  };

  const handleSubmit = () => {
    const msg = sessionsFilledCount < 5 
        ? `Hai compilato ${sessionsFilledCount} sessioni su 5. Sei sicuro di voler inviare comunque?`
        : "Sei sicuro di voler inviare questo blocco di 5 sessioni? I dati verranno archiviati e potrai iniziare un nuovo ciclo.";
    
    if (confirm(msg)) {
        onSubmitBlock(localSessions);
    }
  };

  const getPerformanceColorClass = (val: number) => {
    if (val <= 2) return 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] text-white border border-red-400';
    if (val <= 4) return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)] text-white border border-orange-300';
    if (val <= 6) return 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] text-slate-900 border border-yellow-200';
    if (val <= 8) return 'bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.8)] text-slate-900 border border-lime-200';
    return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] text-white border border-emerald-300';
  };

  const getRpeColor = (val: number) => {
    if (val < 4) return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]';
    if (val < 7) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
    if (val < 9) return 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]';
    return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
  };

  const getScaleLabel = (val: number) => {
    switch(val) {
      case 1: return "Molto molto poco";
      case 2: return "Molto poco";
      case 3: return "Moderatamente";
      case 5: return "Molto";
      case 7: return "Moltissimo";
      case 10: return "Estremamente elevato";
      case 11: return "Max pox";
      default: return "";
    }
  };

  // Dynamic Theme based on Race Mode
  const isRace = activeSession.isRace;
  const themeColor = isRace ? 'blue-600' : 'slate-900';
  const glowColor = isRace ? 'rgba(37,99,235,0.3)' : 'transparent';
  const borderColor = isRace ? 'border-blue-500' : 'border-slate-800';

  return (
    <div className={`flex flex-col h-full bg-slate-950 relative selection:bg-fuchsia-500 selection:text-white transition-colors duration-500`}>
      
      {/* SUCCESS OVERLAY */}
      {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-300">
              <div className="text-center p-8 bg-slate-900 border border-emerald-500 rounded-2xl shadow-[0_0_100px_rgba(16,185,129,0.4)] max-w-sm mx-4">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse">
                      <CheckCircle2 size={50} className="text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 italic tracking-tighter">BLOCCO INVIATO</h3>
                  <Button onClick={() => setShowSuccess(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest mt-6">
                      Nuovo Ciclo
                  </Button>
              </div>
          </div>
      )}

      {/* HELP MODAL (Dr. Di Liborio) */}
      {showHelp && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white italic tracking-tighter">
                        FLUX: La tua Bussola di Consapevolezza
                    </h2>
                    <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6 text-slate-300 leading-relaxed font-light">
                    <div className="bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/20">
                        <p className="italic text-cyan-200">
                            "Questo non è un registro dei voti, ma uno strumento per allenare la tua consapevolezza. Io, come tuo psicologo, userò questi dati per capire insieme a te come vivi il campo, la fatica e la pressione."
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Activity size={18} className="text-fuchsia-400"/> Scala RPE (0-11)</h3>
                        <p className="text-sm">Misura lo sforzo percepito, quanto ti è "costato" l'allenamento.</p>
                        <ul className="mt-2 space-y-1 text-sm list-disc pl-5 text-slate-400">
                            <li><strong className="text-white">0:</strong> Riposo totale.</li>
                            <li><strong className="text-white">5:</strong> Sforzo moderato.</li>
                            <li><strong className="text-white">10:</strong> Sforzo estremo.</li>
                            <li><strong className="text-fuchsia-500">11 (Max pox):</strong> Massimale assoluto.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Zap size={18} className="text-amber-400"/> Le 4 Aree</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                <strong className="text-cyan-400 block uppercase text-xs mb-1">Tecnico</strong>
                                Precisione e pulizia dei movimenti.
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                <strong className="text-amber-400 block uppercase text-xs mb-1">Tattico</strong>
                                Comprensione delle situazioni e scelte.
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                <strong className="text-rose-400 block uppercase text-xs mb-1">Fisico</strong>
                                Energia, forza e rapidità percepita.
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                <strong className="text-emerald-400 block uppercase text-xs mb-1">Mentale</strong>
                                Focus, reazione all'errore, ansia.
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Settings size={18} className="text-slate-400"/> Personalizzazione</h3>
                        <p className="text-sm">
                            Puoi aggiungere o cambiare quello che valutiamo cliccando sull'icona <strong>Ingranaggio</strong>. Se ho già inserito dei parametri per te, li troverai pronti, ma puoi aggiungerne altri se senti che sono importanti per te.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                         <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Send size={18} className="text-blue-400"/> Quando inviare?</h3>
                         <p className="text-sm">
                            Ti suggerisco di inviare i dati ogni <strong>5 sessioni</strong> per vedere insieme i tuoi progressi settimanali, ma sentiti libero di inviarli anche singolarmente o dopo 2-3 giorni se non riesci a fare l'intera settimana.
                         </p>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
                    <Button onClick={() => setShowHelp(false)} variant="secondary" className="w-full sm:w-auto">Ho capito, torniamo al lavoro</Button>
                </div>
             </div>
          </div>
      )}

      {/* HEADER CYBERPUNK */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 p-4 sticky top-0 z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        
        {/* Top Row: Identity & App Info */}
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-600 font-black text-white uppercase tracking-tighter">
                        AT
                    </div>
                </div>
                <div>
                    <span className="block text-[10px] text-cyan-400 font-mono tracking-[0.2em] uppercase mb-0.5 glow-sm">Atleta</span>
                    <span className="block text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] uppercase">
                        {routeId ? routeId.toUpperCase() : 'ATLETA DEMO'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-end">
                <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400 drop-shadow-[0_0_8px_rgba(192,38,211,0.6)]">
                    FLUX
                </h1>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                    by Dr. Massimiliano Di Liborio
                </p>
                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={() => setShowHelp(true)}
                        className="p-1.5 bg-slate-800 rounded text-cyan-400 hover:text-white hover:bg-cyan-600 transition-all border border-slate-700 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                        title="Guida e Filosofia"
                    >
                        <HelpCircle size={14} />
                    </button>
                    <button 
                      onClick={onOpenSettings}
                      className="p-1.5 bg-slate-800 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all border border-slate-700"
                      title="Impostazioni"
                    >
                      <Settings size={14} />
                    </button>
                </div>
            </div>
        </div>

        {/* Title & Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
                 <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Activity size={18} className="text-cyan-400 animate-pulse" />
                    TRAINING EVALUATION
                 </h2>
                 <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">
                     {lastSaved ? `Salvataggio: ${lastSaved.toLocaleTimeString()}` : 'Modifiche non salvate'}
                 </p>
            </div>

            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button 
                        variant="ghost" 
                        onClick={handleManualSave} 
                        className="flex-1 sm:flex-none border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:text-white uppercase font-bold text-xs tracking-wider py-2.5 px-4 rounded transition-all"
                    >
                        <Save size={16} className="mr-2" /> Salva Bozza
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit} 
                        disabled={!canSubmit}
                        className={`flex-1 sm:flex-none bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border-none uppercase font-black text-xs tracking-widest py-2.5 px-6 rounded relative overflow-hidden group ${!canSubmit ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Send size={16} /> Invia {sessionsFilledCount > 0 ? `(${sessionsFilledCount})` : ''}
                        </span>
                        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
                    </Button>
                </div>
                {canSubmit && sessionsFilledCount < 5 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20 animate-in fade-in slide-in-from-bottom-1">
                        <Info size={10} />
                        <span>Consigliato: Completa 5 sessioni, ma puoi inviare ora.</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* Session Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-4 scrollbar-hide">
            {localSessions.map((s, idx) => (
                <button
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`flex flex-col items-center min-w-[5rem] p-2 rounded border transition-all relative overflow-hidden ${
                        activeSessionId === s.id 
                        ? 'bg-cyan-900/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                >
                    {activeSessionId === s.id && <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>}
                    <div className="flex items-center gap-1">
                        {s.isRace && <Trophy size={10} className="text-amber-400" />}
                        <span className="text-xs font-black uppercase tracking-wider">Sess {idx + 1}</span>
                    </div>
                    <span className="text-[10px] opacity-70 truncate w-full text-center font-mono">
                        {s.date ? new Date(s.date).toLocaleDateString('it-IT', {weekday:'short'}) : '-'}
                    </span>
                    {/* Visual Indicator if session has data */}
                    {(s.rpe > 0 || s.isRace) && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Main Content with Dynamic Border/Glow for Race Mode */}
      <div 
        className={`flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-10 pb-24 border-x border-t ${borderColor} rounded-t-3xl mt-4 transition-all duration-500`}
        style={{ boxShadow: `0 0 50px ${glowColor}` }}
      >
        
        {/* Top Controls: Date & Race Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
             {/* Date Selector */}
            <div className="flex-1 bg-slate-900/40 p-1 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="bg-slate-800 p-3 rounded-lg text-cyan-400">
                    <Calendar size={20} />
                </div>
                <input 
                    type="date" 
                    value={activeSession.date}
                    onChange={(e) => updateSession(s => ({ ...s, date: e.target.value }))}
                    className="bg-transparent text-white font-mono text-lg outline-none w-full"
                />
            </div>

            {/* Race Toggle */}
            <button 
                onClick={handleRaceToggle}
                className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-3 transition-all duration-300 ${
                    isRace 
                    ? 'bg-blue-900/40 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
            >
                <div className={`p-2 rounded-full ${isRace ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-500'}`}>
                    <Trophy size={18} />
                </div>
                <span className="font-bold uppercase tracking-widest text-sm">
                    {isRace ? 'Modalità Gara' : 'Allenamento'}
                </span>
            </button>
        </div>

        {/* Extra Race Fields */}
        {isRace && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-blue-500/30">
                    <label className="text-[10px] uppercase font-bold text-blue-300 mb-1 block">Minutaggio</label>
                    <input 
                        type="text" 
                        placeholder="Es. 90'"
                        value={activeSession.matchMinutes || ''}
                        onChange={(e) => handleMinutesChange(e.target.value)}
                        className="w-full bg-transparent border-b border-blue-500/50 text-white font-mono text-lg focus:outline-none focus:border-blue-400"
                    />
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-blue-500/30">
                    <label className="text-[10px] uppercase font-bold text-blue-300 mb-1 block">Risultato Finale</label>
                    <input 
                        type="text" 
                        placeholder="Es. 3-1"
                        value={activeSession.matchResult || ''}
                        onChange={(e) => handleResultChange(e.target.value)}
                        className="w-full bg-transparent border-b border-blue-500/50 text-white font-mono text-lg focus:outline-none focus:border-blue-400"
                    />
                </div>
            </div>
        )}

        {/* RPE Scale */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-700 p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">RPE SCALE</h3>
                    <p className="text-[10px] text-cyan-500/80 font-mono tracking-widest">SFORZO PERCEPITO</p>
                </div>
                <span className={`text-4xl font-black italic ${getRpeColor(activeSession.rpe)}`}>
                    {activeSession.rpe}
                </span>
            </div>
            
            <input
                type="range"
                min="0"
                max="11"
                step="0.5"
                value={activeSession.rpe}
                onChange={(e) => handleRpeChange(parseFloat(e.target.value))}
                className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-white transition-all shadow-inner"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-mono uppercase tracking-widest">
                <span>Riposo</span>
                <span className="text-cyan-500">Target</span>
                <span className="text-red-500">Max</span>
            </div>
        </div>

        {/* Notes */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg blur opacity-20 group-hover:opacity-50 transition"></div>
            <div className="relative bg-slate-900 p-4 rounded-lg border border-slate-700">
                <label className="text-slate-400 text-[10px] font-bold uppercase mb-2 block tracking-[0.2em]">Note & Feedback</label>
                <textarea
                    value={activeSession.notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded p-3 text-slate-200 focus:border-cyan-500/50 focus:text-white outline-none transition-all min-h-[80px] font-mono text-sm"
                />
            </div>
        </div>

        {/* Dynamic Parameters */}
        <div className="space-y-12">
            
            {areas.map((area, index) => {
                const areaColor = getAreaColor(index);
                return (
                <div key={area.id} className="relative">
                    {/* AREA TITLE - LARGER & FLUO */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                        <h4 
                            className="font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-center px-4" 
                            style={{ 
                                color: areaColor, 
                                textShadow: `0 0 15px ${areaColor}`,
                                filter: 'brightness(1.2)'
                            }}
                        >
                            {area.name}
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                    </div>

                    <div className="grid gap-6">
                        {area.parameters.map(param => {
                            const score = activeSession.scores[param.id] ?? 6;
                            const label = getScaleLabel(score);
                            
                            return (
                                <div key={param.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-slate-600 transition-all shadow-lg">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <label className="text-slate-200 text-sm font-bold tracking-wide block uppercase">{param.name}</label>
                                            <span className="text-[10px] font-mono tracking-wider opacity-80 h-4 block" style={{ color: areaColor }}>
                                                {label}
                                            </span>
                                        </div>
                                        <div className={`w-10 h-10 rounded flex items-center justify-center font-black text-lg shadow-xl transition-all ${getPerformanceColorClass(score)}`}>
                                            {score}
                                        </div>
                                    </div>
                                    
                                    {/* VISIBLE SLIDER (PACER) with GRADIENT TRACK */}
                                    <div className="relative pt-2 h-8 flex items-center">
                                        {/* The Gradient Track */}
                                        <div className="absolute left-0 right-0 h-2 rounded-full bg-gradient-to-r from-red-600 via-yellow-400 to-emerald-500 shadow-inner opacity-90"></div>
                                        
                                        {/* The Input - thumb styled via arbitrary class variants supported by Tailwind JIT */}
                                        <input
                                            type="range"
                                            min="1"
                                            max="11"
                                            step="1"
                                            value={score}
                                            onChange={(e) => handleScoreChange(param.id, parseInt(e.target.value))}
                                            className="relative w-full h-2 bg-transparent appearance-none cursor-pointer focus:outline-none 
                                            [&::-webkit-slider-thumb]:appearance-none 
                                            [&::-webkit-slider-thumb]:w-5 
                                            [&::-webkit-slider-thumb]:h-5 
                                            [&::-webkit-slider-thumb]:rounded-full 
                                            [&::-webkit-slider-thumb]:bg-white 
                                            [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.8)]
                                            [&::-moz-range-thumb]:w-5 
                                            [&::-moz-range-thumb]:h-5 
                                            [&::-moz-range-thumb]:rounded-full 
                                            [&::-moz-range-thumb]:bg-white 
                                            [&::-moz-range-thumb]:border-none
                                            [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-600 font-mono -mt-1">
                                            <span>1</span>
                                            <span>11</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                );
            })}

            {/* NEW HRV COHERENCE ROW */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                    <h4 
                        className="font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-center px-4" 
                        style={{ 
                            color: '#10b981', 
                            textShadow: `0 0 15px #10b981`,
                            filter: 'brightness(1.2)'
                        }}
                    >
                        HRV
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                </div>

                <div className="grid gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-slate-600 transition-all shadow-lg">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <label className="text-slate-200 text-sm font-bold tracking-wide block uppercase">Coerenza HRV (%)</label>
                                <span className="text-[10px] font-mono tracking-wider opacity-80 h-4 block" style={{ color: '#10b981' }}>
                                    0-100%
                                </span>
                            </div>
                            <input 
                                type="number"
                                min="0"
                                max="100"
                                value={activeSession.hrvCoherence || 0}
                                onChange={(e) => {
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) val = 0;
                                    if (val > 100) val = 100;
                                    if (val < 0) val = 0;
                                    updateSession(s => ({ ...s, hrvCoherence: val }));
                                }}
                                className={`w-16 h-10 rounded flex items-center justify-center font-black text-lg shadow-xl transition-all text-center focus:outline-none focus:ring-2 focus:ring-white`}
                                style={{ backgroundColor: `hsl(${(activeSession.hrvCoherence || 0) * 1.2}, 100%, 40%)`, color: 'white' }}
                            />
                        </div>
                        
                        <div className="relative pt-2 h-8 flex items-center">
                            <div className="absolute left-0 right-0 h-2 rounded-full bg-gradient-to-r from-red-600 to-emerald-500 shadow-inner opacity-90"></div>
                            
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={activeSession.hrvCoherence || 0}
                                onChange={(e) => updateSession(s => ({ ...s, hrvCoherence: parseInt(e.target.value) }))}
                                className="relative w-full h-2 bg-transparent appearance-none cursor-pointer focus:outline-none 
                                [&::-webkit-slider-thumb]:appearance-none 
                                [&::-webkit-slider-thumb]:w-5 
                                [&::-webkit-slider-thumb]:h-5 
                                [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:bg-white 
                                [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.8)]
                                [&::-moz-range-thumb]:w-5 
                                [&::-moz-range-thumb]:h-5 
                                [&::-moz-range-thumb]:rounded-full 
                                [&::-moz-range-thumb]:bg-white 
                                [&::-moz-range-thumb]:border-none
                                [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                            />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-600 font-mono -mt-1">
                                <span>0</span>
                                <span>100</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: COACH DASHBOARD
// ==========================================

interface CoachDashboardProps {
  currentBlockSessions: SessionData[];
  history: TrainingBlock[];
  currentAreas: Area[];
  isConnected: boolean;
}

// Custom Dot for Line Chart to highlight Races
const CustomizedDot = (props: any) => {
    const { cx, cy, payload, stroke, strokeWidth } = props;
    if (payload.isRace) {
        return (
            <g transform={`translate(${cx - 8},${cy - 8})`}>
                <polygon points="8,0 10.5,5 16,6 12,10 13,16 8,13 3,16 4,10 0,6 5.5,5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
            </g>
        );
    }
    return (
        <circle cx={cx} cy={cy} r={4} stroke={stroke} strokeWidth={strokeWidth} fill="#0f172a" />
    );
};

const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  currentBlockSessions, 
  history,
  currentAreas,
  isConnected
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [selectedHistoryArea, setSelectedHistoryArea] = useState<string | null>(null);
  const [trendViewMode, setTrendViewMode] = useState<'macro' | 'micro'>('micro');
  const [viewFilter, setViewFilter] = useState<'all' | 'training' | 'race'>('all');

  // --- FILTER HELPER ---
  const filterSessions = (sessions: SessionData[]) => {
      if (viewFilter === 'all') return sessions;
      if (viewFilter === 'race') return sessions.filter(s => s.isRace);
      return sessions.filter(s => !s.isRace);
  };

  const filteredCurrentSessions = useMemo(() => filterSessions(currentBlockSessions), [currentBlockSessions, viewFilter]);

  // --- 1. Data Prep for Charts (Bar & Radar) ---
  const chartData = useMemo(() => {
    let sessionsToAnalyze = filteredCurrentSessions;
    if (selectedSessionId !== 'all') {
        sessionsToAnalyze = filteredCurrentSessions.filter(s => s.id === selectedSessionId);
    }

    const data: any[] = [];
    currentAreas.forEach((area, index) => {
        const areaColor = getAreaColor(index);
        area.parameters.forEach(param => {
            let total = 0;
            let count = 0;
            sessionsToAnalyze.forEach(s => {
                if (s.scores[param.id]) {
                    total += s.scores[param.id];
                    count++;
                }
            });
            const avg = count > 0 ? parseFloat((total / count).toFixed(1)) : 0;
            data.push({
                subject: param.name, // Radar uses 'subject' usually
                name: param.name, // Bar uses 'name'
                areaName: area.name,
                score: avg,
                color: areaColor,
                fullMark: 11
            });
        });
    });
    return data;
  }, [filteredCurrentSessions, currentAreas, selectedSessionId]);

  // --- 2. Data Prep for MACRO Trend (With Infinite Scrolling Logic) ---
  const macroTrendData = useMemo(() => {
    const dataPoints: any[] = [];
    const processBlock = (blockLabel: string, sessions: SessionData[], areasSnapshot: Area[]) => {
        const relevantSessions = filterSessions(sessions);
        if (relevantSessions.length === 0) return; // Skip block if empty after filter

        const point: any = { name: blockLabel };
        areasSnapshot.forEach(area => {
            let areaSum = 0;
            let areaCount = 0;
            const paramIds = new Set(area.parameters.map(p => p.id));
            const paramSums: Record<string, number> = {};
            const paramCounts: Record<string, number> = {};

            relevantSessions.forEach(s => {
                Object.entries(s.scores).forEach(([pId, val]) => {
                    if (paramIds.has(pId)) {
                        areaSum += val as number;
                        areaCount++;
                        if(!paramSums[pId]) { paramSums[pId] = 0; paramCounts[pId] = 0; }
                        paramSums[pId] += val as number;
                        paramCounts[pId]++;
                    }
                });
            });
            point[area.name] = areaCount > 0 ? parseFloat((areaSum / areaCount).toFixed(1)) : 0;
            point[`${area.name}_id`] = area.id;
            area.parameters.forEach(p => {
                const pAvg = paramCounts[p.id] ? parseFloat((paramSums[p.id] / paramCounts[p.id]).toFixed(1)) : 0;
                point[`${p.name}`] = pAvg;
            });
        });
        
        let hrvSum = 0, hrvCount = 0;
        relevantSessions.forEach(s => {
            if (s.hrvCoherence !== undefined) {
                hrvSum += s.hrvCoherence;
                hrvCount++;
            }
        });
        if (hrvCount > 0) {
            point['HRV Coherence'] = parseFloat((hrvSum / hrvCount).toFixed(1));
        }

        if (Object.keys(point).length > 1) dataPoints.push(point);
    };

    history.forEach((block, idx) => {
        // Create a chronological label: "15 Oct (1)"
        const dateObj = new Date(block.submittedAt);
        const dateStr = dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        // Append index to allow multiple blocks on same day without key collision in charts
        const label = `${dateStr} #${idx + 1}`;
        
        processBlock(label, block.sessions, block.areaSnapshot);
    });
    return dataPoints;
  }, [history, viewFilter]);

  // --- 3. Data Prep for MICRO Trend ---
  const microTrendData = useMemo(() => {
    return filteredCurrentSessions.map((session, i) => {
        const point: any = { name: `S${i + 1}`, isRace: session.isRace };
        if (session.hrvCoherence !== undefined) {
            point['HRV Coherence'] = session.hrvCoherence;
        }
        currentAreas.forEach(area => {
            let areaSum = 0;
            let areaCount = 0;
            area.parameters.forEach(p => {
                const val = session.scores[p.id];
                point[p.name] = val !== undefined ? val : null;
                if (val !== undefined) {
                    areaSum += val;
                    areaCount++;
                }
            });
            point[area.name] = areaCount > 0 ? parseFloat((areaSum / areaCount).toFixed(1)) : null;
        });
        return point;
    });
  }, [filteredCurrentSessions, currentAreas]);

  // --- 4. Trend Stats ---
  // Triggering a new commit for Vercel deployment
  const trends = useMemo(() => {
    const currentAverages: Record<string, {sum: number, count: number, color: string}> = {};
    chartData.forEach(d => {
        if(!currentAverages[d.areaName]) currentAverages[d.areaName] = {sum:0, count:0, color: d.color};
        currentAverages[d.areaName].sum += d.score;
        currentAverages[d.areaName].count++;
    });

    // Handle Previous Block with Filter
    const lastBlock = history.length > 0 ? history[history.length - 1] : null;
    const previousFilteredSessions = lastBlock ? filterSessions(lastBlock.sessions) : [];

    const trendsList: any[] = [];
    currentAreas.forEach(area => {
        const currObj = currentAverages[area.name];
        const current = currObj && currObj.count > 0 ? parseFloat((currObj.sum / currObj.count).toFixed(1)) : 0;
        let previous = 0;
        if (previousFilteredSessions.length > 0) {
             let sum = 0, count = 0;
             const paramIds = new Set(area.parameters.map(p => p.id));
             previousFilteredSessions.forEach(s => {
                 Object.entries(s.scores).forEach(([pid, v]) => {
                     if (paramIds.has(pid)) { sum += (v as number); count++; }
                 });
             });
             previous = count > 0 ? parseFloat((sum/count).toFixed(1)) : 0;
        }
        const diff = current - previous;
        trendsList.push({
            id: area.id,
            name: area.name,
            current,
            previous,
            diff,
            isImproving: diff > 0,
            isStable: diff === 0,
            color: currObj ? currObj.color : '#64748b'
        });
    });

    // Add HRV Coherence Trend
    let currentHrvSum = 0, currentHrvCount = 0;
    filteredCurrentSessions.forEach(s => {
        if (s.hrvCoherence !== undefined) {
            currentHrvSum += s.hrvCoherence;
            currentHrvCount++;
        }
    });
    const currentHrv = currentHrvCount > 0 ? parseFloat((currentHrvSum / currentHrvCount).toFixed(1)) : 0;

    let previousHrvSum = 0, previousHrvCount = 0;
    previousFilteredSessions.forEach(s => {
        if (s.hrvCoherence !== undefined) {
            previousHrvSum += s.hrvCoherence;
            previousHrvCount++;
        }
    });
    const previousHrv = previousHrvCount > 0 ? parseFloat((previousHrvSum / previousHrvCount).toFixed(1)) : 0;
    
    const hrvDiff = currentHrv - previousHrv;

    if (currentHrvCount > 0 || previousHrvCount > 0) {
        trendsList.push({
            id: 'hrv-coherence',
            name: 'HRV Coherence',
            current: currentHrv,
            previous: previousHrv,
            diff: hrvDiff,
            isImproving: hrvDiff > 0,
            isStable: hrvDiff === 0,
            color: '#10b981'
        });
    }

    return trendsList;
  }, [chartData, history, currentAreas, viewFilter, filteredCurrentSessions]);

  const linesToShow = useMemo(() => {
      if (!selectedHistoryArea) {
          return currentAreas.map((area, index) => ({
              key: area.name,
              color: getAreaColor(index),
              strokeWidth: 3,
              strokeDasharray: "0"
          }));
      } else if (selectedHistoryArea === 'HRV Coherence') {
          return [{
              key: 'HRV Coherence',
              color: '#10b981',
              strokeWidth: 3,
              strokeDasharray: "0"
          }];
      } else {
          const area = currentAreas.find(a => a.name === selectedHistoryArea);
          if (!area) return [];
          const areaIndex = currentAreas.indexOf(area);
          const baseColor = getAreaColor(areaIndex);
          return area.parameters.map((p, idx) => ({
              key: p.name,
              color: baseColor, 
              strokeWidth: 2,
              strokeDasharray: idx % 2 === 0 ? "0" : "5 5"
          }));
      }
  }, [selectedHistoryArea, currentAreas]);

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 space-y-8">
      
      {/* HEADER & SYNC CONTROLS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-slate-800 pb-6">
        <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 flex items-center gap-3 drop-shadow-sm">
            <Activity className="text-cyan-400" /> 
            Dashboard Coach
            </h2>
            <div className="flex items-center gap-2 mt-1">
                {isConnected ? (
                    <>
                        <DownloadCloud size={12} className="text-emerald-500 animate-bounce"/>
                        <p className="text-emerald-400 text-sm font-bold tracking-wide shadow-emerald-500/50 drop-shadow-sm">Cloud Sincronizzato</p>
                    </>
                ) : (
                    <>
                        <WifiOff size={12} className="text-red-500"/>
                        <p className="text-red-400 text-sm font-medium">Disconnesso / Offline</p>
                    </>
                )}
            </div>
        </div>

        {/* SYNC BUTTON AREA & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            {/* TYPE FILTER */}
            <div className="relative w-full sm:w-auto">
                <select 
                    value={viewFilter}
                    onChange={(e) => setViewFilter(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 block p-2.5 appearance-none outline-none cursor-pointer"
                >
                    <option value="all">Mostra Tutto</option>
                    <option value="training">Solo Allenamenti</option>
                    <option value="race">Solo Gare / Partite</option>
                </select>
            </div>

            {/* SESSION SELECTOR */}
            <div className="relative min-w-[200px] hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Filter size={16} />
                </div>
                <select 
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 appearance-none pr-10 outline-none hover:bg-slate-800 transition-colors cursor-pointer"
                >
                    <option value="all">Media Dati Attuali</option>
                    <option disabled>───────</option>
                    {filteredCurrentSessions.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                            {s.isRace ? '🏆 ' : ''}{s.label} ({s.date ? new Date(s.date).toLocaleDateString('it-IT') : 'No data'})
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RADAR CHART (Dinamico) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Hexagon size={20} className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]" /> 
                    Profilo Atleta <span className="text-slate-500 font-normal text-sm">| Radar</span>
                </h3>
            </div>
            
            <div className="flex-1 min-h-[300px] w-full relative">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 11]} tick={false} axisLine={false} />
                            <Radar
                                name="Atleta"
                                dataKey="score"
                                stroke="#c026d3"
                                strokeWidth={3}
                                fill="#c026d3"
                                fillOpacity={0.4}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 italic">
                        Dati insufficienti o filtrati.
                    </div>
                )}
            </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" /> 
                    Dettaglio Parametri <span className="text-slate-500 font-normal text-sm">| Bar</span>
                </h3>
            </div>

            <div className="h-[350px] w-full">
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#94a3b8" 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                        />
                        <YAxis domain={[0, 11]} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} tickCount={12} />
                        <Tooltip 
                            cursor={{fill: '#1e293b', opacity: 0.4}}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="score" name="Valore" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 italic">
                        Nessun dato locale disponibile.
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* TREND ANALYSIS SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]" /> Analisi Andamento
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                    Visualizzazione Filtro: <span className="text-white font-bold uppercase">{viewFilter === 'all' ? 'Tutto' : viewFilter}</span>
                </p>
            </div>
            
            {/* TIME VIEW TOGGLE */}
            <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex gap-1">
                <button
                    onClick={() => setTrendViewMode('micro')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        trendViewMode === 'micro' 
                        ? 'bg-fuchsia-600 text-white shadow-[0_0_10px_rgba(192,38,211,0.5)]' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    <PlayCircle size={14} /> Dati Recenti
                </button>
                <button
                    onClick={() => setTrendViewMode('macro')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        trendViewMode === 'macro' 
                        ? 'bg-fuchsia-600 text-white shadow-[0_0_10px_rgba(192,38,211,0.5)]' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    <History size={14} /> Storico Archivio
                </button>
            </div>
        </div>

        {/* TREND CARDS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <button
                onClick={() => setSelectedHistoryArea(null)}
                className={`p-3 rounded-xl border transition-all text-left ${
                    selectedHistoryArea === null 
                    ? 'bg-slate-800 border-fuchsia-500/50 shadow-[0_0_10px_rgba(192,38,211,0.2)]' 
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                }`}
            >
                <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Generale</span>
                <span className="text-sm text-white">Medie Aree</span>
            </button>

            {trends.map(t => (
                <button 
                    key={t.id}
                    onClick={() => setSelectedHistoryArea(selectedHistoryArea === t.name ? null : t.name)}
                    className={`p-3 rounded-xl border transition-all text-left relative overflow-hidden ${
                        selectedHistoryArea === t.name
                        ? 'bg-slate-800 ring-1 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                    }`}
                    style={{ borderColor: selectedHistoryArea === t.name ? t.color : '#1e293b' }}
                >   
                    <div className="absolute top-0 right-0 w-8 h-8 opacity-10 rounded-bl-full" style={{background: t.color}}></div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase truncate pr-2" style={{ color: t.color }}>{t.name}</span>
                        {history.length > 0 && (
                            t.isStable ? <Minus size={14} className="text-slate-500" /> :
                            t.isImproving 
                            ? <TrendingUp size={14} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" /> 
                            : <TrendingDown size={14} className="text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
                        )}
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-white">
                            {t.current}
                        </span>
                    </div>
                </button>
            ))}
        </div>

        {/* DYNAMIC CHART */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative">
            <div className="absolute top-4 right-6 text-xs font-mono text-cyan-500/50 font-bold pointer-events-none tracking-widest z-10">
                {trendViewMode === 'micro' ? 'ANALISI MICRO-CICLO (Recente)' : 'ANALISI MACRO-CICLO (Archivio)'}
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        data={trendViewMode === 'micro' ? microTrendData : macroTrendData} 
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                        <YAxis domain={selectedHistoryArea === 'HRV Coherence' ? [0, 100] : [0, 11]} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                        
                        {/* THE TIME SCROLLING BRUSH */}
                        {trendViewMode === 'macro' && (
                            <Brush 
                                dataKey="name" 
                                height={30} 
                                stroke="#06b6d4" 
                                fill="#0f172a" 
                                tickFormatter={(val) => val}
                                travellerWidth={10}
                            />
                        )}
                        
                        {linesToShow.map((line) => (
                            <Line 
                                key={line.key}
                                type="monotone" 
                                dataKey={line.key} 
                                stroke={line.color} 
                                strokeWidth={line.strokeWidth}
                                strokeDasharray={line.strokeDasharray}
                                dot={trendViewMode === 'micro' ? <CustomizedDot /> : { fill: '#0f172a', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: line.color }}
                                animationDuration={500}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center mt-4 gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <ZoomIn size={14} className="text-cyan-500" />
                    <span>
                        {selectedHistoryArea 
                        ? `Analisi: ${selectedHistoryArea} (Singoli Parametri)` 
                        : 'Analisi: Panoramica Generale (Medie Aree)'}
                    </span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="h-12"></div>
    </div>
  );
};

// ==========================================
// DATA LOGIC & UTILS
// ==========================================

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEmptyBlock = (): SessionData[] => {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `session-${Date.now()}-${i}`,
    label: `Sessione ${i + 1}`,
    date: '',
    rpe: 0,
    scores: {},
    notes: '',
    completed: false,
    isRace: false,
    matchMinutes: '',
    matchResult: '',
    hrvCoherence: 0
  }));
};

const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// CSV Export Logic
const exportToCSV = (athleteName: string, history: TrainingBlock[]) => {
    if (!history || history.length === 0) {
        alert("Nessun dato da esportare.");
        return;
    }

    // 1. Gather all unique parameters to create headers
    const paramHeadersSet = new Set<string>();
    history.forEach(block => {
        block.areaSnapshot.forEach(area => {
            area.parameters.forEach(p => paramHeadersSet.add(`${area.name} - ${p.name}`));
        });
    });
    const paramHeaders = Array.from(paramHeadersSet).sort();

    // 2. Build Header Row
    let csvContent = "Data Invio,Etichetta Sessione,Tipo,Data Sessione,RPE (0-11),Minuti,Risultato,Note,HRV Coherence (%)," + paramHeaders.join(",") + "\n";

    // 3. Build Data Rows
    history.forEach(block => {
        const submittedDate = new Date(block.submittedAt).toLocaleDateString();
        
        block.sessions.forEach(session => {
            const sessionDate = session.date ? new Date(session.date).toLocaleDateString() : 'N/D';
            const cleanNotes = session.notes.replace(/(\r\n|\n|\r|,)/gm, " "); // Remove newlines and commas for CSV safety
            const type = session.isRace ? "GARA" : "Allenamento";
            const mins = session.matchMinutes || "";
            const result = session.matchResult || "";
            const hrv = session.hrvCoherence !== undefined ? session.hrvCoherence : "";

            let row = `${submittedDate},${session.label},${type},${sessionDate},${session.rpe},${mins},${result},"${cleanNotes}",${hrv}`;

            // Map scores to the correct column
            paramHeaders.forEach(header => {
                // Find parameter ID corresponding to this header in the current block's snapshot
                let score = "";
                // This lookup is a bit expensive O(N^2) but fine for client side export
                block.areaSnapshot.forEach(area => {
                    area.parameters.forEach(p => {
                        if (`${area.name} - ${p.name}` === header) {
                            if (session.scores[p.id] !== undefined) {
                                score = session.scores[p.id].toString();
                            }
                        }
                    });
                });
                row += `,${score}`;
            });
            
            csvContent += row + "\n";
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FLUX_EXPORT_${athleteName}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- MOCK DATA SEEDER ---
const MOCK_ATHLETES = [
    { id: 'demo', name: 'Atleta Demo', sport: 'Generale', email: 'demo@flux.com', phone: '' },
];

const generateMockHistory = (count: number, areas: Area[]): TrainingBlock[] => {
    const blocks: TrainingBlock[] = [];
    const now = new Date();
    
    for (let b = 0; b < count; b++) {
        // Blocks submitted in the past weeks
        const submitDate = new Date(now);
        submitDate.setDate(now.getDate() - (count - b) * 7); 

        const sessions: SessionData[] = [];
        for (let s = 0; s < 5; s++) {
            const sessionDate = new Date(submitDate);
            sessionDate.setDate(submitDate.getDate() - (5 - s));
            
            const isRace = s === 4; // Mock the last session as a race
            const scores: Record<string, number> = {};
            areas.forEach(area => {
                area.parameters.forEach(p => {
                    // Random realistic score 4-10
                    scores[p.id] = randomInt(4, 10);
                });
            });

            sessions.push({
                id: `mock-sess-${b}-${s}`,
                label: `Sessione ${s + 1}`,
                date: sessionDate.toISOString().split('T')[0],
                rpe: randomInt(3, 9),
                scores: scores,
                notes: `Allenamento mock ${b+1}-${s+1}`,
                completed: true,
                isRace: isRace,
                matchMinutes: isRace ? '90' : '',
                matchResult: isRace ? 'Vittoria' : '',
                hrvCoherence: randomInt(40, 95)
            });
        }

        blocks.push({
            id: `mock-block-${b}`,
            submittedAt: submitDate.toISOString(),
            areaSnapshot: JSON.parse(JSON.stringify(areas)), // Deep copy
            sessions: sessions
        });
    }
    return blocks;
};

// Seeding function (Called in App)
const seedMockData = () => {
    const registryKey = 'flux_coach_registry';
    if (!localStorage.getItem(registryKey)) {
        console.log("Seeding Mock Data...");
        // 1. Save Registry
        const profiles: AthleteProfile[] = MOCK_ATHLETES.map(a => ({
            ...a,
            createdAt: new Date().toISOString()
        }));
        localStorage.setItem(registryKey, JSON.stringify(profiles));

        // 2. Save Mock Blocks for each athlete
        MOCK_ATHLETES.forEach(a => {
            const archiveKey = `flux_${a.id}_local_archive`;
            const areasKey = `flux_${a.id}_areas`;
            
            // Set Default Areas
            localStorage.setItem(areasKey, JSON.stringify(DEFAULT_AREAS));
            
            // Generate History
            const history = generateMockHistory(5, DEFAULT_AREAS);
            localStorage.setItem(archiveKey, JSON.stringify(history));
        });
    }
};


// --- HOOK: ATHLETE SIDE (Cloud Writer) ---
const useAthleteLogic = (athleteId: string) => {
  const cloudKey = `flux_${athleteId}_cloud_inbox`;
  const areasKey = `flux_${athleteId}_areas`;
  const draftKey = `flux_${athleteId}_draft_block`;

  const [areas, setAreas] = useState<Area[]>(() =>
    safeLocalStorageGet<Area[]>(areasKey, DEFAULT_AREAS)
  );

  // Load Config from Cloud on Mount
  useEffect(() => {
      const loadCloudConfig = async () => {
          try {
              const { data } = await supabase
                  .from('training_blocks')
                  .select('block_data')
                  .eq('athlete_id', athleteId);
              
              if (data) {
                  // Find the latest block that is a config block
                  const configs = data
                      .map((d: any) => d.block_data)
                      .filter((b: TrainingBlock) => b.isConfig === true);
                  
                  if (configs.length > 0) {
                      // Sort by date descending to get latest
                      configs.sort((a: TrainingBlock, b: TrainingBlock) => 
                          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                      );
                      const latestConfig = configs[0];
                      
                      // Update if different
                      if (JSON.stringify(latestConfig.areaSnapshot) !== JSON.stringify(areas)) {
                          setAreas(latestConfig.areaSnapshot);
                          localStorage.setItem(areasKey, JSON.stringify(latestConfig.areaSnapshot));
                      }
                  }
              }
          } catch (e) {
              console.error("Error loading config:", e);
          }
      };
      loadCloudConfig();
  }, [athleteId]);

  // Re-read areas if localStorage changes (sync mechanism)
  useEffect(() => {
    const handleStorageChange = () => {
        const parsed = safeLocalStorageGet<Area[]>(areasKey, DEFAULT_AREAS);
        setAreas(parsed);
    };
    window.addEventListener('storage', handleStorageChange);
    // Poll for changes too since we are in same browser session simulation
    const interval = setInterval(() => {
        const saved = localStorage.getItem(areasKey);
        if(saved && saved !== JSON.stringify(areas)) {
             setAreas(safeLocalStorageGet<Area[]>(areasKey, DEFAULT_AREAS));
        }
    }, 1000);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
    };
  }, [areasKey, areas]);

  const [currentSessions, setCurrentSessions] = useState<SessionData[]>(() =>
    safeLocalStorageGet<SessionData[]>(draftKey, generateEmptyBlock())
  );

  // Effect to reset/reload session data when ID changes
  useEffect(() => {
      setCurrentSessions(safeLocalStorageGet<SessionData[]>(draftKey, generateEmptyBlock()));
  }, [athleteId, draftKey]);

  useEffect(() => { localStorage.setItem(areasKey, JSON.stringify(areas)); }, [areas, athleteId]);
  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify(currentSessions)); }, [currentSessions, athleteId]);

  const handleSubmitBlock = async (finalSessions: SessionData[]) => {
    const newBlock: TrainingBlock = {
        id: `block-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        areaSnapshot: JSON.parse(JSON.stringify(areas)),
        sessions: finalSessions
    };

    try {
        const { error } = await supabase
            .from('training_blocks')
            .insert([
                { 
                    athlete_id: athleteId, 
                    block_data: newBlock 
                }
            ]);

        if (error) {
            console.error('Supabase Error:', error);
            alert("Errore durante l'invio dei dati. Controlla la connessione.");
            return;
        }

        // If success, reset local state (triggers success animation in View)
        setCurrentSessions(generateEmptyBlock());
        localStorage.removeItem(draftKey); // Clear local draft
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (e) {
        console.error('Submission Error:', e);
        alert("Errore imprevisto durante l'invio.");
    }
  };

  return { areas, setAreas, currentSessions, setCurrentSessions, handleSubmitBlock };
};

// --- HOOK: COACH REGISTRY & LOGIC ---
const useCoachRegistry = () => {
    const registryKey = 'flux_coach_registry';
    const [athletes, setAthletes] = useState<AthleteProfile[]>([]);

    useEffect(() => {
        const load = () => {
            setAthletes(safeLocalStorageGet<AthleteProfile[]>(registryKey, []));
        };
        load();
        const interval = setInterval(load, 2000); // Poll for new athletes
        return () => clearInterval(interval);
    }, []);

    const addAthlete = (fullName: string, sport: string, email: string, phone: string) => {
        const cleanName = fullName.trim();
        if (!cleanName) return;
        
        // Generate ID: name-surname-random
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const uniqueSuffix = Math.random().toString(36).substring(2, 6);
        const newId = `${slug}-${uniqueSuffix}`;

        const newAthlete: AthleteProfile = {
            id: newId,
            name: cleanName,
            sport: sport.trim() || 'Generale',
            email: email.trim(),
            phone: phone.trim(),
            createdAt: new Date().toISOString()
        };

        const updated = [...athletes, newAthlete];
        setAthletes(updated);
        localStorage.setItem(registryKey, JSON.stringify(updated));
    };

    const removeAthlete = (id: string) => {
        if(confirm("Sei sicuro? Questo rimuoverà l'atleta dalla lista, ma non cancellerà i suoi dati storici salvati.")){
            const updated = athletes.filter(a => a.id !== id);
            setAthletes(updated);
            localStorage.setItem(registryKey, JSON.stringify(updated));
        }
    };

    return { athletes, addAthlete, removeAthlete };
};

// --- HOOK: COACH DATA LOGIC (Single Athlete) ---
const useCoachDataLogic = (athleteIdInput: string) => {
  const athleteId = athleteIdInput.toLowerCase().trim(); // Normalize ID
  const archiveKey = `flux_${athleteId}_local_archive`;
  const areasKey = `flux_${athleteId}_areas`;

  const [localHistory, setLocalHistory] = useState<TrainingBlock[]>([]);
  const [currentAreas, setCurrentAreas] = useState<Area[]>(DEFAULT_AREAS);
  const [isConnected, setIsConnected] = useState(false);

  // Load data whenever athleteId changes
  useEffect(() => {
      if (!athleteId) {
          setLocalHistory([]);
          return;
      }

      // RESET STATE IMMEDIATELY ON ID CHANGE
      setLocalHistory([]); 
      setIsConnected(false);

      const loadData = async () => {
          // 1. Load Local Config (Areas)
          setCurrentAreas(safeLocalStorageGet<Area[]>(areasKey, DEFAULT_AREAS));

          // 2. Load Local History (Backup/Cache)
          let history = safeLocalStorageGet<TrainingBlock[]>(archiveKey, []);

          // 3. Fetch from Supabase
          try {
             const { data, error } = await supabase
                .from('training_blocks')
                .select('block_data')
                .eq('athlete_id', athleteId);
             
             if (error) throw error;

             if (data) {
                 setIsConnected(true);
                 // Merge Logic
                 const serverBlocks = data.map((row: any) => row.block_data);
                 
                 // SEPARATE CONFIG BLOCKS FROM HISTORY
                 const configBlocks = serverBlocks.filter((b: TrainingBlock) => b.isConfig === true);
                 const trainingBlocks = serverBlocks.filter((b: TrainingBlock) => !b.isConfig);

                 // Update Areas from latest config if available
                 if (configBlocks.length > 0) {
                     configBlocks.sort((a: TrainingBlock, b: TrainingBlock) => 
                        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                     );
                     const latestConfig = configBlocks[0];
                     // Only update if we don't have local unsaved changes? 
                     // For now, assume cloud is truth if newer.
                     // But we also load from localStorage above. 
                     // Let's prefer Cloud Config if it exists.
                     setCurrentAreas(latestConfig.areaSnapshot);
                     localStorage.setItem(areasKey, JSON.stringify(latestConfig.areaSnapshot));
                 }

                 const existingIds = new Set(history.map((b: TrainingBlock) => b.id));
                 
                 let hasNew = false;
                 trainingBlocks.forEach((sb: TrainingBlock) => {
                     if (!existingIds.has(sb.id)) {
                         history.push(sb);
                         hasNew = true;
                     }
                 });

                 if (hasNew || (history.length === 0 && trainingBlocks.length > 0)) {
                      // Sort by date
                      history.sort((a: TrainingBlock, b: TrainingBlock) => 
                        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
                      );
                      setLocalHistory([...history]);
                      // Update cache
                      localStorage.setItem(archiveKey, JSON.stringify(history));
                 } else if (history.length > 0) {
                      // Use cached history if no new data but cache exists
                      setLocalHistory([...history]);
                 } else {
                      // Empty state if nothing found
                      setLocalHistory([]);
                 }
             }
          } catch (e) {
             console.error("Connection error:", e);
             setIsConnected(false);
             // Fallback to local history if offline
             setLocalHistory(history);
          }
      };

      loadData();
      
      // Auto-Sync Poll
      const interval = setInterval(loadData, 3000); 
      return () => clearInterval(interval);

  }, [athleteId, archiveKey, areasKey]);

  const updateAreas = async (newAreas: Area[]) => {
      setCurrentAreas(newAreas);
      localStorage.setItem(areasKey, JSON.stringify(newAreas));
      
      // Sync Config to Cloud
      try {
          const configBlock: TrainingBlock = {
              id: `config-${Date.now()}`,
              submittedAt: new Date().toISOString(),
              areaSnapshot: newAreas,
              sessions: [],
              isConfig: true
          };
          
          await supabase.from('training_blocks').insert([{
              athlete_id: athleteId,
              block_data: configBlock
          }]);
      } catch (e) {
          console.error("Error syncing config:", e);
      }
  };

  return { localHistory, currentAreas, updateAreas, isConnected };
};

// --- SHARED COMPONENTS ---
const AuthorSignature = () => (
    <div className="text-center py-4 opacity-80">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            Dr. Massimiliano Di Liborio
        </p>
    </div>
);

// --- AUTH COMPONENTS ---
const CoachLogin = ({ onLogin }: { onLogin: () => void }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'MdleAdl010108') {
            onLogin();
        } else {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                            <BrainCircuit size={32} className="text-fuchsia-500 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-center text-white mb-1 tracking-tight">Area Psicologo</h2>
                    <p className="text-center text-slate-400 text-sm mb-8">Accesso Riservato</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Key size={18} />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                className={`w-full bg-slate-950 border ${error ? 'border-red-500 text-red-100 placeholder-red-400/50' : 'border-slate-700 text-white placeholder-slate-600'} rounded-lg py-3 pl-10 pr-4 outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(232,121,249,0.2)] transition-all`}
                                placeholder="Inserisci Password"
                                autoFocus
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-[0_0_20px_rgba(192,38,211,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <LogIn size={18} /> Accedi
                        </button>
                    </form>
                    {error && <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs text-center font-bold animate-pulse">Password errata. Riprova.</div>}
                </div>
                <div className="mt-12"><AuthorSignature /></div>
            </div>
        </div>
    );
};

// --- ROUTE COMPONENTS ---

// 1. ATHLETE PORTAL (/atleta/:id) - PUBLIC
const AthletePortal = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  // Normalize ID to ensure match with Coach Dashboard
  const athleteId = (id || 'default').toLowerCase().trim();
  
  // Name Persistence Logic
  const [athleteName, setAthleteName] = useState('Atleta Demo');

  useEffect(() => {
      const nameFromUrl = searchParams.get('name');
      const storageKey = `flux_athlete_name_${athleteId}`;
      
      if (nameFromUrl) {
          // If URL has name, use it and save it
          setAthleteName(nameFromUrl);
          localStorage.setItem(storageKey, nameFromUrl);
      } else {
          // If URL has no name, try to load from storage
          const storedName = localStorage.getItem(storageKey);
          if (storedName) {
              setAthleteName(storedName);
          }
      }
  }, [searchParams, athleteId]);
  
  const { areas, setAreas, currentSessions, setCurrentSessions, handleSubmitBlock } = useAthleteLogic(athleteId);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col relative">
      <main className="flex-1 overflow-hidden relative">
         {isSetupOpen ? (
            <div className="absolute inset-0 z-40 bg-slate-950">
               <SetupParameters areas={areas} onUpdateAreas={setAreas} onClose={() => setIsSetupOpen(false)} />
            </div>
         ) : (
            <AthleteView 
                athleteName={athleteName}
                areas={areas} 
                sessions={currentSessions} 
                onSaveSessions={setCurrentSessions} 
                onSubmitBlock={handleSubmitBlock} 
                onOpenSettings={() => setIsSetupOpen(true)}
            />
         )}
      </main>
    </div>
  );
};

// 2. COACH PORTAL (/dashboard) - PROTECTED
const CoachPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [isCoachConfigOpen, setIsCoachConfigOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hooks
  const { athletes, addAthlete, removeAthlete } = useCoachRegistry();
  const { localHistory, currentAreas, updateAreas, isConnected } = useCoachDataLogic(selectedAthleteId || '');

  // Form State for New Athlete
  const [form, setForm] = useState({ name: '', sport: '', email: '', phone: '' });

  // Auth Check
  useEffect(() => {
      const auth = sessionStorage.getItem('flux_coach_auth');
      if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLoginSuccess = () => {
      sessionStorage.setItem('flux_coach_auth', 'true');
      setIsAuthenticated(true);
  };

  const handleCreateAthlete = (e: React.FormEvent) => {
      e.preventDefault();
      addAthlete(form.name, form.sport, form.email, form.phone);
      setForm({ name: '', sport: '', email: '', phone: '' });
      alert("Atleta creato con successo!");
  };

  const getShareLink = (id: string, name: string) => {
      return `${window.location.origin}/#/atleta/${id}?name=${encodeURIComponent(name)}`;
  };

  const filteredAthletes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return athletes.filter(a => 
        a.name.toLowerCase().includes(term) || 
        (a.sport && a.sport.toLowerCase().includes(term))
    );
  }, [athletes, searchTerm]);

  if (!isAuthenticated) return <CoachLogin onLogin={handleLoginSuccess} />;

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden">
       
       {/* SIDEBAR: LISTA ATLETI */}
       <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col z-20 shadow-[2px_0_20px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-slate-800">
             <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 mb-1 drop-shadow-sm cursor-pointer" onClick={() => setSelectedAthleteId(null)}>
                 FLUX
             </h1>
             <span className="text-xs text-cyan-400 font-mono font-bold tracking-[0.2em] uppercase glow-sm">Dashboard Psicologo</span>
          </div>

          <div className="p-4 border-b border-slate-800 space-y-3">
             <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                 <input 
                    type="text" 
                    placeholder="Cerca Atleta o Sport..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                 />
             </div>
             <Button onClick={() => setSelectedAthleteId(null)} variant="secondary" className="w-full justify-center text-xs">
                <Plus size={14} className="mr-2"/> Aggiungi Nuovo Atleta
             </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {filteredAthletes.length === 0 && (
                 <div className="text-center p-4 text-slate-500 text-sm">Nessun atleta trovato.</div>
             )}
             {filteredAthletes.map(athlete => (
                 <div 
                    key={athlete.id}
                    onClick={() => setSelectedAthleteId(athlete.id)}
                    className={`group p-3 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
                        selectedAthleteId === athlete.id 
                        ? 'bg-slate-800 border-fuchsia-500/50 shadow-[0_0_15px_rgba(192,38,211,0.2)]' 
                        : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-800'
                    }`}
                 >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                             selectedAthleteId === athlete.id ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                            {athlete.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm ${selectedAthleteId === athlete.id ? 'text-white' : 'text-slate-300'}`}>{athlete.name}</h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{athlete.sport || 'Generale'}</p>
                        </div>
                    </div>
                 </div>
             ))}
          </div>
          
          <div className="p-4 border-t border-slate-800">
              <AuthorSignature />
          </div>
       </aside>

       {/* MAIN CONTENT AREA */}
       <main className="flex-1 h-screen overflow-hidden relative bg-slate-950 flex flex-col">
          
          {/* VIEW: ADD ATHLETE (CENTER WHEN NO ID SELECTED) */}
          {!selectedAthleteId && (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
                  <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                      
                      <h2 className="text-3xl font-black text-white mb-2">Nuova Cartella Atleta</h2>
                      <p className="text-slate-400 mb-8">Inserisci i dati anagrafici per creare un nuovo profilo e generare il link di monitoraggio.</p>

                      <form onSubmit={handleCreateAthlete} className="space-y-6 relative z-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Nome e Cognome</label>
                                  <div className="relative">
                                      <User className="absolute left-3 top-3 text-slate-500" size={18} />
                                      <input 
                                          required
                                          type="text" 
                                          value={form.name}
                                          onChange={(e) => setForm({...form, name: e.target.value})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                          placeholder="Mario Rossi"
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Sport Praticato</label>
                                  <div className="relative">
                                      <Activity className="absolute left-3 top-3 text-slate-500" size={18} />
                                      <input 
                                          type="text" 
                                          value={form.sport}
                                          onChange={(e) => setForm({...form, sport: e.target.value})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                          placeholder="Calcio, Tennis, etc."
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Email (Opzionale)</label>
                                  <div className="relative">
                                      <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                                      <input 
                                          type="email" 
                                          value={form.email}
                                          onChange={(e) => setForm({...form, email: e.target.value})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                          placeholder="atleta@example.com"
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Telefono (Opzionale)</label>
                                  <div className="relative">
                                      <Phone className="absolute left-3 top-3 text-slate-500" size={18} />
                                      <input 
                                          type="tel" 
                                          value={form.phone}
                                          onChange={(e) => setForm({...form, phone: e.target.value})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                                          placeholder="+39 333 0000000"
                                      />
                                  </div>
                              </div>
                          </div>

                          <Button type="submit" className="w-full py-4 text-lg font-bold gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                              <Plus size={24} /> Crea Profilo Atleta
                          </Button>
                      </form>
                  </div>
              </div>
          )}

          {/* VIEW: DASHBOARD (ANALYSIS) */}
          {selectedAthleteId && selectedAthlete && (
              <div className="flex-1 h-full flex flex-col relative">
                  {/* CONFIG OVERLAY */}
                  {isCoachConfigOpen && (
                      <div className="absolute inset-0 z-50 bg-slate-950">
                          <SetupParameters 
                              areas={currentAreas} 
                              onUpdateAreas={(newAreas) => {
                                  updateAreas(newAreas);
                                  setIsCoachConfigOpen(false); // Close on save
                              }} 
                              onClose={() => setIsCoachConfigOpen(false)} 
                          />
                      </div>
                  )}

                  {/* Dashboard Header Bar */}
                  <div className="bg-slate-900/50 backdrop-blur border-b border-slate-800 p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 z-10">
                      <div>
                            <div className="flex items-center gap-3">
                                <h2 className={`text-2xl font-bold text-white flex items-center gap-2 ${isConnected ? 'animate-pulse' : ''}`}>
                                    {selectedAthlete.name}
                                </h2>
                                <span className="px-2 py-0.5 bg-fuchsia-900/30 border border-fuchsia-500/30 text-fuchsia-400 text-xs rounded font-bold uppercase tracking-wider">
                                    {selectedAthlete.sport}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                {selectedAthlete.email && <span className="flex items-center gap-1"><Mail size={12}/> {selectedAthlete.email}</span>}
                                {selectedAthlete.phone && <span className="flex items-center gap-1"><Phone size={12}/> {selectedAthlete.phone}</span>}
                            </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                           {/* Quick Actions for Selected Athlete */}
                           <a href={`https://wa.me/?text=${encodeURIComponent(`Ciao ${selectedAthlete.name}, ecco il tuo link FLUX: ${getShareLink(selectedAthlete.id, selectedAthlete.name)}`)}`} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="secondary" className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10" title="Condividi via WhatsApp">
                                    <Share2 size={16} />
                                </Button>
                           </a>

                           {/* EMAIL BUTTON ADDED HERE */}
                           <a href={`mailto:?subject=FLUX Training Log&body=${encodeURIComponent(`Ciao ${selectedAthlete.name},\n\nEcco il link per accedere al tuo diario di allenamento:\n${getShareLink(selectedAthlete.id, selectedAthlete.name)}\n\nBuon lavoro!`)}`}>
                                <Button size="sm" variant="secondary" className="border-slate-600 text-slate-300 hover:bg-slate-700" title="Condividi via Email">
                                    <Mail size={16} />
                                </Button>
                           </a>
                           
                           <Button 
                               onClick={() => setIsCoachConfigOpen(true)}
                               className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 gap-2"
                               size="sm"
                           >
                               <Settings size={16} /> Parametri
                           </Button>
                           <Button 
                              onClick={() => {
                                  exportToCSV(selectedAthlete.name, localHistory);
                              }}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] gap-2"
                              size="sm"
                           >
                               <FileSpreadsheet size={16} /> Export
                           </Button>
                           <Button size="sm" variant="danger" onClick={() => { removeAthlete(selectedAthlete.id); setSelectedAthleteId(null); }}>
                               <Trash2 size={16} />
                           </Button>
                      </div>
                  </div>

                  {/* The Dashboard Component */}
                  <div className="flex-1 overflow-hidden">
                    <CoachDashboard 
                            currentBlockSessions={localHistory.length > 0 ? localHistory[localHistory.length - 1].sessions : []}
                            history={localHistory}
                            currentAreas={currentAreas}
                            isConnected={isConnected}
                        />
                  </div>
              </div>
          )}
       </main>
    </div>
  );
};

// 3. HOME / LANDING
const LandingPage = () => {
    // SEED DATA ON LANDING
    useEffect(() => {
        seedMockData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative z-10 max-w-lg w-full">
                <h1 className="text-7xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    FLUX
                </h1>
                <p className="text-xl text-cyan-200/80 mb-12 font-light tracking-wide">
                    Training Evaluation System
                </p>

                <div className="grid gap-4 w-full">
                    <Link to="/atleta/demo" className="group relative block w-full p-6 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:border-cyan-400/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                                    <User size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">Area Atleta</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-300">Accedi al tuo diario (Demo)</p>
                                </div>
                            </div>
                            <ArrowRight className="text-slate-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>

                    <Link to="/dashboard" className="group relative block w-full p-6 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(192,38,211,0.2)] hover:border-fuchsia-400/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(192,38,211,0.8)]">
                                    <BrainCircuit size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-lg group-hover:text-fuchsia-300 transition-colors">Area Psicologo</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-300">Gestione & Analisi</p>
                                </div>
                            </div>
                            <ArrowRight className="text-slate-600 group-hover:text-fuchsia-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                </div>
                
                <div className="mt-12">
                   <AuthorSignature />
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/atleta/:id" element={<AthletePortal />} />
        <Route path="/dashboard" element={<CoachPortal />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;