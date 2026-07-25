import type { ReactNode } from 'react';
import { useSimulator } from '../../state/useSimulator';

export interface TabDef {
  key: string;
  label: string;
}

export default function AppShell({
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: ReactNode;
}) {
  const { dispatch } = useSimulator();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">CRM → ERP Payment Simulator</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Interactive walkthrough of a fictional enterprise integration architecture.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all demo data back to its initial seed state?')) {
                dispatch({ type: 'RESET_DEMO_DATA' });
              }
            }}
            className="text-sm rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Reset demo data
          </button>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 text-xs text-amber-700 dark:text-amber-400">
          All organizations, people, and data shown are fictional and generated for demonstration purposes only.
        </div>
        <nav className="mx-auto max-w-6xl px-4 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
