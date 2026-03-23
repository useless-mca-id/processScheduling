import { motion } from 'framer-motion';
import { getProcessColor } from '../utils/colors';

export default function MetricsTable({ metrics, processes }) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-text-low)] text-sm">
        Run a simulation to see metrics
      </div>
    );
  }

  const processIndexMap = {};
  processes.forEach((p, i) => { processIndexMap[p.id] = i; });

  const avgTAT = metrics.reduce((s, m) => s + m.turnaroundTime, 0) / metrics.length;
  const avgWT = metrics.reduce((s, m) => s + m.waitingTime, 0) / metrics.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-[var(--color-text-low)] border-b border-[var(--color-border-light)]">
            <th className="py-2.5 px-2 text-left">PID</th>
            <th className="py-2.5 px-2 text-center">AT</th>
            <th className="py-2.5 px-2 text-center">BT</th>
            <th className="py-2.5 px-2 text-center">CT</th>
            <th className="py-2.5 px-2 text-center">TAT</th>
            <th className="py-2.5 px-2 text-center">WT</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, idx) => {
            const color = getProcessColor(processIndexMap[m.id] ?? idx);
            return (
              <motion.tr
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-3)]/50 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.bg }} />
                    <span className="font-bold text-[var(--color-text-high)]">{m.id}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center text-[var(--color-text-med)]">{m.arrivalTime}</td>
                <td className="py-3 px-2 text-center text-[var(--color-text-med)]">{m.burstTime}</td>
                <td className="py-3 px-2 text-center text-[var(--color-text-high)] font-semibold">{m.completionTime}</td>
                <td className="py-3 px-2 text-center text-[var(--color-primary)] font-semibold">{m.turnaroundTime}</td>
                <td className="py-3 px-2 text-center text-[var(--color-secondary)] font-semibold">{m.waitingTime}</td>
              </motion.tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="text-xs font-bold border-t-2 border-[var(--color-surface-4)]">
            <td colSpan="4" className="py-3 px-2 text-right text-[var(--color-text-low)]">Averages →</td>
            <td className="py-3 px-2 text-center text-[var(--color-primary)]">{avgTAT.toFixed(2)}</td>
            <td className="py-3 px-2 text-center text-[var(--color-secondary)]">{avgWT.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
