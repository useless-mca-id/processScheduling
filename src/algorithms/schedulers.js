/**
 * CPU Scheduling Algorithm Implementations
 * Each function returns a timeline: [{processId, startTime, endTime}]
 * and process metrics: [{id, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime}]
 */

// ─── FCFS ───────────────────────────────────────────────────
export function fcfs(processes) {
  const procs = processes.map(p => ({ ...p, remaining: p.burstTime }));
  procs.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  const timeline = [];
  let currentTime = 0;

  for (const proc of procs) {
    if (currentTime < proc.arrivalTime) {
      timeline.push({ processId: 'idle', startTime: currentTime, endTime: proc.arrivalTime });
      currentTime = proc.arrivalTime;
    }
    timeline.push({ processId: proc.id, startTime: currentTime, endTime: currentTime + proc.burstTime });
    currentTime += proc.burstTime;
  }

  return { timeline, metrics: computeMetrics(processes, timeline) };
}

// ─── SJF (Non-preemptive) ───────────────────────────────────
export function sjf(processes) {
  const procs = processes.map(p => ({ ...p, remaining: p.burstTime, done: false }));
  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    const ready = procs.filter(p => !p.done && p.arrivalTime <= currentTime);
    if (ready.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => !p.done).map(p => p.arrivalTime));
      timeline.push({ processId: 'idle', startTime: currentTime, endTime: nextArrival });
      currentTime = nextArrival;
      continue;
    }
    ready.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const chosen = ready[0];
    timeline.push({ processId: chosen.id, startTime: currentTime, endTime: currentTime + chosen.burstTime });
    currentTime += chosen.burstTime;
    chosen.done = true;
    completed++;
  }

  return { timeline, metrics: computeMetrics(processes, timeline) };
}

// ─── SRTF (Preemptive SJF) ─────────────────────────────────
export function srtf(processes) {
  const procs = processes.map(p => ({ ...p, remaining: p.burstTime }));
  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;
  const maxTime = Math.max(...procs.map(p => p.arrivalTime)) + procs.reduce((s, p) => s + p.burstTime, 0);

  while (completed < n && currentTime <= maxTime) {
    const ready = procs.filter(p => p.remaining > 0 && p.arrivalTime <= currentTime);
    if (ready.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => p.remaining > 0).map(p => p.arrivalTime));
      timeline.push({ processId: 'idle', startTime: currentTime, endTime: nextArrival });
      currentTime = nextArrival;
      continue;
    }
    ready.sort((a, b) => a.remaining - b.remaining || a.arrivalTime - b.arrivalTime);
    const chosen = ready[0];

    // Run for 1 time unit (preemptive)
    const lastEntry = timeline[timeline.length - 1];
    if (lastEntry && lastEntry.processId === chosen.id && lastEntry.endTime === currentTime) {
      lastEntry.endTime = currentTime + 1;
    } else {
      timeline.push({ processId: chosen.id, startTime: currentTime, endTime: currentTime + 1 });
    }
    chosen.remaining--;
    currentTime++;
    if (chosen.remaining === 0) completed++;
  }

  return { timeline, metrics: computeMetrics(processes, timeline) };
}

// ─── Priority Scheduling (Non-preemptive) ───────────────────
export function priorityScheduling(processes) {
  const procs = processes.map(p => ({ ...p, done: false }));
  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    const ready = procs.filter(p => !p.done && p.arrivalTime <= currentTime);
    if (ready.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => !p.done).map(p => p.arrivalTime));
      timeline.push({ processId: 'idle', startTime: currentTime, endTime: nextArrival });
      currentTime = nextArrival;
      continue;
    }
    // Lower priority number = higher priority
    ready.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const chosen = ready[0];
    timeline.push({ processId: chosen.id, startTime: currentTime, endTime: currentTime + chosen.burstTime });
    currentTime += chosen.burstTime;
    chosen.done = true;
    completed++;
  }

  return { timeline, metrics: computeMetrics(processes, timeline) };
}

// ─── Round Robin ────────────────────────────────────────────
export function roundRobin(processes, quantum = 2) {
  const procs = processes.map(p => ({ ...p, remaining: p.burstTime }));
  procs.sort((a, b) => a.arrivalTime - b.arrivalTime);
  const timeline = [];
  const queue = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;
  let idx = 0;

  // Add initially arrived processes
  while (idx < n && procs[idx].arrivalTime <= currentTime) {
    queue.push(procs[idx]);
    idx++;
  }

  while (completed < n) {
    if (queue.length === 0) {
      if (idx < n) {
        timeline.push({ processId: 'idle', startTime: currentTime, endTime: procs[idx].arrivalTime });
        currentTime = procs[idx].arrivalTime;
        while (idx < n && procs[idx].arrivalTime <= currentTime) {
          queue.push(procs[idx]);
          idx++;
        }
      } else break;
      continue;
    }

    const proc = queue.shift();
    const execTime = Math.min(quantum, proc.remaining);
    timeline.push({ processId: proc.id, startTime: currentTime, endTime: currentTime + execTime });
    currentTime += execTime;
    proc.remaining -= execTime;

    // Add newly arrived processes before re-enqueueing current
    while (idx < n && procs[idx].arrivalTime <= currentTime) {
      queue.push(procs[idx]);
      idx++;
    }

    if (proc.remaining > 0) {
      queue.push(proc);
    } else {
      completed++;
    }
  }

  return { timeline, metrics: computeMetrics(processes, timeline) };
}

// ─── Multilevel Queue ───────────────────────────────────────
// Queue 1 (System/High): priority 1-2, uses RR with quantum=2
// Queue 2 (Interactive/Med): priority 3-4, uses SJF
// Queue 3 (Batch/Low): priority 5+, uses FCFS
export function multilevelQueue(processes, quantum = 2) {
  const procs = processes.map(p => ({ ...p, remaining: p.burstTime }));

  // Classify into queues
  const q1 = procs.filter(p => p.priority <= 2).sort((a, b) => a.arrivalTime - b.arrivalTime);
  const q2 = procs.filter(p => p.priority >= 3 && p.priority <= 4).sort((a, b) => a.arrivalTime - b.arrivalTime);
  const q3 = procs.filter(p => p.priority >= 5).sort((a, b) => a.arrivalTime - b.arrivalTime);

  const timeline = [];
  let currentTime = 0;
  const maxTime = Math.max(...procs.map(p => p.arrivalTime)) + procs.reduce((s, p) => s + p.burstTime, 0);
  let completed = 0;
  const n = procs.length;

  // RR queue for Q1
  const rrQueue = [];
  let q1Idx = 0, q2Done = new Set(), q3Done = new Set();

  while (completed < n && currentTime <= maxTime) {
    // Enqueue Q1 arrivals
    while (q1Idx < q1.length && q1[q1Idx].arrivalTime <= currentTime) {
      rrQueue.push(q1[q1Idx]);
      q1Idx++;
    }

    // Q1: Round Robin (highest priority)
    if (rrQueue.length > 0) {
      const proc = rrQueue.shift();
      const execTime = Math.min(quantum, proc.remaining);
      const lastEntry = timeline[timeline.length - 1];
      if (lastEntry && lastEntry.processId === proc.id && lastEntry.endTime === currentTime) {
        lastEntry.endTime = currentTime + execTime;
      } else {
        timeline.push({ processId: proc.id, startTime: currentTime, endTime: currentTime + execTime });
      }
      currentTime += execTime;
      proc.remaining -= execTime;
      // Enqueue any new Q1 arrivals
      while (q1Idx < q1.length && q1[q1Idx].arrivalTime <= currentTime) {
        rrQueue.push(q1[q1Idx]);
        q1Idx++;
      }
      if (proc.remaining > 0) {
        rrQueue.push(proc);
      } else {
        completed++;
      }
      continue;
    }

    // Q2: SJF (non-preemptive)
    const readyQ2 = q2.filter(p => !q2Done.has(p.id) && p.arrivalTime <= currentTime);
    if (readyQ2.length > 0) {
      readyQ2.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
      const chosen = readyQ2[0];
      timeline.push({ processId: chosen.id, startTime: currentTime, endTime: currentTime + chosen.burstTime });
      currentTime += chosen.burstTime;
      chosen.remaining = 0;
      q2Done.add(chosen.id);
      completed++;
      continue;
    }

    // Q3: FCFS
    const readyQ3 = q3.filter(p => !q3Done.has(p.id) && p.arrivalTime <= currentTime);
    if (readyQ3.length > 0) {
      const chosen = readyQ3[0];
      timeline.push({ processId: chosen.id, startTime: currentTime, endTime: currentTime + chosen.burstTime });
      currentTime += chosen.burstTime;
      chosen.remaining = 0;
      q3Done.add(chosen.id);
      completed++;
      continue;
    }

    // No process ready — idle
    const allRemaining = procs.filter(p => p.remaining > 0);
    if (allRemaining.length === 0) break;
    const nextArrival = Math.min(...allRemaining.map(p => p.arrivalTime));
    if (nextArrival > currentTime) {
      timeline.push({ processId: 'idle', startTime: currentTime, endTime: nextArrival });
      currentTime = nextArrival;
    } else {
      currentTime++;
    }
  }

  return { timeline, metrics: computeMetrics(processes, timeline) };
}

// ─── Metrics Computation ────────────────────────────────────
function computeMetrics(processes, timeline) {
  return processes.map(proc => {
    const entries = timeline.filter(t => t.processId === proc.id);
    if (entries.length === 0) {
      return { ...proc, completionTime: 0, turnaroundTime: 0, waitingTime: 0 };
    }
    const completionTime = Math.max(...entries.map(e => e.endTime));
    const turnaroundTime = completionTime - proc.arrivalTime;
    const totalExec = entries.reduce((s, e) => s + (e.endTime - e.startTime), 0);
    const waitingTime = turnaroundTime - totalExec;
    return {
      ...proc,
      completionTime,
      turnaroundTime,
      waitingTime: Math.max(0, waitingTime),
    };
  });
}

// ─── Ready Queue at time t ──────────────────────────────────
export function getReadyQueueAtTime(processes, timeline, time, algorithm) {
  // Find which process is running at this time
  const runningEntry = timeline.find(t => t.startTime <= time && t.endTime > time);
  const runningId = runningEntry ? runningEntry.processId : null;

  // Processes that have arrived but haven't fully completed by this time
  const readyProcesses = processes.filter(proc => {
    if (proc.arrivalTime > time) return false;
    const entries = timeline.filter(t => t.processId === proc.id);
    const ct = Math.max(...entries.map(e => e.endTime));
    return ct > time; // still has work to do at this time
  });

  return {
    running: runningId,
    waiting: readyProcesses.filter(p => p.id !== runningId).map(p => p.id),
  };
}

// ─── Algorithm map ──────────────────────────────────────────
export const ALGORITHMS = {
  fcfs: { name: 'FCFS', fullName: 'First Come First Served', fn: (p) => fcfs(p), description: 'Processes are executed in the order they arrive. Simple but can cause convoy effect.' },
  sjf: { name: 'SJF', fullName: 'Shortest Job First', fn: (p) => sjf(p), description: 'Selects the process with the shortest burst time. Optimal average waiting time but non-preemptive.' },
  srtf: { name: 'SRTF', fullName: 'Shortest Remaining Time First', fn: (p) => srtf(p), description: 'Preemptive version of SJF. Preempts current process if a shorter one arrives.' },
  priority: { name: 'Priority', fullName: 'Priority Scheduling', fn: (p) => priorityScheduling(p), description: 'Executes the highest priority process first (lower number = higher priority).' },
  rr: { name: 'RR', fullName: 'Round Robin', fn: (p, q) => roundRobin(p, q), description: 'Each process gets a fixed time quantum. Fair allocation with context switching overhead.' },
  mlq: { name: 'MLQ', fullName: 'Multilevel Queue', fn: (p, q) => multilevelQueue(p, q), description: 'Processes are classified into queues by priority. Q1(1-2):RR, Q2(3-4):SJF, Q3(5+):FCFS.' },
};
