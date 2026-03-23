import { motion, AnimatePresence } from 'framer-motion';
import { getProcessColor } from '../utils/colors';

export default function ReadyQueue({ readyQueueState, processes }) {
  const { running, waiting } = readyQueueState;

  const processIndexMap = {};
  processes.forEach((p, i) => { processIndexMap[p.id] = i; });

  return (
    <div className="space-y-3">
      {/* Currently Running */}
      <div>
        <span className="text-[10px] font-semibold text-[var(--color-text-low)] uppercase tracking-widest block mb-2">
          ▶ Running
        </span>
        <AnimatePresence mode="wait">
          {running && running !== 'idle' ? (
            <motion.div
              key={running}
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 rounded-xl px-3 py-3 border-2 glow-pulse"
              style={{
                backgroundColor: `${getProcessColor(processIndexMap[running] ?? 0).bg}15`,
                borderColor: getProcessColor(processIndexMap[running] ?? 0).bg,
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg"
                style={{
                  backgroundColor: getProcessColor(processIndexMap[running] ?? 0).bg,
                  color: getProcessColor(processIndexMap[running] ?? 0).text,
                }}
              >
                {running}
              </div>
              <div className="text-xs text-[var(--color-text-med)]">
                <span className="text-[var(--color-secondary)]">●</span> Executing on CPU
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[var(--color-text-low)] bg-[var(--color-surface-2)] rounded-xl px-3 py-3.5 text-center border border-[var(--color-border)]"
            >
              CPU Idle
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Waiting Queue */}
      <div>
        <span className="text-[10px] font-semibold text-[var(--color-text-low)] uppercase tracking-widest block mb-2">
          ⏳ Waiting ({waiting.length})
        </span>
        <div className="space-y-1.5 min-h-[40px]">
          <AnimatePresence mode="popLayout">
            {waiting.length > 0 ? (
              waiting.map((pid, i) => {
                const color = getProcessColor(processIndexMap[pid] ?? 0);
                return (
                  <motion.div
                    key={pid}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="flex items-center gap-2 bg-[var(--color-surface-2)] rounded-xl px-3 py-2 border border-[var(--color-border)]"
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px]"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {pid}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-low)]">Waiting</span>
                    <div className="ml-auto flex gap-0.5">
                      {[0, 1, 2].map(d => (
                        <motion.div
                          key={d}
                          className="w-1 h-1 rounded-full bg-[var(--color-text-low)]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, delay: d * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-[var(--color-text-low)] text-center py-2"
              >
                Queue empty
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
