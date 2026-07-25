import { useContext } from 'react';
import { SimulatorContext } from './SimulatorContext';

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return ctx;
}
