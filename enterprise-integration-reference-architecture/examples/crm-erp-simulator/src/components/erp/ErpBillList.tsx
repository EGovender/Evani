import type { ErpVendorBill } from '../../types/domain';
import StatusBadge from '../layout/StatusBadge';
import { formatCurrency } from '../../utils/format';

export default function ErpBillList({
  bills,
  selectedId,
  onSelect,
}: {
  bills: ErpVendorBill[];
  selectedId: string | null;
  onSelect: (internalId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="px-3 py-2">Document</th>
              <th className="px-3 py-2">External ID</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bills
              .slice()
              .reverse()
              .map((b) => (
                <tr
                  key={b.internalId}
                  onClick={() => onSelect(b.internalId)}
                  className={`cursor-pointer border-t border-slate-200 dark:border-slate-700 ${
                    selectedId === b.internalId
                      ? 'bg-indigo-50 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs">{b.documentNumber}</td>
                  <td className="px-3 py-2 font-mono text-xs">{b.externalId}</td>
                  <td className="px-3 py-2">{b.vendorLegalName}</td>
                  <td className="px-3 py-2">{formatCurrency(b.amount, b.currency)}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  No ERP vendor bills yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
