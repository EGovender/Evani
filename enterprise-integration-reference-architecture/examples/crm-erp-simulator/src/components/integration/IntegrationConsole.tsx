import { useMemo, useState } from 'react';
import { useSimulator } from '../../state/useSimulator';
import { processPaymentRequest } from '../../engine/integrationEngine';
import { FAILURE_INJECTION_OPTIONS } from '../../engine/failureInjection';
import { INTEGRATION_STEPS } from '../../engine/steps';
import type { FailureInjectionMode, PaymentRequest } from '../../types/domain';

export default function IntegrationConsole({ request }: { request: PaymentRequest }) {
  const { state, dispatch } = useSimulator();
  const [isSending, setIsSending] = useState(false);

  const events = useMemo(
    () => state.events.filter((e) => e.correlationId === request.correlationId),
    [state.events, request.correlationId],
  );

  const canSend =
    !isSending &&
    request.businessStatus === 'Approved' &&
    (request.integrationStatus === 'Not Started' || request.integrationStatus === 'Queued');

  async function handleSend() {
    setIsSending(true);
    await processPaymentRequest(request, state.erpBills, dispatch);
    setIsSending(false);
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-slate-50 dark:bg-slate-800/40">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100">Integration processing</h4>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300" htmlFor="failure-injection">
            Simulate failure
          </label>
          <select
            id="failure-injection"
            className="text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
            value={request.failureInjection ?? 'NONE'}
            disabled={isSending || request.integrationStatus !== 'Not Started'}
            onChange={(e) =>
              dispatch({
                type: 'SET_FAILURE_INJECTION',
                paymentRequestId: request.paymentRequestId,
                mode: e.target.value as FailureInjectionMode,
              })
            }
          >
            {FAILURE_INJECTION_OPTIONS.map((opt) => (
              <option key={opt.mode} value={opt.mode}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded bg-indigo-600 text-white text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500"
            disabled={!canSend}
            onClick={handleSend}
          >
            {isSending ? 'Processing…' : 'Send to ERP'}
          </button>
        </div>
      </div>

      <ol className="space-y-2">
        {INTEGRATION_STEPS.map((step) => {
          const matches = events.filter((e) => e.operation === step.operation);
          const last = matches[matches.length - 1];
          return (
            <li key={step.operation} className="flex items-start gap-2 text-sm">
              <StepIcon result={last?.result} pending={isSending && matches.length === 0} />
              <div className="flex-1">
                <div className="text-slate-800 dark:text-slate-100">{step.label}</div>
                {matches.length > 1 ? (
                  <ul className="mt-1 space-y-0.5 text-xs">
                    {matches.map((m) => (
                      <li key={m.eventId} className={resultTextClass(m.result)}>
                        {m.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  last?.message && <div className={`text-xs ${resultTextClass(last.result)}`}>{last.message}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function resultTextClass(result?: string): string {
  if (result === 'FAILURE') return 'text-red-600 dark:text-red-400';
  if (result === 'RETRY') return 'text-amber-600 dark:text-amber-400';
  return 'text-slate-500 dark:text-slate-400';
}

function StepIcon({ result, pending }: { result?: string; pending: boolean }) {
  if (result === 'SUCCESS') return <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
  if (result === 'FAILURE') return <span className="text-red-600 dark:text-red-400">✕</span>;
  if (result === 'RETRY') return <span className="text-amber-600 dark:text-amber-400">↻</span>;
  if (pending) return <span className="animate-pulse text-slate-400">…</span>;
  return <span className="text-slate-300 dark:text-slate-600">○</span>;
}
