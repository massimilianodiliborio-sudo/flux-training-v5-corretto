import React, { useState } from 'react';
import { Area, Parameter } from '../types';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from './Button';

interface SetupParametersProps {
  areas: Area[];
  onUpdateAreas: (newAreas: Area[]) => void;
  onClose: () => void;
}

export const SetupParameters: React.FC<SetupParametersProps> = ({ areas, onUpdateAreas, onClose }) => {
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