import React from 'react';
import { X, MapPin, Shield, BookOpen } from 'lucide-react';
import { HistoricalData, Empire, HistoricalEvent } from '../types';

interface InfoPanelProps {
  data: HistoricalData | null;
  selectedEmpire: Empire | null;
  selectedEvent: HistoricalEvent | null;
  onCloseSelection: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ data, selectedEmpire, selectedEvent, onCloseSelection }) => {
  if (!data) return null;

  const hasSelection = selectedEmpire || selectedEvent;

  const formatYear = (y: number) => {
    if (y < 0) return `公元前 ${Math.abs(y)} 年`;
    return `公元 ${y} 年`;
  };

  return (
    <div className="absolute top-0 left-0 h-full w-full md:w-96 bg-slate-900/95 backdrop-blur-md border-r border-slate-700 shadow-2xl z-10 transform transition-transform duration-300 ease-in-out overflow-y-auto pt-4 pb-32">
      
      <div className="p-6">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-serif">
                历史时空图谱
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">AI 驱动的历史教学地图</p>
        </div>

        {/* Main Era Summary (Show if nothing specific is selected) */}
        {!hasSelection && (
            <div className="space-y-6 animate-fade-in">
                <div className="border-l-2 border-blue-500 pl-4">
                    <h2 className="text-xl text-white font-serif mb-2">{formatYear(data.year)}</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{data.eraSummary}</p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Shield size={14} /> 当时主要政权 ({data.empires.length})
                    </h3>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        <ul className="space-y-2">
                            {data.empires.map((emp, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-300 p-2 rounded hover:bg-slate-800/50 transition-colors">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: emp.color }}></span>
                                    <span>{emp.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <MapPin size={14} /> 关键历史事件
                    </h3>
                    <ul className="space-y-3">
                        {data.events.map((evt, i) => (
                            <li key={i} className="text-sm text-slate-300 border-b border-slate-800 pb-2 last:border-0">
                                <span className="text-amber-400 font-semibold block">{evt.title}</span>
                                <span className="text-xs text-slate-500">{evt.type}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {/* Selection Details */}
        {hasSelection && (
            <div className="animate-slide-in">
                <button 
                    onClick={onCloseSelection}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-4 transition-colors"
                >
                    <X size={16} /> 返回概览
                </button>

                {selectedEmpire && (
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-4 h-4 rounded-full shadow-lg shadow-current" style={{ backgroundColor: selectedEmpire.color, color: selectedEmpire.color }}></span>
                            <h2 className="text-xl font-bold text-white font-serif">{selectedEmpire.name}</h2>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">{selectedEmpire.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                           <div className="bg-slate-900 p-2 rounded">
                                <span className="block uppercase tracking-wider font-bold mb-1">势力范围</span>
                                约 {selectedEmpire.radiusKm} km 半径
                           </div>
                           <div className="bg-slate-900 p-2 rounded">
                                <span className="block uppercase tracking-wider font-bold mb-1">中心坐标</span>
                                {selectedEmpire.latitude.toFixed(1)}, {selectedEmpire.longitude.toFixed(1)}
                           </div>
                        </div>
                    </div>
                )}

                {selectedEvent && (
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-start gap-3 mb-3">
                           <MapPin className="text-amber-400 mt-1 flex-shrink-0" />
                            <div>
                                <h2 className="text-xl font-bold text-white font-serif">{selectedEvent.title}</h2>
                                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 mt-1">
                                    {selectedEvent.type}
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">{selectedEvent.description}</p>
                        <div className="p-3 bg-amber-900/20 rounded border border-amber-900/30 flex gap-3">
                             <BookOpen size={16} className="text-amber-500 flex-shrink-0" />
                             <p className="text-xs text-amber-200 italic">
                                历史背景：此事件是 {formatYear(data.year)} 时代的重要组成部分。
                             </p>
                        </div>
                    </div>
                )}
            </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300 text-center">
                数据由 Gemini AI 实时生成。历史疆域通过球形影响范围近似展示，仅供教学参考。
            </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;