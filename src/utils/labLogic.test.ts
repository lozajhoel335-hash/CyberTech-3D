import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeExplodedPosition,
  computeQuizScore,
  evaluateFaultDiagnosis,
  filterComponents,
  getCameraPresetTransform,
  getNextComponentId,
  parseInitialViewFromSearch,
  toggleChecklistStep,
} from './labLogic';
import type { ComponentInfo, FaultCase, QuizQuestion } from '../types/hardware';

const sampleComponents: ComponentInfo[] = [
  {
    id: 'cpu',
    name: 'Procesador CPU',
    shortLabel: 'CPU',
    category: 'Cómputo',
    accentColor: '#38BDF8',
    whatIs: 'Unidad central de procesamiento.',
    purpose: 'Ejecutar instrucciones.',
    howItWorks: 'Ciclo de instrucción.',
    location: 'Socket.',
    cleaning: 'Alcohol isopropílico.',
    maintenance: 'Pasta térmica.',
    installation: 'Alinear muesca.',
    replacement: 'Levantar palanca.',
    toolsRequired: ['Pasta térmica'],
    safetyWarnings: ['No doblar pines'],
  },
  {
    id: 'ram',
    name: 'Memoria RAM',
    shortLabel: 'RAM',
    category: 'Memoria',
    accentColor: '#60A5FA',
    whatIs: 'Memoria de acceso aleatorio.',
    purpose: 'Almacenamiento temporal.',
    howItWorks: 'Celdas volátiles.',
    location: 'Ranuras DIMM.',
    cleaning: 'Brocha antiestática.',
    maintenance: 'Limpiar contactos.',
    installation: 'Presionar hasta clic.',
    replacement: 'Abrir pestillos.',
    toolsRequired: ['Pulsera antiestática'],
    safetyWarnings: ['Descargar estática'],
  },
];

test('filterComponents filters by name or category case-insensitively', () => {
  assert.equal(filterComponents(sampleComponents, '').length, 2);
  assert.equal(filterComponents(sampleComponents, 'cpu').length, 1);
  assert.equal(filterComponents(sampleComponents, 'memoria').length, 1);
  assert.equal(filterComponents(sampleComponents, 'inexistente').length, 0);
});

test('getNextComponentId wraps around cleanly in both directions', () => {
  assert.equal(getNextComponentId(sampleComponents, null, 1), 'cpu');
  assert.equal(getNextComponentId(sampleComponents, 'cpu', 1), 'ram');
  assert.equal(getNextComponentId(sampleComponents, 'ram', 1), 'cpu');
  assert.equal(getNextComponentId(sampleComponents, 'cpu', -1), 'ram');
});

test('computeExplodedPosition interpolates clamped between 0 and 1', () => {
  assert.deepEqual(computeExplodedPosition([1, 2, 3], [2, 0, -4], 0), [1, 2, 3]);
  assert.deepEqual(computeExplodedPosition([1, 2, 3], [2, 0, -4], 0.5), [2, 2, 1]);
  assert.deepEqual(computeExplodedPosition([1, 2, 3], [2, 0, -4], 1.5), [3, 2, -1]);
});

test('getCameraPresetTransform returns expected view axes', () => {
  const front = getCameraPresetTransform('desktop', 'front');
  assert.ok(front.position[2] > 0);
  const back = getCameraPresetTransform('desktop', 'back');
  assert.ok(back.position[2] < 0);
  const left = getCameraPresetTransform('desktop', 'left');
  assert.ok(left.position[0] < 0);
  const top = getCameraPresetTransform('desktop', 'top');
  assert.ok(top.position[1] > 0);
});

test('computeQuizScore computes counts, percentage, and pass threshold', () => {
  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      topic: 'Seguridad',
      question: '¿Qué usar contra la estática?',
      options: ['Pulsera antiestática', 'Imán'],
      correctIndex: 0,
      explanation: 'La pulsera descarga la estática.',
    },
    {
      id: 'q2',
      topic: 'Hardware',
      question: '¿Qué conecta almacenamiento SATA?',
      options: ['HDMI', 'Cable SATA'],
      correctIndex: 1,
      explanation: 'SATA transmite datos al disco.',
    },
  ];
  const fullPass = computeQuizScore(questions, { q1: 0, q2: 1 });
  assert.equal(fullPass.correctCount, 2);
  assert.equal(fullPass.percentage, 100);
  assert.equal(fullPass.passed, true);

  const halfFail = computeQuizScore(questions, { q1: 0, q2: 0 });
  assert.equal(halfFail.correctCount, 1);
  assert.equal(halfFail.percentage, 50);
  assert.equal(halfFail.passed, false);
});

test('toggleChecklistStep and evaluateFaultDiagnosis behave deterministically', () => {
  const step1 = toggleChecklistStep({}, 'step-1');
  assert.equal(step1['step-1'], true);
  const step2 = toggleChecklistStep(step1, 'step-1');
  assert.equal(step2['step-1'], false);

  const fault: FaultCase = {
    id: 'f1',
    device: 'PC',
    symptom: 'Apagado por temperatura',
    context: 'Ventilador sucio',
    options: [
      { id: 'a', label: 'Cambiar pasta térmica y limpiar disipador', isCorrect: true, feedback: 'Correcto.' },
      { id: 'b', label: 'Cambiar monitor', isCorrect: false, feedback: 'Incorrecto.' },
    ],
    solutionSteps: ['Limpiar'],
  };
  assert.equal(evaluateFaultDiagnosis(fault, 'a').isCorrect, true);
  assert.equal(evaluateFaultDiagnosis(fault, 'b').isCorrect, false);
});

test('parseInitialViewFromSearch parses vista and autostart parameters', () => {
  assert.equal(parseInitialViewFromSearch(''), 'home');
  assert.equal(parseInitialViewFromSearch('?autostart=1'), 'desktop');
  assert.equal(parseInitialViewFromSearch('?vista=motherboard'), 'motherboard');
  assert.equal(parseInitialViewFromSearch('?vista=phone'), 'phone');
  assert.equal(parseInitialViewFromSearch('?vista=invalid'), 'home');
});
