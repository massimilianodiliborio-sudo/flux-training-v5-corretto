
export interface Parameter {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
  parameters: Parameter[];
}

export interface SessionData {
  id: string; // e.g., 'session-1'
  label: string; // e.g., 'Session 1'
  date: string;
  rpe: number; // 0-11
  scores: Record<string, number>; // parameterId -> score (1-11)
  notes: string;
  completed: boolean;
  // New Race Fields
  isRace?: boolean;
  matchMinutes?: string;
  matchResult?: string;
  hrvCoherence?: number;
}

export interface TrainingBlock {
  id: string;
  submittedAt: string;
  areaSnapshot: Area[]; // Store the structure at time of submission
  sessions: SessionData[];
  isConfig?: boolean; // Flag to identify configuration blocks
}

export interface AthleteProfile {
    id: string;
    name: string;
    sport?: string; // New field
    email?: string; // New field
    phone?: string; // New field
    createdAt: string;
}

// Consistent Color Palette for Areas (Index based)
export const AREA_COLORS = [
  '#06b6d4', // Cyan (Tecnica)
  '#f43f5e', // Rose (Fisica)
  '#f59e0b', // Amber (Tattica)
  '#8b5cf6', // Violet (Strategia)
  '#10b981', // Emerald (Mentale)
  '#3b82f6', // Blue (Extra)
];

export const getAreaColor = (index: number) => AREA_COLORS[index % AREA_COLORS.length];

export const getRpeColor = (val: number) => {
  if (val < 4) return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]';
  if (val < 7) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
  if (val < 9) return 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]';
  return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
};

// Initial Default State
export const DEFAULT_AREAS: Area[] = [
  {
    id: 'area-tech',
    name: 'Tecnica',
    parameters: [
      { id: 'p-tech-1', name: 'Precisione' },
      { id: 'p-tech-2', name: 'Fluidità' },
    ],
  },
  {
    id: 'area-phys',
    name: 'Fisica',
    parameters: [
      { id: 'p-phys-1', name: 'Esplosività' },
      { id: 'p-phys-2', name: 'Resistenza' },
    ],
  },
  {
    id: 'area-tact',
    name: 'Tattica',
    parameters: [
      { id: 'p-tact-1', name: 'Posizionamento' },
      { id: 'p-tact-2', name: 'Lettura del gioco' },
    ],
  },
  {
    id: 'area-strat',
    name: 'Strategia',
    parameters: [
      { id: 'p-strat-1', name: 'Esecuzione Piano Gara' },
      { id: 'p-strat-2', name: 'Adattabilità' },
    ],
  },
  {
    id: 'area-ment',
    name: 'Mentale',
    parameters: [
      { id: 'p-ment-1', name: 'Focus' },
      { id: 'p-ment-2', name: 'Resilienza' },
    ],
  },
];