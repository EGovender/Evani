import { useSimulator } from '../../state/useSimulator';
import type { BusinessStatus, PaymentRequest } from '../../types/domain';
import StatusBadge from '../layout/StatusBadge';
import IntegrationConsole from '../integration/IntegrationConsole';
import JsonPreview from '../shared/JsonPreview';
import { formatCurrency, formatDate } from '../../utils/format';
import { toDocRequestPayload } from '../../utils/toDocPayload';
import { secondaryButtonClass } from '../shared/formStyles';

export default function PaymentRequestDetail({ request }: { request: PaymentRequest }) {
  const { state, dispatch } = useSimulator();
  const bill = state.erpBills.find((b) => b.externalId === request.paymentRequestId);

  function setStatus(status: BusinessStatus) {
    dispatch({
      type: 'SET_BUSINESS_STATUS',
      paymentRequestId: request.paymentRequestId,
      status,
      approvedBy: 'USR-9001',
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{request.payee.legalName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{request.paymentRequestId}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">
            {formatCurrency(request.payment.amount, request.payment.currency)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {request.program} · due {formatDate(request.payment.requestedPaymentDate)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <StatusLabel label="Business status" status={request.businessStatus} />
        <StatusLabel label="Integration status" status={request.integrationStatus} />
        <StatusLabel label="ERP status" status={bill?.status ?? 'Not Created'} />
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">{request.businessJustification}</p>

      <div className="flex flex-wrap gap-2">
        {request.businessStatus === 'Draft' && (
          <>
            <button className={secondaryButtonClass} onClick={() => setStatus('Submitted')}>
              Submit
            </button>
            <button className={secondaryButtonClass} onClick={() => setStatus('Cancelled')}>
              Cancel
            </button>
          </>
        )}
        {request.businessStatus === 'Submitted' && (
          <>
            <button className={secondaryButtonClass} onClick={() => setStatus('Approved')}>
              Approve
            </button>
            <button className={secondaryButtonClass} onClick={() => setStatus('Rejected')}>
              Reject
            </button>
            <button className={secondaryButtonClass} onClick={() => setStatus('Cancelled')}>
              Cancel
            </button>
          </>
        )}
        {request.businessStatus === 'Approved' && request.integrationStatus === 'Not Started' && (
          <button className={secondaryButtonClass} onClick={() => setStatus('Cancelled')}>
            Cancel
          </button>
        )}
      </div>

      {request.businessStatus === 'Approved' && <IntegrationConsole request={request} />}

      {bill && (
        <div className="text-sm rounded-md bg-slate-50 dark:bg-slate-800/60 p-3">
          <div className="font-medium mb-1">Linked ERP vendor bill</div>
          <div className="grid grid-cols-2 gap-1 text-slate-600 dark:text-slate-300">
            <div>
              Document: <span className="font-mono">{bill.documentNumber}</span>
            </div>
            <div>
              Internal ID: <span className="font-mono">{bill.internalId}</span>
            </div>
            <div className="flex items-center gap-2">
              Status: <StatusBadge status={bill.status} />
            </div>
            <div>Amount: {formatCurrency(bill.amount, bill.currency)}</div>
          </div>
        </div>
      )}

      <JsonPreview title="CRM payload" data={toDocRequestPayload(request)} />
    </div>
  );
}

function StatusLabel({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <span>{label}:</span>
      <StatusBadge status={status} />
    </div>
  );
}
