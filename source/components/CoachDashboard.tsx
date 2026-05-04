import React, { useMemo, useState } from 'react';
import { Area, TrainingBlock, SessionData, getAreaColor, getRpeColor } from '../types';
import { 
  BarChart, Bar, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, DotProps
} from 'recharts';
import { 
  Activity, TrendingUp, TrendingDown, Minus, 
  BarChart3, Filter, ChevronDown, ZoomIn, History, PlayCircle, DownloadCloud, Database, Lock, Hexagon, Trophy, Edit2
} from 'lucide-react';
import { Button } from './Button';

interface CoachDashboardProps {
  currentBlockSessions: SessionData[];
  history: TrainingBlock[];
  currentAreas: Area[];
  pendingCount?: number; // Count of blocks waiting in Cloud
  onSync?: () => void;
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

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  currentBlockSessions, 
  history,
  currentAreas,
  pendingCount = 0,
  onSync
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
    return trendsList;
  }, [chartData, history, currentAreas, viewFilter]);

  const linesToShow = useMemo(() => {
      if (!selectedHistoryArea) {
          return currentAreas.map((area, index) => ({
              key: area.name,
              color: getAreaColor(index),
              strokeWidth: 3,
              strokeDasharray: "0"
          }));
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
                <Lock size={12} className="text-emerald-500"/>
                <p className="text-slate-400 text-sm font-medium">Archivio Locale (Disconnesso da Internet)</p>
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

            {onSync && (
                <div className="relative group w-full xl:w-auto">
                    {pendingCount > 0 && (
                         <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse z-10 shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                             {pendingCount}
                         </span>
                    )}
                    <Button 
                        onClick={pendingCount > 0 ? onSync : undefined}
                        disabled={pendingCount === 0}
                        className={`w-full xl:w-auto flex items-center justify-center gap-3 transition-all ${
                            pendingCount > 0 
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white' 
                            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
                        }`}
                    >
                        {pendingCount > 0 ? <DownloadCloud size={18} /> : <Database size={18} />}
                        <div className="text-left leading-tight">
                            <span className="block font-bold text-xs uppercase tracking-wider">
                                {pendingCount > 0 ? 'Sincronizza & Scarica' : 'Cloud Vuoto'}
                            </span>
                        </div>
                    </Button>
                </div>
            )}

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

      {/* SESSION SUMMARY CARD (RPE & NOTES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* RPE CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center justify-between relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-fuchsia-500/20 transition-all duration-500"></div>
                 <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity size={14} className="text-cyan-400" />
                        {selectedSessionId === 'all' ? 'Media RPE (Sforzo)' : 'RPE Sessione'}
                     </h3>
                     <div className="flex items-baseline gap-2">
                        {(() => {
                            let val = 0;
                            if (selectedSessionId === 'all') {
                                const count = filteredCurrentSessions.length;
                                const sum = filteredCurrentSessions.reduce((acc, s) => acc + s.rpe, 0);
                                val = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
                            } else {
                                const sess = filteredCurrentSessions.find(s => s.id === selectedSessionId);
                                val = sess ? sess.rpe : 0;
                            }
                            return (
                                <>
                                    <span className={`text-5xl font-black italic tracking-tighter ${getRpeColor(val)}`}>{val}</span>
                                    <span className="text-xs text-slate-500 font-mono font-bold">/ 11</span>
                                </>
                            );
                        })()}
                     </div>
                 </div>
            </div>

            {/* NOTES CARD (Only if single session selected) */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg relative flex flex-col justify-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Edit2 size={14} className="text-amber-400"/> 
                    {selectedSessionId === 'all' ? 'Note Generali' : 'Note Atleta'}
                </h3>
                <p className="text-slate-300 text-sm italic leading-relaxed">
                    {selectedSessionId === 'all' 
                        ? "Seleziona una sessione specifica per leggere le note dettagliate dell'atleta." 
                        : `"${filteredCurrentSessions.find(s => s.id === selectedSessionId)?.notes || 'Nessuna nota inserita.'}"`
                    }
                </p>
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
                        <YAxis domain={[0, 11]} stroke="#94a3b8" />
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