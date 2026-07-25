import type { Dispatch } from 'react';
import type { AuditEvent, ErpVendorBill, PaymentRequest, ValidationFailureCode } from '../types/domain';
import type { SimulatorAction } from '../state/simulatorReducer';
import { nextDocumentNumber, nextEventId, nextExceptionId, nextInternalId } from '../data/idGenerators';
import { getInjectionForStep } from './failureInjection';
import { INTEGRATION_STEPS } from './steps';
import { sleep } from './sleep';
import { FAILURE_CODE_MESSAGES, validateAccounting, validatePayee, validateSchema } from './validators';

// The reference architecture (docs/workflows/crm-to-erp-payment-request.md) defines a
// 5-attempt retry policy with real-world backoff (1min/5min/15min/1hr). This interactive
// demo compresses that to MAX_RETRY_ATTEMPTS short attempts so the flow stays watchable —
// matches the product spec's own numeric examples ("Attempt 3 failed — retry limit
// reached"). Bump this (and RETRY_DELAYS_MS) if 5-attempt parity with the doc is preferred.
export const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 900, 1600];

function randomStepDelay(): number {
  return 400 + Math.floor(Math.random() * 300);
}

const STEP_FAILURE_LABELS: Partial<Record<(typeof INTEGRATION_STEPS)[number]['operation'], string>> = {
  AUTHENTICATE_REQUEST: 'Authentication failed',
  VALIDATE_SCHEMA: 'Schema validation failed',
  VALIDATE_PAYEE: 'Payee validation failed',
  VALIDATE_ACCOUNTING: 'Accounting validation failed',
};

function buildVendorBill(request: PaymentRequest): ErpVendorBill {
  return {
    internalId: nextInternalId(),
    documentNumber: nextDocumentNumber(),
    externalId: request.paymentRequestId,
    vendorLegalName: request.payee.legalName,
    amount: request.payment.amount,
    currency: request.payment.currency,
    status: 'Pending Approval',
  };
}

interface EmitEventInput {
  request: PaymentRequest;
  operation: AuditEvent['operation'];
  result: AuditEvent['result'];
  attemptNumber: number;
  message: string;
  errorCode?: ValidationFailureCode;
  sourceSystem?: AuditEvent['sourceSystem'];
  targetSystem?: AuditEvent['sourceSystem'];
  targetRecordId?: string;
}

function emitEvent(dispatch: Dispatch<SimulatorAction>, input: EmitEventInput) {
  const {
    request,
    operation,
    result,
    attemptNumber,
    message,
    errorCode,
    sourceSystem = 'CRM',
    targetSystem = 'Integration Service',
    targetRecordId = request.paymentRequestId,
  } = input;
  dispatch({
    type: 'APPEND_EVENT',
    event: {
      eventId: nextEventId(),
      correlationId: request.correlationId,
      sourceSystem,
      sourceRecordId: request.paymentRequestId,
      targetSystem,
      targetRecordId,
      operation,
      attemptNumber,
      result,
      occurredAt: new Date().toISOString(),
      message,
      errorCode,
    },
  });
}

function routeToManualReview(
  dispatch: Dispatch<SimulatorAction>,
  request: PaymentRequest,
  errorCode: ValidationFailureCode,
  attempts: number,
) {
  dispatch({ type: 'SET_INTEGRATION_STATUS', paymentRequestId: request.paymentRequestId, status: 'Manual Review' });
  const exceptionId = nextExceptionId();
  emitEvent(dispatch, {
    request,
    operation: 'EXCEPTION_CREATED',
    result: 'FAILURE',
    attemptNumber: attempts,
    message: `Request moved to Manual Review — support exception ${exceptionId} created`,
    errorCode,
    sourceSystem: 'Integration Service',
    targetSystem: 'Monitoring Platform',
  });
  dispatch({
    type: 'CREATE_EXCEPTION',
    exception: {
      exceptionId,
      paymentRequestId: request.paymentRequestId,
      errorCode,
      errorMessage: FAILURE_CODE_MESSAGES[errorCode],
      attempts,
      status: 'Open',
      createdAt: new Date().toISOString(),
    },
  });
}

// Re-validates defensively even though the CRM form already enforces most of these —
// mirrors the doc's own stance that the integration service "does not assume the CRM
// sent only valid requests."
function runDefensiveValidation(request: PaymentRequest): ValidationFailureCode | null {
  return validateSchema(request) ?? validatePayee(request.payee) ?? validateAccounting(request.accounting);
}

export async function processPaymentRequest(
  request: PaymentRequest,
  existingBills: ErpVendorBill[],
  dispatch: Dispatch<SimulatorAction>,
): Promise<void> {
  dispatch({ type: 'SET_INTEGRATION_STATUS', paymentRequestId: request.paymentRequestId, status: 'Processing' });

  const defensiveFailure = runDefensiveValidation(request);

  for (const step of INTEGRATION_STEPS) {
    const injection = getInjectionForStep(request.failureInjection, step.operation);

    // Graceful short-circuit: duplicate request. Per the workflow doc's idempotency rule
    // this returns the existing ERP transaction rather than creating a new one — not a
    // failure, no exception.
    if (injection?.graceful) {
      await sleep(randomStepDelay());
      const existing = existingBills.find((b) => b.externalId === request.paymentRequestId);
      const bill = existing ?? buildVendorBill(request);
      emitEvent(dispatch, {
        request,
        operation: step.operation,
        result: 'SUCCESS',
        attemptNumber: 1,
        message: 'Duplicate detected — existing transaction returned, no new bill created',
        targetSystem: 'ERP',
        targetRecordId: bill.internalId,
      });
      if (!existing) {
        dispatch({ type: 'CREATE_ERP_BILL', bill, paymentRequestId: request.paymentRequestId });
      } else {
        dispatch({ type: 'SET_INTEGRATION_STATUS', paymentRequestId: request.paymentRequestId, status: 'Completed' });
      }
      return;
    }

    // Non-retryable failure: fails once, routes straight to Manual Review.
    if (injection && !injection.retryable) {
      await sleep(randomStepDelay());
      emitEvent(dispatch, {
        request,
        operation: step.operation,
        result: 'FAILURE',
        attemptNumber: 1,
        message: STEP_FAILURE_LABELS[step.operation] ?? `${step.label} — failed`,
        errorCode: injection.errorCode,
      });
      routeToManualReview(dispatch, request, injection.errorCode!, 1);
      return;
    }

    // Retryable failure: retry with compressed backoff, then escalate.
    if (injection?.retryable) {
      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        await sleep(RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]);
        const isLast = attempt === MAX_RETRY_ATTEMPTS;
        if (!isLast) {
          dispatch({ type: 'SET_INTEGRATION_STATUS', paymentRequestId: request.paymentRequestId, status: 'Retrying' });
          emitEvent(dispatch, {
            request,
            operation: step.operation,
            result: 'RETRY',
            attemptNumber: attempt,
            message: `Attempt ${attempt} failed — retrying`,
            errorCode: injection.errorCode,
          });
        } else {
          emitEvent(dispatch, {
            request,
            operation: step.operation,
            result: 'FAILURE',
            attemptNumber: attempt,
            message: `Attempt ${attempt} failed — retry limit reached`,
            errorCode: injection.errorCode,
          });
        }
      }
      routeToManualReview(dispatch, request, injection.errorCode!, MAX_RETRY_ATTEMPTS);
      return;
    }

    // No injection targets this step. Still surface a defensive-validation failure if one
    // exists and we've reached the step that would have caught it.
    if (defensiveFailure && stepCatchesCode(step.operation, defensiveFailure)) {
      await sleep(randomStepDelay());
      emitEvent(dispatch, {
        request,
        operation: step.operation,
        result: 'FAILURE',
        attemptNumber: 1,
        message: STEP_FAILURE_LABELS[step.operation] ?? `${step.label} — failed`,
        errorCode: defensiveFailure,
      });
      routeToManualReview(dispatch, request, defensiveFailure, 1);
      return;
    }

    await sleep(randomStepDelay());

    if (step.operation === 'CREATE_VENDOR_BILL') {
      const bill = buildVendorBill(request);
      emitEvent(dispatch, {
        request,
        operation: step.operation,
        result: 'SUCCESS',
        attemptNumber: 1,
        message: step.label,
        targetSystem: 'ERP',
        targetRecordId: bill.internalId,
      });
      dispatch({ type: 'CREATE_ERP_BILL', bill, paymentRequestId: request.paymentRequestId });
    } else if (step.operation === 'UPDATE_CRM_STATUS') {
      emitEvent(dispatch, {
        request,
        operation: step.operation,
        result: 'SUCCESS',
        attemptNumber: 1,
        message: step.label,
        sourceSystem: 'ERP',
        targetSystem: 'CRM',
      });
    } else {
      emitEvent(dispatch, { request, operation: step.operation, result: 'SUCCESS', attemptNumber: 1, message: step.label });
    }
  }

  dispatch({ type: 'SET_INTEGRATION_STATUS', paymentRequestId: request.paymentRequestId, status: 'Completed' });
}

function stepCatchesCode(operation: (typeof INTEGRATION_STEPS)[number]['operation'], code: ValidationFailureCode): boolean {
  switch (operation) {
    case 'VALIDATE_SCHEMA':
      return ['MISSING_REQUEST_ID', 'REQUEST_NOT_APPROVED', 'INVALID_AMOUNT', 'UNSUPPORTED_CURRENCY', 'MISSING_DOCUMENTATION', 'MISSING_APPROVAL'].includes(code);
    case 'VALIDATE_PAYEE':
      return ['MISSING_VENDOR_MAPPING', 'PAYEE_NOT_PAYABLE'].includes(code);
    case 'VALIDATE_ACCOUNTING':
      return code === 'INVALID_ACCOUNTING_MAPPING';
    default:
      return false;
  }
}
