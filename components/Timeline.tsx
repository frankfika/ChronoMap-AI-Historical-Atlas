import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface TimelineProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ currentYear, onYearChange }) => {
  const [sliderValue, setSliderValue] = useState(currentYear);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync slider with external prop changes
  useEffect(() => {
    setSliderValue(currentYear);
  }, [currentYear]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
  };

  const handleSliderCommit = () => {
    onYearChange(sliderValue);
  };

  // Auto-play logic (Steps by 100 years)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setSliderValue(prev => {
          const next = prev + 100; // Jump 100 years
          if (next > 2024) return prev;
          onYearChange(next);
          return next;
        });
      }, 4000); // Allow more time for reading/loading
    }
    return () => clearInterval(interval);
  }, [isPlaying, onYearChange]);

  const presets = [
    { label: "公元前 2000", year: -2000 },
    { label: "公元前 500", year: -500 },
    { label: "公元 0", year: 0 },
    { label: "公元 1000", year: 1000 },
    { label: "公元 1500", year: 1500 },
    { label: "公元 1900", year: 1900 },
    { label: "现代", year: 2020 },
  ];

  // Format year for display
  const formatYear = (y: number) => {
    if (y < 0) return `公元前 ${Math.abs(y)} 年`;
    return `公元 ${y} 年`;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-700 p-4 z-20 flex flex-col gap-4 shadow-2xl">
      
      {/* Top Row: Presets & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
            title={isPlaying ? "暂停演变" : "开始演变"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex items-baseline gap-2">
             <span className="text-3xl md:text-4xl font-bold text-white font-serif min-w-[180px] text-center">
              {formatYear(sliderValue)}
            </span>
          </div>
        </div>

        <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => onYearChange(p.year)}
              className="px-3 py-1 text-xs rounded-full bg-slate-800 border border-slate-600 hover:border-blue-400 hover:bg-slate-700 transition-all whitespace-nowrap"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Slider (Steps of 100) */}
      <div className="flex items-center gap-4">
        <button onClick={() => onYearChange(currentYear - 100)} className="text-slate-400 hover:text-white"><ChevronLeft /></button>
        <input
          type="range"
          min="-3000"
          max="2020"
          step="100" 
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <button onClick={() => onYearChange(currentYear + 100)} className="text-slate-400 hover:text-white"><ChevronRight /></button>
      </div>
    </div>
  );
};

export default Timeline;