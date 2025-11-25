export enum EventType {
  WAR = '战争',
  POLITICAL = '政治',
  CULTURAL = '文化',
  DISCOVERY = '探索',
  DISASTER = '灾害'
}

export interface HistoricalEvent {
  title: string; // In Chinese
  description: string; // In Chinese
  latitude: number;
  longitude: number;
  type: EventType;
}

export interface Empire {
  name: string; // In Chinese
  latitude: number;
  longitude: number;
  radiusKm: number; // Approximate sphere of influence
  color: string; // Hex code
  description: string; // In Chinese
}

export interface HistoricalData {
  year: number;
  eraSummary: string; // In Chinese
  empires: Empire[];
  events: HistoricalEvent[];
}

export interface MapState {
  transform: { k: number; x: number; y: number };
  selectedEvent: HistoricalEvent | null;
  selectedEmpire: Empire | null;
}