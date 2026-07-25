import type { PaymentRequest } from '../../types/domain';
import StatusBadge from '../layout/StatusBadge';
import { formatCurrency } from '../../utils/format';

export default function PaymentRequestList({
  requests,
  selectedId,
  onSelect,
}: {
  requests: PaymentRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="px-3 py-2">Request</th>
              <th className="px-3 py-2">Payee</th>
              <th className="px-3 py-2">Program</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Business</th>
              <th className="px-3 py-2">Integration</th>
            </tr>
          </thead>
          <tbody>
            {requests
              .slice()
              .reverse()
              .map((r) => (
                <tr
                  key={r.paymentRequestId}
                  onClick={() => onSelect(r.paymentRequestId)}
                  className={`cursor-pointer border-t border-slate-200 dark:border-slate-700 ${
                    selectedId === r.paymentRequestId
                      ? 'bg-indigo-50 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs">{r.paymentRequestId}</td>
                  <td className="px-3 py-2">{r.payee.legalName}</td>
                  <td className="px-3 py-2">{r.program}</td>
                  <td className="px-3 py-2">{formatCurrency(r.payment.amount, r.payment.currency)}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.businessStatus} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.integrationStatus} />
                  </td>
                </tr>
              ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                  No payment requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
