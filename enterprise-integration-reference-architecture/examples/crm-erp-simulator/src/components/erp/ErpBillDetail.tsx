import { useSimulator } from '../../state/useSimulator';
import type { ErpStatus, ErpVendorBill } from '../../types/domain';
import StatusBadge from '../layout/StatusBadge';
import { formatCurrency } from '../../utils/format';
import { secondaryButtonClass } from '../shared/formStyles';

const STATUS_SEQUENCE: ErpStatus[] = ['Pending Approval', 'Open', 'Scheduled for Payment', 'Paid'];

export default function ErpBillDetail({ bill }: { bill: ErpVendorBill }) {
  const { dispatch } = useSimulator();
  const currentIndex = STATUS_SEQUENCE.indexOf(bill.status);
  const nextStatus =
    currentIndex >= 0 && currentIndex < STATUS_SEQUENCE.length - 1 ? STATUS_SEQUENCE[currentIndex + 1] : null;

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{bill.vendorLegalName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{bill.documentNumber}</p>
        </div>
        <div className="text-lg font-semibold">{formatCurrency(bill.amount, bill.currency)}</div>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
        <div>
          External ID: <span className="font-mono">{bill.externalId}</span>
        </div>
        <div>
          Internal ID: <span className="font-mono">{bill.internalId}</span>
        </div>
        <div className="flex items-center gap-2">
          Status: <StatusBadge status={bill.status} />
        </div>
      </div>
      {nextStatus ? (
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => dispatch({ type: 'ADVANCE_ERP_STATUS', internalId: bill.internalId, status: nextStatus })}
        >
          Advance to &ldquo;{nextStatus}&rdquo;
        </button>
      ) : (
        <p className="text-xs text-slate-400">This bill has reached its final status.</p>
      )}
    </div>
  );
}
