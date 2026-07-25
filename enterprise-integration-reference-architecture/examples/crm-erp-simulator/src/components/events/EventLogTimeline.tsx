import { useMemo, useState } from 'react';
import type { AuditEvent } from '../../types/domain';
import { formatDateTime } from '../../utils/format';
import { inputClass } from '../shared/formStyles';

export default function EventLogTimeline({ events }: { events: AuditEvent[] }) {
  const [filter, setFilter] = useState('');

  const sorted = useMemo(() => events.slice().sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)), [events]);

  const trimmedFilter = filter.trim();
  const filtered = trimmedFilter
    ? sorted.filter(
        (e) => e.correlationId.includes(trimmedFilter) || e.sourceRecordId.includes(trimmedFilter),
      )
    : sorted;

  return (
    <div className="space-y-3">
      <input
        placeholder="Filter by correlation ID or request ID…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={`w-full max-w-sm ${inputClass}`}
      />
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[32rem]">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-left sticky top-0">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Correlation ID</th>
                <th className="px-3 py-2">Route</th>
                <th className="px-3 py-2">Operation</th>
                <th className="px-3 py-2">Attempt</th>
                <th className="px-3 py-2">Result</th>
                <th className="px-3 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.eventId} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{formatDateTime(e.occurredAt)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.correlationId.slice(0, 8)}…</td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {e.sourceSystem} → {e.targetSystem}
                  </td>
                  <td className="px-3 py-2 text-xs">{e.operation}</td>
                  <td className="px-3 py-2 text-xs">{e.attemptNumber}</td>
                  <td className="px-3 py-2 text-xs">
                    <ResultLabel result={e.result} />
                  </td>
                  <td className="px-3 py-2 text-xs">{e.message}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                    No matching events.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResultLabel({ result }: { result: string }) {
  const classes =
    result === 'SUCCESS'
      ? 'text-emerald-600 dark:text-emerald-400'
      : result === 'FAILURE'
        ? 'text-red-600 dark:text-red-400'
        : 'text-amber-600 dark:text-amber-400';
  return <span className={classes}>{result}</span>;
}
