import { motion } from 'framer-motion';
import { getProcessColor, getProcessBg } from '../utils/colors';

export default function GanttChart({ timeline, processes, currentTime, totalDuration }) {
  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[var(--color-text-low)] text-sm">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-30">📊</div>
          <p>Add processes and start the simulation to see the Gantt chart</p>
        </div>
      </div>
    );
  }

  const processIndexMap = {};
  processes.forEach((p, i) => { processIndexMap[p.id] = i; });

  const UNIT_WIDTH = 56;
  const chartWidth = totalDuration * UNIT_WIDTH;

  return (
    <div className="space-y-3">
      {/* Gantt Bars */}
      <div className="gantt-scroll overflow-x-auto pb-2">
        <div style={{ width: `${chartWidth + 40}px`, minWidth: '100%' }} className="relative">
          {/* Main bar track */}
          <div className="relative h-16 bg-[var(--color-surface-2)] rounded-xl overflow-hidden border border-[var(--color-border-light)]">
            {/* Current time indicator */}
            {currentTime >= 0 && (
              <motion.div
                className="absolute top-0 bottom-0 w-0.5 z-20"
                style={{ left: `${(currentTime + 1) * UNIT_WIDTH}px`, background: 'var(--color-primary)' }}
                initial={false}
                animate={{ left: `${(currentTime + 1) * UNIT_WIDTH}px` }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Blocks */}
            {timeline.map((entry, idx) => {
              const isIdle = entry.processId === 'idle';
              const pIdx = processIndexMap[entry.processId] ?? -1;
              const color = isIdle ? null : getProcessColor(pIdx);
              const width = (entry.endTime - entry.startTime) * UNIT_WIDTH;
              const left = entry.startTime * UNIT_WIDTH;
              const isActive = currentTime >= entry.startTime && currentTime < entry.endTime;
              const isPast = currentTime >= entry.endTime;
              const isVisible = currentTime >= entry.startTime;

              if (isIdle) {
                return (
                  <motion.div
                    key={`idle-${idx}`}
                    className="absolute top-2 bottom-2 rounded-lg border border-dashed border-[var(--color-border-light)] flex items-center justify-center"
                    style={{ left: `${left}px`, width: `${width}px` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isVisible ? 0.4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-[10px] text-[var(--color-text-low)]">idle</span>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={`${entry.processId}-${entry.startTime}`}
                  className={`absolute top-2 bottom-2 rounded-lg flex items-center justify-center font-bold text-sm ${isActive ? 'glow-pulse z-10' : ''}`}
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                    backgroundColor: isVisible ? color.bg : 'transparent',
                    color: color.text,
                    boxShadow: isActive ? `0 0 24px ${getProcessBg(pIdx, 0.4)}` : undefined,
                  }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{
                    opacity: isVisible ? (isPast ? 0.65 : 1) : 0,
                    scaleX: isVisible ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {entry.processId}
                </motion.div>
              );
            })}
          </div>

          {/* Time markers */}
          <div className="relative h-6 mt-1">
            {Array.from({ length: totalDuration + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute text-[10px] text-[var(--color-text-low)] font-mono"
                style={{ left: `${i * UNIT_WIDTH}px`, transform: 'translateX(-50%)' }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Legend */}
      <div className="flex flex-wrap gap-3">
        {processes.map((proc, idx) => {
          const color = getProcessColor(idx);
          return (
            <div key={proc.id} className="flex items-center gap-1.5 text-xs text-[var(--color-text-med)]">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: color.bg }} />
              {proc.id}
            </div>
          );
        })}
      </div>
    </div>
  );
}
