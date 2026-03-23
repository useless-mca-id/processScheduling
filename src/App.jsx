import { useMemo } from 'react';
import { motion } from 'framer-motion';
import useSimulation from './hooks/useSimulation';
import InputPanel from './components/InputPanel';
import GanttChart from './components/GanttChart';
import ReadyQueue from './components/ReadyQueue';
import MetricsTable from './components/MetricsTable';
import Controls from './components/Controls';
import AlgorithmInfo from './components/AlgorithmInfo';

export default function App() {
  const sim = useSimulation();
  const readyQueueState = sim.readyQueue();

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-[var(--color-border-light)] bg-[var(--color-surface-1)]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-variant)] flex items-center justify-center text-[var(--color-on-primary)] font-black text-xs shadow-lg shadow-[var(--color-primary)]/20">
              CPU
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--color-on-bg)] tracking-tight">
                CPU Scheduling Simulator
              </h1>
              <p className="text-[10px] text-[var(--color-text-low)]">
                Interactive algorithm visualization & analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sim.isRunning && (
              <motion.div
                className="flex items-center gap-1.5 text-xs text-[var(--color-secondary)]"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
                Running
              </motion.div>
            )}
            {sim.isComplete && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-secondary)]">
                <span>✓</span> Complete
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-[1600px] mx-auto px-5 py-5">
        <div className="flex gap-5 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
            {/* Input Panel Card */}
            <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-light)] p-5 shadow-xl shadow-black/20">
              <h2 className="text-[11px] font-bold text-[var(--color-text-med)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                Configuration
              </h2>
              <InputPanel
                processes={sim.processes}
                algorithm={sim.algorithm}
                timeQuantum={sim.timeQuantum}
                onAddProcess={sim.addProcess}
                onRemoveProcess={sim.removeProcess}
                onAlgorithmChange={(a) => { sim.reset(); sim.setAlgorithm(a); }}
                onTimeQuantumChange={sim.setTimeQuantum}
                onGenerateRandom={sim.generateRandom}
                onClearAll={sim.clearProcesses}
                isRunning={sim.isRunning}
              />
            </div>

            {/* Controls Card */}
            <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-light)] p-5 shadow-xl shadow-black/20">
              <h2 className="text-[11px] font-bold text-[var(--color-text-med)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
                Controls
              </h2>
              <Controls
                isRunning={sim.isRunning}
                isPaused={sim.isPaused}
                isComplete={sim.isComplete}
                stepMode={sim.stepMode}
                speed={sim.speed}
                currentTime={sim.currentTime}
                totalDuration={sim.totalDuration}
                onStart={sim.start}
                onPause={sim.pause}
                onResume={sim.resume}
                onReset={sim.reset}
                onStep={sim.step}
                onSpeedChange={sim.setSpeed}
                onStepModeChange={sim.setStepMode}
                processCount={sim.processes.length}
              />
            </div>

            {/* Algorithm Info Card */}
            <AlgorithmInfo algorithm={sim.algorithm} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-4 min-w-0">
            {/* Gantt Chart Card */}
            <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-light)] p-5 shadow-xl shadow-black/20">
              <h2 className="text-[11px] font-bold text-[var(--color-text-med)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                Gantt Chart Timeline
              </h2>
              <GanttChart
                timeline={sim.timeline}
                processes={sim.processes}
                currentTime={sim.currentTime}
                totalDuration={sim.totalDuration}
              />
            </div>

            {/* Bottom Row: Ready Queue + Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ready Queue */}
              <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-light)] p-5 shadow-xl shadow-black/20">
                <h2 className="text-[11px] font-bold text-[var(--color-text-med)] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)]" />
                  Ready Queue
                </h2>
                <ReadyQueue
                  readyQueueState={readyQueueState}
                  processes={sim.processes}
                />
              </div>

              {/* Metrics Table */}
              <div className="md:col-span-2 bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-light)] p-5 shadow-xl shadow-black/20">
                <h2 className="text-[11px] font-bold text-[var(--color-text-med)] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
                  Performance Metrics
                </h2>
                <MetricsTable
                  metrics={sim.metrics}
                  processes={sim.processes}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
