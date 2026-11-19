export type AppSection =
  | 'home'
  | 'desktop'
  | 'motherboard'
  | 'laptop'
  | 'phone'
  | 'workshop'
  | 'education';

export type DeviceModelType = 'desktop' | 'motherboard' | 'laptop' | 'phone';

export type CameraPresetId =
  | 'default'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom';

export interface CameraPresetConfig {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface ComponentInfo {
  id: string;
  name: string;
  shortLabel: string;
  category: string;
  accentColor: string;
  whatIs: string;
  purpose: string;
  howItWorks: string;
  location: string;
  cleaning: string;
  maintenance: string;
  installation: string;
  replacement: string;
  toolsRequired: string[];
  safetyWarnings: string[];
  deepDiveSection?: AppSection;
  maintenanceSteps?: string[];
}

export interface ToolInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  usage: string;
  precaution: string;
}

export interface TutorialInfo {
  id: string;
  title: string;
  device: 'PC de Escritorio' | 'Teléfono Celular';
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  duration: string;
  summary: string;
  tools: string[];
  safetyWarnings: string[];
  steps: {
    title: string;
    detail: string;
  }[];
}

export interface LearningTopic {
  id: string;
  number: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  practicalTip: string;
}

export interface FaultCase {
  id: string;
  device: string;
  symptom: string;
  context: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  solutionSteps: string[];
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
