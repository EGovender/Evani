import type {
  AuditEvent,
  BusinessStatus,
  ErpStatus,
  ErpVendorBill,
  FailureInjectionMode,
  IntegrationStatus,
  PaymentRequest,
  ReconciliationSummary,
  SupportException,
} from '../types/domain';
import { seedErpBills, seedEvents, seedExceptions, seedPaymentRequests } from '../data/seed';
import { runReconciliation } from '../reconciliation/reconciliationEngine';

export interface SimulatorState {
  paymentRequests: PaymentRequest[];
  erpBills: ErpVendorBill[];
  exceptions: SupportException[];
  events: AuditEvent[];
  reconciliation: ReconciliationSummary | null;
}

export function buildSeedState(): SimulatorState {
  const paymentRequests = seedPaymentRequests.map((r) => ({ ...r }));
  const erpBills = seedErpBills.map((b) => ({ ...b }));
  const exceptions = seedExceptions.map((e) => ({ ...e }));
  const events = seedEvents.map((e) => ({ ...e }));
  return {
    paymentRequests,
    erpBills,
    exceptions,
    events,
    // Reconciled eagerly so the dashboard shows the spec's example numbers on first load,
    // with no user interaction required.
    reconciliation: runReconciliation(paymentRequests, erpBills, exceptions),
  };
}

// Every action that mutates domain data appends its own AuditEvent (APPEND_EVENT), so the
// event log can never drift out of sync with the rest of the state.
export type SimulatorAction =
  | { type: 'RESET_DEMO_DATA' }
  | { type: 'CREATE_REQUEST'; request: PaymentRequest }
  | { type: 'SET_BUSINESS_STATUS'; paymentRequestId: string; status: BusinessStatus; approvedBy?: string }
  | { type: 'SET_FAILURE_INJECTION'; paymentRequestId: string; mode: FailureInjectionMode }
  | { type: 'SET_INTEGRATION_STATUS'; paymentRequestId: string; status: IntegrationStatus }
  | { type: 'APPEND_EVENT'; event: AuditEvent }
  | { type: 'CREATE_ERP_BILL'; bill: ErpVendorBill; paymentRequestId: string }
  | { type: 'ADVANCE_ERP_STATUS'; internalId: string; status: ErpStatus }
  | { type: 'CREATE_EXCEPTION'; exception: SupportException }
  | {
      type: 'REPROCESS_EXCEPTION';
      exceptionId: string;
      correctedFields: Partial<Pick<PaymentRequest, 'accounting' | 'payee'>>;
    }
  | { type: 'RESOLVE_EXCEPTION'; exceptionId: string }
  | { type: 'SET_RECONCILIATION'; summary: ReconciliationSummary };

export function simulatorReducer(state: SimulatorState, action: SimulatorAction): SimulatorState {
  switch (action.type) {
    case 'RESET_DEMO_DATA':
      return buildSeedState();

    case 'CREATE_REQUEST':
      return { ...state, paymentRequests: [...state.paymentRequests, action.request] };

    case 'SET_BUSINESS_STATUS':
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((r) =>
          r.paymentRequestId === action.paymentRequestId
            ? {
                ...r,
                businessStatus: action.status,
                approval:
                  action.status === 'Approved'
                    ? { approvedBy: action.approvedBy ?? 'USR-0000', approvedAt: new Date().toISOString() }
                    : r.approval,
              }
            : r,
        ),
      };

    case 'SET_FAILURE_INJECTION':
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((r) =>
          r.paymentRequestId === action.paymentRequestId ? { ...r, failureInjection: action.mode } : r,
        ),
      };

    case 'SET_INTEGRATION_STATUS':
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((r) =>
          r.paymentRequestId === action.paymentRequestId ? { ...r, integrationStatus: action.status } : r,
        ),
      };

    case 'APPEND_EVENT':
      return { ...state, events: [...state.events, action.event] };

    case 'CREATE_ERP_BILL':
      return {
        ...state,
        erpBills: [...state.erpBills, action.bill],
        paymentRequests: state.paymentRequests.map((r) =>
          r.paymentRequestId === action.paymentRequestId
            ? { ...r, erpTransactionId: action.bill.internalId, integrationStatus: 'Completed' }
            : r,
        ),
        // A successful create resolves any open exception on this request — e.g. after a
        // "Reprocess" from the Exception Queue succeeds on retry.
        exceptions: state.exceptions.map((e) =>
          e.paymentRequestId === action.paymentRequestId && e.status !== 'Resolved'
            ? { ...e, status: 'Resolved' }
            : e,
        ),
      };

    case 'ADVANCE_ERP_STATUS':
      return {
        ...state,
        erpBills: state.erpBills.map((b) =>
          b.internalId === action.internalId ? { ...b, status: action.status } : b,
        ),
      };

    case 'CREATE_EXCEPTION':
      return { ...state, exceptions: [...state.exceptions, action.exception] };

    case 'REPROCESS_EXCEPTION': {
      const exception = state.exceptions.find((e) => e.exceptionId === action.exceptionId);
      if (!exception) return state;
      return {
        ...state,
        exceptions: state.exceptions.map((e) =>
          e.exceptionId === action.exceptionId ? { ...e, status: 'Open' } : e,
        ),
        paymentRequests: state.paymentRequests.map((r) =>
          r.paymentRequestId === exception.paymentRequestId
            ? { ...r, ...action.correctedFields, integrationStatus: 'Queued', failureInjection: 'NONE' }
            : r,
        ),
      };
    }

    case 'RESOLVE_EXCEPTION':
      return {
        ...state,
        exceptions: state.exceptions.map((e) =>
          e.exceptionId === action.exceptionId ? { ...e, status: 'Resolved' } : e,
        ),
      };

    case 'SET_RECONCILIATION':
      return { ...state, reconciliation: action.summary };

    default:
      return state;
  }
}
