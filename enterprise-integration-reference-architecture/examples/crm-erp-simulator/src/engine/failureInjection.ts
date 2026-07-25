import type { FailureInjectionMode, ValidationFailureCode } from '../types/domain';
import type { IntegrationStepOperation } from './steps';

export interface FailureInjectionSpec {
  mode: FailureInjectionMode;
  label: string;
  description: string;
  step: IntegrationStepOperation;
  errorCode?: ValidationFailureCode;
  retryable: boolean;
  // Only true for DUPLICATE_REQUEST: per the workflow doc's idempotency rule this is a
  // graceful short-circuit (return the existing ERP transaction), not a real failure —
  // it never creates a support exception.
  graceful?: boolean;
}

// Per docs/workflows/crm-to-erp-payment-request.md: "Validation errors and authorization
// failures should not be retried without corrective action" (retryable: false below), vs.
// "network timeouts / 429 / 502 / 503 / temporary record locks" (retryable: true below).
export const FAILURE_INJECTION_SPECS: Record<Exclude<FailureInjectionMode, 'NONE'>, FailureInjectionSpec> = {
  INVALID_ACCOUNTING_MAPPING: {
    mode: 'INVALID_ACCOUNTING_MAPPING',
    label: 'Invalid accounting mapping',
    description: 'Program code is not valid for the subsidiary — routes straight to Manual Review.',
    step: 'VALIDATE_ACCOUNTING',
    errorCode: 'INVALID_ACCOUNTING_MAPPING',
    retryable: false,
  },
  PAYEE_NOT_PAYABLE: {
    mode: 'PAYEE_NOT_PAYABLE',
    label: 'Payee not payable',
    description: 'Payee failed compliance or onboarding checks — routes straight to Manual Review.',
    step: 'VALIDATE_PAYEE',
    errorCode: 'PAYEE_NOT_PAYABLE',
    retryable: false,
  },
  MISSING_VENDOR_ID: {
    mode: 'MISSING_VENDOR_ID',
    label: 'Missing vendor ID',
    description: 'No ERP vendor mapping exists for this payee — routes straight to Manual Review.',
    step: 'VALIDATE_PAYEE',
    errorCode: 'MISSING_VENDOR_MAPPING',
    retryable: false,
  },
  DUPLICATE_REQUEST: {
    mode: 'DUPLICATE_REQUEST',
    label: 'Duplicate request',
    description:
      'Simulates resubmitting a request that already has an ERP transaction — the existing transaction is returned, no new bill is created, and no exception is raised.',
    step: 'CHECK_DUPLICATE',
    retryable: false,
    graceful: true,
  },
  ERP_UNAVAILABLE: {
    mode: 'ERP_UNAVAILABLE',
    label: 'ERP unavailable',
    description: 'ERP returns a temporary service-unavailable error — retries with backoff, then Manual Review.',
    step: 'CREATE_VENDOR_BILL',
    errorCode: 'ERP_UNAVAILABLE',
    retryable: true,
  },
  AUTHENTICATION_FAILURE: {
    mode: 'AUTHENTICATION_FAILURE',
    label: 'Authentication failure',
    description: 'Integration service account credentials are rejected — routes straight to Manual Review.',
    step: 'AUTHENTICATE_REQUEST',
    errorCode: 'AUTH_FAILURE',
    retryable: false,
  },
  API_TIMEOUT: {
    mode: 'API_TIMEOUT',
    label: 'API timeout',
    description: 'ERP does not respond within the expected time — retries with backoff, then Manual Review.',
    step: 'CREATE_VENDOR_BILL',
    errorCode: 'API_TIMEOUT',
    retryable: true,
  },
  RECORD_LOCKED: {
    mode: 'RECORD_LOCKED',
    label: 'Record locked',
    description: 'Target ERP record is locked by another process — retries with backoff, then Manual Review.',
    step: 'CREATE_VENDOR_BILL',
    errorCode: 'RECORD_LOCKED',
    retryable: true,
  },
};

export const FAILURE_INJECTION_OPTIONS: { mode: FailureInjectionMode; label: string }[] = [
  { mode: 'NONE', label: 'None' },
  ...Object.values(FAILURE_INJECTION_SPECS).map((spec) => ({ mode: spec.mode, label: spec.label })),
];

// Returns the injection spec only if the request's selected failure-injection mode is
// wired to fire at this particular step — every other step proceeds normally.
export function getInjectionForStep(
  mode: FailureInjectionMode | undefined,
  operation: IntegrationStepOperation,
): FailureInjectionSpec | null {
  if (!mode || mode === 'NONE') return null;
  const spec = FAILURE_INJECTION_SPECS[mode];
  return spec.step === operation ? spec : null;
}
