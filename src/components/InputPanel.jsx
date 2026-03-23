import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGORITHMS } from '../algorithms/schedulers';
import { getProcessColor } from '../utils/colors';

export default function InputPanel({
  processes, algorithm, timeQuantum, onAddProcess, onRemoveProcess,
  onAlgorithmChange, onTimeQuantumChange, onGenerateRandom, onClearAll,
  isRunning,
}) {
  const [arrivalTime, setArrivalTime] = useState(0);
  const [burstTime, setBurstTime] = useState(1);
  const [priority, setPriority] = useState(1);

  const nextId = `P${processes.length + 1}`;

  const handleAdd = () => {
    if (burstTime < 1) return;
    onAddProcess({
      id: nextId,
      arrivalTime: parseInt(arrivalTime) || 0,
      burstTime: parseInt(burstTime) || 1,
      priority: parseInt(priority) || 1,
    });
    setArrivalTime(0);
    setBurstTime(1);
    setPriority(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const inputClass = "w-full bg-[var(--color-surface-3)] border border-[var(--color-border-light)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-high)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/50 transition disabled:opacity-40";

  return (
    <div className="flex flex-col gap-4">
      {/* Algorithm Selector */}
      <div>
        <label className="block text-[10px] font-semibold text-[var(--color-text-low)] uppercase tracking-widest mb-2">
          Algorithm
        </label>
        <select
          id="algorithm-select"
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
          disabled={isRunning}
          className={inputClass}
        >
          {Object.entries(ALGORITHMS).map(([key, algo]) => (
            <option key={key} value={key}>{algo.name} — {algo.fullName}</option>
          ))}
        </select>
      </div>

      {/* Time Quantum (for RR/MLQ) */}
      <AnimatePresence>
        {(algorithm === 'rr' || algorithm === 'mlq') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-[10px] font-semibold text-[var(--color-text-low)] uppercase tracking-widest mb-2">
              Time Quantum
            </label>
            <input
              id="time-quantum-input"
              type="number"
              min="1"
              max="10"
              value={timeQuantum}
              onChange={(e) => onTimeQuantumChange(parseInt(e.target.value) || 1)}
              disabled={isRunning}
              className={inputClass}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Fields */}
      <div className="space-y-2">
        <label className="block text-[10px] font-semibold text-[var(--color-text-low)] uppercase tracking-widest">
          Add Process
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[9px] text-[var(--color-text-low)] block mb-1">PID</span>
            <div className="bg-[var(--color-surface-3)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-primary)] font-bold text-center border border-[var(--color-border-light)]">
              {nextId}
            </div>
          </div>
          <div>
            <span className="text-[9px] text-[var(--color-text-low)] block mb-1">Arrival</span>
            <input
              id="arrival-time-input"
              type="number" min="0"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              className={inputClass + " text-center"}
            />
          </div>
          <div>
            <span className="text-[9px] text-[var(--color-text-low)] block mb-1">Burst</span>
            <input
              id="burst-time-input"
              type="number" min="1"
              value={burstTime}
              onChange={(e) => setBurstTime(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              className={inputClass + " text-center"}
            />
          </div>
        </div>

        {/* Priority field */}
        <div>
          <span className="text-[9px] text-[var(--color-text-low)] block mb-1">Priority (1 = highest)</span>
          <input
            id="priority-input"
            type="number" min="1" max="10"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            className={inputClass + " text-center"}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          id="add-process-btn"
          onClick={handleAdd}
          disabled={isRunning}
          className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/85 text-[var(--color-on-primary)] font-bold text-sm rounded-xl py-2.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[var(--color-primary)]/15"
        >
          + Add Process
        </button>
        <button
          id="random-btn"
          onClick={() => onGenerateRandom(5)}
          disabled={isRunning}
          className="flex-1 bg-[var(--color-surface-3)] hover:bg-[var(--color-surface-4)] text-[var(--color-text-high)] font-medium text-sm rounded-xl py-2.5 transition-all border border-[var(--color-border-light)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          🎲 Random
        </button>
      </div>

      {/* Process Table */}
      {processes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-[var(--color-text-low)] uppercase tracking-widest">
              Processes ({processes.length})
            </span>
            <button
              id="clear-all-btn"
              onClick={onClearAll}
              disabled={isRunning}
              className="text-[10px] text-[var(--color-error)] hover:text-[var(--color-error)]/80 transition disabled:opacity-40 cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {processes.map((proc, idx) => {
                const color = getProcessColor(idx);
                return (
                  <motion.div
                    key={proc.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 bg-[var(--color-surface-3)] rounded-xl px-3 py-2 text-xs border border-[var(--color-border)]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color.bg }}
                    />
                    <span className="font-bold text-[var(--color-text-high)] w-8">{proc.id}</span>
                    <span className="text-[var(--color-text-med)]">AT:{proc.arrivalTime}</span>
                    <span className="text-[var(--color-text-med)]">BT:{proc.burstTime}</span>
                    <span className="text-[var(--color-text-med)]">Pri:{proc.priority}</span>
                    <button
                      onClick={() => onRemoveProcess(proc.id)}
                      disabled={isRunning}
                      className="ml-auto text-[var(--color-text-low)] hover:text-[var(--color-error)] transition disabled:opacity-40 cursor-pointer"
                    >
                      ✕
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
