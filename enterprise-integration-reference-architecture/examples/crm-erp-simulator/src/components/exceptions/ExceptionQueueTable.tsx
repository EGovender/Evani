import type { SupportException } from '../../types/domain';
import StatusBadge from '../layout/StatusBadge';

export default function ExceptionQueueTable({
  exceptions,
  selectedId,
  onSelect,
}: {
  exceptions: SupportException[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="px-3 py-2">Exception</th>
              <th className="px-3 py-2">Request</th>
              <th className="px-3 py-2">Error</th>
              <th className="px-3 py-2">Attempts</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {exceptions
              .slice()
              .reverse()
              .map((ex) => (
                <tr
                  key={ex.exceptionId}
                  onClick={() => onSelect(ex.exceptionId)}
                  className={`cursor-pointer border-t border-slate-200 dark:border-slate-700 ${
                    selectedId === ex.exceptionId
                      ? 'bg-indigo-50 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs">{ex.exceptionId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{ex.paymentRequestId}</td>
                  <td className="px-3 py-2">{ex.errorMessage}</td>
                  <td className="px-3 py-2">{ex.attempts}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={ex.status} />
                  </td>
                </tr>
              ))}
            {exceptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  No exceptions — queue is clear.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
