import React, { useState, useEffect } from 'react';
import { Area, SessionData, getAreaColor } from '../types';
import { Button } from './Button';
import { Save, Send, AlertCircle, Calendar, CheckCircle2, Settings, Zap, Activity, Trophy, HelpCircle, X, Info } from 'lucide-react';

interface AthleteViewProps {
  athleteName?: string;
  areas: Area[];
  sessions: SessionData[];
  onSaveSessions: (sessions: SessionData[]) => void;
  onSubmitBlock: (sessions: SessionData[]) => void;
  onOpenSettings: () => void;
}

export const AthleteView: React.FC<AthleteViewProps> = ({ 
  athleteName = "ATLETA DEMO",
  areas, 
  sessions, 
  onSaveSessions, 
  onSubmitBlock,
  onOpenSettings
}) => {
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
    // Visual feedback
    const btn = document.getElementById('save-btn');
    if(btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Salvato!</span>';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
        alert("Per inviare, devi compilare almeno una sessione inserendo un valore RPE (Sforzo Percepito) maggiore di 0.");
        return;
    }

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
                    <span className="block text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                        {athleteName}
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
                        id="save-btn"
                        variant="ghost" 
                        onClick={handleManualSave} 
                        className="flex-1 sm:flex-none border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:text-white uppercase font-bold text-xs tracking-wider py-2.5 px-4 rounded transition-all"
                    >
                        <Save size={16} className="mr-2" /> Salva Bozza
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit} 
                        className={`flex-1 sm:flex-none bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border-none uppercase font-black text-xs tracking-widest py-2.5 px-6 rounded relative overflow-hidden group ${!canSubmit ? 'opacity-70 grayscale-[0.5]' : ''}`}
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
                                <span>0%</span>
                                <span>100%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};