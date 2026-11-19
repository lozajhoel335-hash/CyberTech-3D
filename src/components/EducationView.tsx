import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  faultCases,
  learningTopics,
  quizQuestions,
} from '../data/educationData';
import { computeQuizScore, evaluateFaultDiagnosis } from '../utils/labLogic';

type EducationTab = 'topics' | 'diagnosis' | 'quiz';

export default function EducationView() {
  const [activeTab, setActiveTab] = useState<EducationTab>('topics');
  const [selectedTopicId, setSelectedTopicId] = useState(learningTopics[0].id);
  const [faultSelections, setFaultSelections] = useState<Record<string, string>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const selectedTopic =
    learningTopics.find((t) => t.id === selectedTopicId) ?? learningTopics[0];
  const quizStats = computeQuizScore(quizQuestions, quizAnswers);

  return (
    <div className="flex-1 overflow-y-auto bg-[#070B14] px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Mode Switch */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xs font-medium text-sky-400">
              Formación técnica y secundaria
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">
              Modo Educativo y Evaluaciones
            </h1>
          </div>

          <div
            role="tablist"
            aria-label="Secciones del modo educativo"
            className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0B1222] border border-slate-800"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'topics'}
              onClick={() => setActiveTab('topics')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Lecciones ({learningTopics.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'diagnosis'}
              onClick={() => setActiveTab('diagnosis')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'diagnosis'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Diagnóstico de fallas ({faultCases.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'quiz'}
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Evaluación ({quizQuestions.length})</span>
            </button>
          </div>
        </header>

        {/* Tab 1: Learning Topics */}
        {activeTab === 'topics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-2">
              {learningTopics.map((topic) => {
                const isSel = topic.id === selectedTopic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-colors cursor-pointer ${
                      isSel
                        ? 'bg-[#0E182D] border-blue-500/80 text-white'
                        : 'bg-[#0B1222] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-sky-400">
                      <span className="font-mono-tech">{topic.number}</span>
                      <span aria-hidden="true">·</span>
                      <span>{topic.category}</span>
                    </div>
                    <h2 className="font-display font-semibold text-sm sm:text-base mt-1">
                      {topic.title}
                    </h2>
                  </button>
                );
              })}
            </div>

            <article className="lg:col-span-8 rounded-2xl bg-[#0B1222] border border-slate-800 p-6 space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                  <span>Módulo {selectedTopic.number}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedTopic.category}</span>
                </div>
                <h2 className="font-display font-bold text-2xl text-white">
                  {selectedTopic.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed pt-1">
                  {selectedTopic.summary}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-sky-400">
                  Puntos clave del tema
                </h3>
                <ul className="space-y-2.5">
                  {selectedTopic.keyPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-sm text-slate-200"
                    >
                      <span className="w-6 h-6 rounded-md bg-blue-600/20 text-sky-300 font-mono-tech text-xs font-semibold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/35 border border-blue-500/35 space-y-1">
                <h3 className="text-xs font-semibold text-sky-300">
                  Consejo práctico de taller
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedTopic.practicalTip}
                </p>
              </div>
            </article>
          </div>
        )}

        {/* Tab 2: Fault Diagnosis Simulator */}
        {activeTab === 'diagnosis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {faultCases.map((fc) => {
              const selectedOptId = faultSelections[fc.id];
              const evaluation = selectedOptId
                ? evaluateFaultDiagnosis(fc, selectedOptId)
                : null;

              return (
                <section
                  key={fc.id}
                  className="rounded-2xl bg-[#0B1222] border border-slate-800 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-sky-400 font-medium">
                      <span>{fc.device}</span>
                      <span>Caso práctico</span>
                    </div>
                    <h2 className="font-display font-semibold text-base text-white leading-snug">
                      {fc.symptom}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Contexto: {fc.context}
                    </p>

                    <div className="space-y-2 pt-1">
                      {fc.options.map((opt) => {
                        const isPicked = selectedOptId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setFaultSelections((prev) => ({
                                ...prev,
                                [fc.id]: opt.id,
                              }))
                            }
                            className={`w-full p-3 rounded-xl text-left text-xs border transition-colors cursor-pointer ${
                              isPicked
                                ? opt.isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-100'
                                  : 'bg-red-950/40 border-red-500/70 text-red-100'
                                : 'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-slate-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {evaluation && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        evaluation.isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                          : 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {evaluation.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span>
                          {evaluation.isCorrect
                            ? 'Diagnóstico correcto'
                            : 'Revisa este diagnóstico'}
                        </span>
                      </div>
                      <p className="leading-relaxed">{evaluation.feedback}</p>
                      {evaluation.isCorrect && (
                        <div className="pt-1.5 border-t border-emerald-500/20 space-y-1">
                          <p className="font-semibold text-emerald-300">
                            Solución recomendada:
                          </p>
                          <ol className="list-decimal list-inside space-y-0.5 text-emerald-100/90">
                            {fc.solutionSteps.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Tab 3: Knowledge Quiz */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            {/* Score & Action Header */}
            <div className="rounded-2xl bg-[#0B1222] border border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 text-sky-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    Cuestionario de Mantenimiento de Hardware
                  </h2>
                  <p className="text-xs text-slate-300 tabular-nums">
                    Respondidas: {quizStats.answeredCount} de {quizStats.totalCount}
                    {quizSubmitted && (
                      <>
                        {' · '}
                        Puntaje final: {quizStats.correctCount}/{quizStats.totalCount} (
                        {quizStats.percentage}%) —{' '}
                        {quizStats.passed ? 'Aprobado' : 'Requiere repaso'}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-500 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar prueba</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuizSubmitted(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Calificar evaluación
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quizQuestions.map((q, qIdx) => {
                const chosen = quizAnswers[q.id];
                const isCorrect = chosen === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-[#0B1222] border border-slate-800 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-sky-400">
                      <span>Pregunta {qIdx + 1}</span>
                      <span>{q.topic}</span>
                    </div>
                    <h3 className="font-display font-semibold text-sm sm:text-base text-white leading-snug">
                      {q.question}
                    </h3>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const selected = chosen === optIdx;
                        let styleClass =
                          'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-slate-600';
                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            styleClass =
                              'bg-emerald-950/40 border-emerald-500/70 text-emerald-100';
                          } else if (selected) {
                            styleClass =
                              'bg-red-950/40 border-red-500/70 text-red-100';
                          }
                        } else if (selected) {
                          styleClass =
                            'bg-blue-600/25 border-blue-500 text-white';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              if (quizSubmitted) return;
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [q.id]: optIdx,
                              }));
                            }}
                            className={`w-full p-3 rounded-xl text-left text-xs border transition-colors cursor-pointer ${styleClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                          isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                            : 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
