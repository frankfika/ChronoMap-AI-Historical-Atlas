import React, { useState, useEffect, useCallback } from 'react';
import { fetchHistoricalData } from './services/geminiService';
import WorldMap from './components/WorldMap';
import Timeline from './components/Timeline';
import InfoPanel from './components/InfoPanel';
import { HistoricalData, Empire, HistoricalEvent } from './types';

const App: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(100); // Default to 100 CE (Peak Rome)
  const [data, setData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEmpire, setSelectedEmpire] = useState<Empire | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);

  // Debounce logic to avoid spamming API while sliding
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(currentYear);
    }, 600); // Wait 600ms after last change before fetching

    return () => clearTimeout(timer);
  }, [currentYear]);

  const loadData = async (year: number) => {
    setLoading(true);
    setSelectedEmpire(null);
    setSelectedEvent(null);
    
    const result = await fetchHistoricalData(year);
    
    // Ensure the result matches the requested year (in case of race conditions)
    if (result.year === year) {
      setData(result);
    }
    setLoading(false);
  };

  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar Information */}
      <div className="hidden md:block absolute left-0 top-0 h-full z-10 pointer-events-none">
          {/* Wrap InfoPanel in a pointer-events-auto div so interactions work, but layout doesn't block map */}
          <div className="pointer-events-auto h-full">
            <InfoPanel 
                data={data} 
                selectedEmpire={selectedEmpire}
                selectedEvent={selectedEvent}
                onCloseSelection={() => {
                    setSelectedEmpire(null);
                    setSelectedEvent(null);
                }}
            />
          </div>
      </div>

      {/* Map Area */}
      <main className="flex-1 relative w-full h-full">
        <WorldMap 
            data={data} 
            onSelectEmpire={setSelectedEmpire}
            onSelectEvent={setSelectedEvent}
            isLoading={loading}
        />
      </main>

      {/* Mobile Drawer / Bottom Info (Simplified for mobile) */}
      <div className="md:hidden absolute top-4 left-4 z-10">
         {/* In a real app, would handle mobile drawer logic here. For now, let's rely on the map visuals */}
      </div>

      {/* Timeline Controls */}
      <Timeline 
        currentYear={currentYear} 
        onYearChange={handleYearChange} 
      />
      
    </div>
  );
};

export default App;
