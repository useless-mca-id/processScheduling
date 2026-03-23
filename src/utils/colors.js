// Vibrant, distinct colors for processes
const PROCESS_COLORS = [
  { bg: '#06d6a0', text: '#0a0e1a', name: 'Emerald' },
  { bg: '#4cc9f0', text: '#0a0e1a', name: 'Sky' },
  { bg: '#f72585', text: '#ffffff', name: 'Rose' },
  { bg: '#9b5de5', text: '#ffffff', name: 'Violet' },
  { bg: '#ff9f1c', text: '#0a0e1a', name: 'Amber' },
  { bg: '#fee440', text: '#0a0e1a', name: 'Yellow' },
  { bg: '#00bbf9', text: '#0a0e1a', name: 'Cyan' },
  { bg: '#f15bb5', text: '#ffffff', name: 'Pink' },
  { bg: '#8ac926', text: '#0a0e1a', name: 'Lime' },
  { bg: '#ff6b6b', text: '#ffffff', name: 'Coral' },
  { bg: '#48bfe3', text: '#0a0e1a', name: 'Azure' },
  { bg: '#e9c46a', text: '#0a0e1a', name: 'Gold' },
];

export function getProcessColor(index) {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

export function getProcessBg(index, opacity = 1) {
  const c = PROCESS_COLORS[index % PROCESS_COLORS.length];
  if (opacity === 1) return c.bg;
  // Convert hex to rgba
  const r = parseInt(c.bg.slice(1, 3), 16);
  const g = parseInt(c.bg.slice(3, 5), 16);
  const b = parseInt(c.bg.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export default PROCESS_COLORS;
