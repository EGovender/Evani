import { createContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { buildSeedState, simulatorReducer, type SimulatorAction, type SimulatorState } from './simulatorReducer';

export interface SimulatorContextValue {
  state: SimulatorState;
  dispatch: Dispatch<SimulatorAction>;
}

export const SimulatorContext = createContext<SimulatorContextValue | null>(null);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulatorReducer, buildSeedState());
  return <SimulatorContext.Provider value={{ state, dispatch }}>{children}</SimulatorContext.Provider>;
}
