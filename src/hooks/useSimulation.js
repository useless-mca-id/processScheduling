import { useState, useCallback, useRef, useEffect } from 'react';
import { ALGORITHMS, getReadyQueueAtTime } from '../algorithms/schedulers';

const DEFAULT_SPEED = 1; // 1x speed = 800ms per time unit

export default function useSimulation() {
  const [processes, setProcesses] = useState([]);
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [stepMode, setStepMode] = useState(false);

  const [timeline, setTimeline] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [currentTime, setCurrentTime] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef(null);
  const timeRef = useRef(-1);
  const timelineRef = useRef([]);

  // Compute the total duration from timeline
  const totalDuration = timeline.length > 0 ? Math.max(...timeline.map(t => t.endTime)) : 0;

  // Generate timeline when algorithm/processes change (but don't auto-play)
  const computeTimeline = useCallback(() => {
    if (processes.length === 0) return { timeline: [], metrics: [] };
    const algo = ALGORITHMS[algorithm];
    if (!algo) return { timeline: [], metrics: [] };
    const result = (algorithm === 'rr' || algorithm === 'mlq')
      ? algo.fn(processes, timeQuantum)
      : algo.fn(processes);
    return result;
  }, [processes, algorithm, timeQuantum]);

  // Get ready queue state at current time
  const readyQueue = useCallback(() => {
    if (currentTime < 0 || timeline.length === 0) return { running: null, waiting: [] };
    return getReadyQueueAtTime(processes, timeline, currentTime, algorithm);
  }, [currentTime, timeline, processes, algorithm]);

  // Tick function
  const tick = useCallback(() => {
    timeRef.current += 1;
    const t = timeRef.current;
    const maxTime = Math.max(...timelineRef.current.map(e => e.endTime));

    setCurrentTime(t);

    if (t >= maxTime) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
      setIsComplete(true);
    }
  }, []);

  // Start simulation
  const start = useCallback(() => {
    const result = computeTimeline();
    if (result.timeline.length === 0) return;

    setTimeline(result.timeline);
    setMetrics(result.metrics);
    timelineRef.current = result.timeline;

    if (isComplete || currentTime < 0) {
      timeRef.current = -1;
      setCurrentTime(-1);
      setIsComplete(false);
    }

    setIsRunning(true);
    setIsPaused(false);

    if (!stepMode) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 800 / speed);
    }
  }, [computeTimeline, stepMode, speed, tick, isComplete, currentTime]);

  // Pause
  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  // Resume
  const resume = useCallback(() => {
    if (isComplete) return;
    setIsPaused(false);
    setIsRunning(true);
    if (!stepMode) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 800 / speed);
    }
  }, [stepMode, speed, tick, isComplete]);

  // Reset
  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    setCurrentTime(-1);
    setTimeline([]);
    setMetrics([]);
    timeRef.current = -1;
    timelineRef.current = [];
  }, []);

  // Step forward one time unit
  const step = useCallback(() => {
    if (timeline.length === 0) {
      // First step: compute and show t=0
      const result = computeTimeline();
      if (result.timeline.length === 0) return;
      setTimeline(result.timeline);
      setMetrics(result.metrics);
      timelineRef.current = result.timeline;
      setIsRunning(true);
      setIsPaused(true);
      setIsComplete(false);
    }
    tick();
  }, [timeline, computeTimeline, tick]);

  // Speed change while running
  useEffect(() => {
    if (isRunning && !stepMode && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 800 / speed);
    }
  }, [speed, isRunning, stepMode, tick]);

  // Cleanup
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Add process
  const addProcess = useCallback((proc) => {
    setProcesses(prev => [...prev, proc]);
  }, []);

  // Remove process
  const removeProcess = useCallback((id) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  }, []);

  // Generate random processes
  const generateRandom = useCallback((count = 5) => {
    const procs = Array.from({ length: count }, (_, i) => ({
      id: `P${i + 1}`,
      arrivalTime: Math.floor(Math.random() * 8),
      burstTime: Math.floor(Math.random() * 8) + 1,
      priority: Math.floor(Math.random() * 6) + 1,
    }));
    setProcesses(procs);
  }, []);

  // Clear all
  const clearProcesses = useCallback(() => {
    reset();
    setProcesses([]);
  }, [reset]);

  return {
    // State
    processes, algorithm, timeQuantum, speed, stepMode,
    timeline, metrics, currentTime, totalDuration,
    isRunning, isPaused, isComplete,
    // Actions
    setAlgorithm, setTimeQuantum, setSpeed, setStepMode,
    addProcess, removeProcess, generateRandom, clearProcesses,
    start, pause, resume, reset, step,
    readyQueue,
  };
}
