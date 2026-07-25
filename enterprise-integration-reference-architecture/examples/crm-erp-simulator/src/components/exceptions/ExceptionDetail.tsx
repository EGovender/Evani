import { useState } from 'react';
import { useSimulator } from '../../state/useSimulator';
import type { Accounting, Payee, SupportException } from '../../types/domain';
import { NSCF_PROGRAMS } from '../../engine/validators';
import { inputClass, primaryButtonClass } from '../shared/formStyles';
import StatusBadge from '../layout/StatusBadge';

const TRANSIENT_CODES = new Set(['ERP_UNAVAILABLE', 'API_TIMEOUT', 'RECORD_LOCKED', 'AUTH_FAILURE']);

export default function ExceptionDetail({ exception }: { exception: SupportException }) {
  const { state, dispatch } = useSimulator();
  const request = state.paymentRequests.find((r) => r.paymentRequestId === exception.paymentRequestId);
  const [programCode, setProgramCode] = useState(request?.accounting.programCode ?? NSCF_PROGRAMS[0].code);
  const [erpVendorId, setErpVendorId] = useState(request?.payee.erpVendorId ?? '');
  const [markPayable, setMarkPayable] = useState(true);

  if (!request) return null;
  const activeRequest = request;

  function handleReprocess() {
    const correctedFields: { accounting?: Accounting; payee?: Payee } = {};

    if (exception.errorCode === 'INVALID_ACCOUNTING_MAPPING') {
      const program = NSCF_PROGRAMS.find((p) => p.code === programCode);
      correctedFields.accounting = {
        ...activeRequest.accounting,
        programCode,
        expenseAccount: program?.expenseAccount ?? activeRequest.accounting.expenseAccount,
      };
    }
    if (exception.errorCode === 'MISSING_VENDOR_MAPPING') {
      correctedFields.payee = { ...activeRequest.payee, erpVendorId: erpVendorId.trim() };
    }
    if (exception.errorCode === 'PAYEE_NOT_PAYABLE') {
      correctedFields.payee = {
        ...(correctedFields.payee ?? activeRequest.payee),
        payabilityStatus: markPayable ? 'Payable' : 'Not Payable',
      };
    }

    dispatch({ type: 'REPROCESS_EXCEPTION', exceptionId: exception.exceptionId, correctedFields });
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold font-mono">{exception.exceptionId}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {request.paymentRequestId} · {request.payee.legalName}
          </p>
        </div>
        <StatusBadge status={exception.status} />
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">{exception.errorMessage}</p>
      <p className="text-xs text-slate-400">Attempts so far: {exception.attempts}</p>

      {exception.errorCode === 'INVALID_ACCOUNTING_MAPPING' && (
        <label className="flex flex-col gap-1 text-sm max-w-xs">
          Correct program mapping
          <select value={programCode} onChange={(e) => setProgramCode(e.target.value)} className={inputClass}>
            {NSCF_PROGRAMS.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {exception.errorCode === 'MISSING_VENDOR_MAPPING' && (
        <label className="flex flex-col gap-1 text-sm max-w-xs">
          ERP vendor ID
          <input
            value={erpVendorId}
            onChange={(e) => setErpVendorId(e.target.value)}
            placeholder="VEND-3900"
            className={inputClass}
          />
        </label>
      )}

      {exception.errorCode === 'PAYEE_NOT_PAYABLE' && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={markPayable} onChange={(e) => setMarkPayable(e.target.checked)} />
          Mark payee as payable (compliance/onboarding resolved)
        </label>
      )}

      {exception.errorCode && TRANSIENT_CODES.has(exception.errorCode) && (
        <p className="text-xs text-slate-400">
          Transient failure — support has confirmed the underlying system has recovered.
        </p>
      )}

      <button
        type="button"
        className={primaryButtonClass}
        disabled={exception.status === 'Resolved' || request.integrationStatus === 'Processing'}
        onClick={handleReprocess}
      >
        Reprocess
      </button>

      {request.integrationStatus === 'Queued' && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Corrected and re-queued — go to the CRM Requests tab and click "Send to ERP" to retry.
        </p>
      )}
    </div>
  );
}
