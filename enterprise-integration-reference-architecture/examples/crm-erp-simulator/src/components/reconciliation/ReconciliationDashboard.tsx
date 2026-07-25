import { useSimulator } from '../../state/useSimulator';
import { runReconciliation } from '../../reconciliation/reconciliationEngine';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { primaryButtonClass } from '../shared/formStyles';
import type { ReconciliationCategory } from '../../types/domain';

const CATEGORIES: ReconciliationCategory[] = [
  'Matched',
  'Missing in ERP',
  'Missing in CRM',
  'Amount mismatch',
  'Duplicate',
  'Status mismatch',
];

export default function ReconciliationDashboard() {
  const { state, dispatch } = useSimulator();
  const summary = state.reconciliation;

  function handleRun() {
    dispatch({
      type: 'SET_RECONCILIATION',
      summary: runReconciliation(state.paymentRequests, state.erpBills, state.exceptions),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Reconciliation</h3>
        <button type="button" className={primaryButtonClass} onClick={handleRun}>
          Run reconciliation check
        </button>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Metric label="Approved CRM requests" value={summary.approvedCrmRequests} />
            <Metric label="ERP bills created" value={summary.erpBillsCreated} />
            <Metric label="Matched records" value={summary.matchedRecords} />
            <Metric label="Exceptions" value={summary.exceptions} />
            <Metric label="Amount difference" value={formatCurrency(summary.amountDifference)} />
          </div>
          <p className="text-xs text-slate-400">Last run {formatDateTime(summary.runAt)}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((category) => (
              <div key={category} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{category}</h4>
                  <span className="text-xs text-slate-400">{summary.categorized[category].length}</span>
                </div>
                {summary.categorized[category].length === 0 ? (
                  <p className="text-xs text-slate-400">None</p>
                ) : (
                  <ul className="text-xs font-mono space-y-0.5">
                    {summary.categorized[category].map((id) => (
                      <li key={id}>{id}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
