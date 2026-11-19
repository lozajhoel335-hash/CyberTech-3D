import type {
  AppSection,
  CameraPresetConfig,
  CameraPresetId,
  ComponentInfo,
  DeviceModelType,
  FaultCase,
  QuizQuestion,
} from '../types/hardware';

export function filterComponents(
  items: ComponentInfo[],
  query: string,
): ComponentInfo[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.shortLabel.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized),
  );
}

export function getNextComponentId(
  items: ComponentInfo[],
  currentId: string | null,
  direction: 1 | -1,
): string | null {
  if (items.length === 0) return null;
  if (!currentId) return items[0].id;
  const idx = items.findIndex((item) => item.id === currentId);
  if (idx === -1) return items[0].id;
  const nextIdx = (idx + direction + items.length) % items.length;
  return items[nextIdx].id;
}

export function computeExplodedPosition(
  base: [number, number, number],
  offset: [number, number, number],
  progress: number,
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, progress));
  return [
    base[0] + offset[0] * clamped,
    base[1] + offset[1] * clamped,
    base[2] + offset[2] * clamped,
  ];
}

export function getCameraPresetTransform(
  modelType: DeviceModelType,
  presetId: CameraPresetId,
): CameraPresetConfig {
  const distances: Record<DeviceModelType, number> = {
    desktop: 6.4,
    motherboard: 5.1,
    laptop: 4.9,
    phone: 5.1,
  };
  const targets: Record<DeviceModelType, [number, number, number]> = {
    desktop: [0, 0.12, 0],
    motherboard: [0, 0, 0],
    laptop: [0, 0.42, 0],
    phone: [0, 0, 0],
  };

  const d = distances[modelType];
  const target = targets[modelType];

  switch (presetId) {
    case 'front':
      return {
        id: 'front',
        label: 'Vista frontal',
        position: [0, target[1] + 0.15, d],
        target,
      };
    case 'back':
      return {
        id: 'back',
        label: 'Vista posterior',
        position: [0, target[1] + 0.15, -d],
        target,
      };
    case 'left':
      return {
        id: 'left',
        label: 'Vista lateral izquierda',
        position: [-d, target[1] + 0.15, 0],
        target,
      };
    case 'right':
      return {
        id: 'right',
        label: 'Vista lateral derecha',
        position: [d, target[1] + 0.15, 0],
        target,
      };
    case 'top':
      return {
        id: 'top',
        label: 'Vista superior',
        position: [0, d + target[1], 0.05],
        target,
      };
    case 'bottom':
      return {
        id: 'bottom',
        label: 'Vista inferior',
        position: [0, -d + target[1], 0.05],
        target,
      };
    case 'default':
    default:
      if (modelType === 'motherboard') {
        return {
          id: 'default',
          label: 'Vista isométrica',
          position: [0.35, 3.85, 3.45],
          target,
        };
      }
      if (modelType === 'phone') {
        return {
          id: 'default',
          label: 'Vista isométrica',
          position: [3.35, 1.55, 4.15],
          target,
        };
      }
      return {
        id: 'default',
        label: 'Vista isométrica',
        position: [d * 0.72, d * 0.42, d * 0.72],
        target,
      };
  }
}

export function computeQuizScore(
  questions: QuizQuestion[],
  answers: Record<string, number>,
): {
  answeredCount: number;
  correctCount: number;
  totalCount: number;
  percentage: number;
  passed: boolean;
} {
  const totalCount = questions.length;
  let answeredCount = 0;
  let correctCount = 0;

  for (const q of questions) {
    const selected = answers[q.id];
    if (typeof selected === 'number') {
      answeredCount += 1;
      if (selected === q.correctIndex) {
        correctCount += 1;
      }
    }
  }

  const percentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    answeredCount,
    correctCount,
    totalCount,
    percentage,
    passed: percentage >= 70,
  };
}

export function toggleChecklistStep(
  completed: Record<string, boolean>,
  key: string,
): Record<string, boolean> {
  return {
    ...completed,
    [key]: !completed[key],
  };
}

export function evaluateFaultDiagnosis(
  faultCase: FaultCase,
  optionId: string,
): {
  isCorrect: boolean;
  feedback: string;
} {
  const found = faultCase.options.find((opt) => opt.id === optionId);
  if (!found) {
    return {
      isCorrect: false,
      feedback: 'Selecciona una opción de diagnóstico válida.',
    };
  }
  return {
    isCorrect: found.isCorrect,
    feedback: found.feedback,
  };
}

export function parseInitialViewFromSearch(search: string): AppSection {
  const params = new URLSearchParams(search);
  const vista = params.get('vista');
  const validSections: AppSection[] = [
    'home',
    'desktop',
    'motherboard',
    'laptop',
    'phone',
    'workshop',
    'education',
  ];
  if (vista && validSections.includes(vista as AppSection)) {
    return vista as AppSection;
  }
  if (params.get('autostart') === '1') {
    return 'desktop';
  }
  return 'home';
}
