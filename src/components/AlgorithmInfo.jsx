import { motion } from 'framer-motion';
import { ALGORITHMS } from '../algorithms/schedulers';

export default function AlgorithmInfo({ algorithm }) {
  const algo = ALGORITHMS[algorithm];
  if (!algo) return null;

  const queueInfo = {
    fcfs: { icon: '📋', traits: ['Non-preemptive', 'Convoy Effect', 'Simple'] },
    sjf: { icon: '⚡', traits: ['Non-preemptive', 'Optimal Avg WT', 'Starvation Risk'] },
    srtf: { icon: '🔄', traits: ['Preemptive', 'Optimal', 'High Overhead'] },
    priority: { icon: '🏆', traits: ['Non-preemptive', 'Priority Based', 'Starvation Risk'] },
    rr: { icon: '🔁', traits: ['Preemptive', 'Time Quantum', 'Fair Sharing'] },
    mlq: { icon: '📊', traits: ['Multi-level', 'Queue Classification', 'Priority Queues'] },
  };

  const info = queueInfo[algorithm] || { icon: '⚙️', traits: [] };

  return (
    <motion.div
      key={algorithm}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface-1)] rounded-2xl p-5 border border-[var(--color-border-light)] shadow-xl shadow-black/20"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{info.icon}</span>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-high)]">{algo.fullName}</h3>
          <span className="text-[10px] text-[var(--color-primary)] font-mono font-bold">{algo.name}</span>
        </div>
      </div>
      <p className="text-xs text-[var(--color-text-med)] leading-relaxed mb-3">{algo.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {info.traits.map(trait => (
          <span
            key={trait}
            className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 font-medium"
          >
            {trait}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
