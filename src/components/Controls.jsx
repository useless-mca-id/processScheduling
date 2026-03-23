import { motion } from 'framer-motion';

export default function Controls({
  isRunning, isPaused, isComplete, stepMode, speed, currentTime, totalDuration,
  onStart, onPause, onResume, onReset, onStep, onSpeedChange, onStepModeChange,
  processCount,
}) {
  const canStart = processCount > 0 && !isRunning;
  const progress = totalDuration > 0 ? Math.min(((currentTime + 1) / totalDuration) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {totalDuration > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-[var(--color-text-low)] mb-1.5 font-mono">
            <span>t = {Math.max(0, currentTime)}</span>
            <span>{totalDuration} units</span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--color-primary-variant), var(--color-primary))' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex gap-2">
        {!isRunning && !isPaused ? (
          <button
            id="start-btn"
            onClick={onStart}
            disabled={!canStart}
            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/85 text-[var(--color-on-primary)] font-bold text-sm rounded-xl py-2.5 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[var(--color-primary)]/20"
          >
            ▶ Start
          </button>
        ) : isRunning ? (
          <button
            id="pause-btn"
            onClick={onPause}
            className="flex-1 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/85 text-[var(--color-on-secondary)] font-bold text-sm rounded-xl py-2.5 transition-all cursor-pointer shadow-lg shadow-[var(--color-secondary)]/20"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            id="resume-btn"
            onClick={onResume}
            disabled={isComplete}
            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/85 text-[var(--color-on-primary)] font-bold text-sm rounded-xl py-2.5 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[var(--color-primary)]/20"
          >
            ▶ Resume
          </button>
        )}
        <button
          id="reset-btn"
          onClick={onReset}
          className="bg-[var(--color-surface-3)] hover:bg-[var(--color-surface-4)] text-[var(--color-text-high)] font-medium text-sm rounded-xl px-4 py-2.5 transition-all border border-[var(--color-border-light)] cursor-pointer"
        >
          ↺ Reset
        </button>
      </div>

      {/* Step Mode */}
      <div className="flex items-center justify-between bg-[var(--color-surface-2)] rounded-xl px-3.5 py-3 border border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-text-med)]">Step Mode</span>
        <div className="flex items-center gap-2">
          <button
            id="step-mode-toggle"
            onClick={() => onStepModeChange(!stepMode)}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${stepMode ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-4)]'}`}
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
              animate={{ left: stepMode ? '22px' : '2px' }}
              transition={{ duration: 0.2 }}
            />
          </button>
          {stepMode && (
            <motion.button
              id="step-btn"
              onClick={onStep}
              disabled={isComplete}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--color-primary-variant)] hover:bg-[var(--color-primary-variant)]/80 text-white font-semibold text-xs rounded-lg px-3 py-1.5 transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              Step →
            </motion.button>
          )}
        </div>
      </div>

      {/* Speed Control */}
      <div className="bg-[var(--color-surface-2)] rounded-xl px-3.5 py-3 border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--color-text-med)]">Speed</span>
          <span className="text-xs font-mono text-[var(--color-primary)] font-bold">{speed}x</span>
        </div>
        <input
          id="speed-slider"
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-[var(--color-text-low)] mt-1">
          <span>0.5x</span>
          <span>5x</span>
        </div>
      </div>
    </div>
  );
}
