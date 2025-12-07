
export enum Trimester {
  Q1 = '1º Quadrimestre',
  Q2 = '2º Quadrimestre',
  Q3 = '3º Quadrimestre',
}

export interface MetricData {
  name: string;
  q1: number;
  q2: number;
  q3: number;
}

export interface MonthlyData {
  month: string;
  value: number;
}

export interface QuadrimestreData {
  id: string;
  label: string;
  total: number;
  data: MonthlyData[];
}

export enum TriageColor {
  Red = 'Vermelho',
  Orange = 'Laranja',
  Yellow = 'Amarelo',
  Green = 'Verde',
  Blue = 'Azul',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum GenerationModel {
  FlashLite = 'gemini-2.5-flash-lite-latest',
  Flash = 'gemini-2.5-flash',
  Pro = 'gemini-3-pro-preview',
  ProImage = 'gemini-3-pro-image-preview',
  FlashImage = 'gemini-2.5-flash-image',
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string; placeAnswerSources?: any };
}
