import type { Accounting, Payee, PaymentRequest, ValidationFailureCode } from '../types/domain';

const SUPPORTED_CURRENCIES = ['USD'];

// Mirrors the fictional NSCF chart of accounts implied by the sample data in
// docs/workflows/crm-to-erp-payment-request.md and sample-data/payment-request.json.
export const NSCF_PROGRAMS: { code: string; label: string; expenseAccount: string }[] = [
  { code: 'YOUTH-ACCESS', label: 'Youth Access', expenseAccount: '6100' },
  { code: 'FAMILY-SUPPORT', label: 'Family Support', expenseAccount: '6110' },
  { code: 'SENIOR-SERVICES', label: 'Senior Services', expenseAccount: '6120' },
  { code: 'EDUCATION', label: 'Education', expenseAccount: '6130' },
  { code: 'NUTRITION', label: 'Nutrition', expenseAccount: '6140' },
  { code: 'HOUSING', label: 'Housing', expenseAccount: '6150' },
];

const VALID_PROGRAM_CODES_BY_SUBSIDIARY: Record<string, string[]> = {
  NSCF: NSCF_PROGRAMS.map((p) => p.code),
};

// Exact failure codes from the workflow doc's "Validation Rules" table, plus the four
// engine-only codes used by failure-injection modes the doc's table doesn't cover.
export const FAILURE_CODE_MESSAGES: Record<ValidationFailureCode, string> = {
  MISSING_REQUEST_ID: 'Payment request ID is required.',
  REQUEST_NOT_APPROVED: 'Request status must be Approved before it can be sent to the ERP.',
  INVALID_AMOUNT: 'Amount must be greater than zero.',
  UNSUPPORTED_CURRENCY: 'Currency is not supported.',
  MISSING_VENDOR_MAPPING: 'No ERP vendor mapping exists for this payee.',
  PAYEE_NOT_PAYABLE: 'Payee failed compliance or onboarding checks and is not payable.',
  INVALID_ACCOUNTING_MAPPING: 'Program code is not valid for the subsidiary.',
  MISSING_DOCUMENTATION: 'At least one supporting document is required.',
  MISSING_APPROVAL: 'Approval timestamp is missing.',
  AUTH_FAILURE: 'Integration service account credentials were rejected.',
  ERP_UNAVAILABLE: 'ERP unavailable — retry limit reached.',
  API_TIMEOUT: 'ERP did not respond within the expected time — retry limit reached.',
  RECORD_LOCKED: 'Target ERP record is locked by another process — retry limit reached.',
};

export function validateSchema(request: PaymentRequest): ValidationFailureCode | null {
  if (!request.paymentRequestId) return 'MISSING_REQUEST_ID';
  if (request.businessStatus !== 'Approved') return 'REQUEST_NOT_APPROVED';
  if (!(request.payment.amount > 0)) return 'INVALID_AMOUNT';
  if (!SUPPORTED_CURRENCIES.includes(request.payment.currency)) return 'UNSUPPORTED_CURRENCY';
  if (request.documents.length === 0) return 'MISSING_DOCUMENTATION';
  if (!request.approval) return 'MISSING_APPROVAL';
  return null;
}

export function validatePayee(payee: Payee): ValidationFailureCode | null {
  if (!payee.erpVendorId) return 'MISSING_VENDOR_MAPPING';
  if (payee.payabilityStatus !== 'Payable') return 'PAYEE_NOT_PAYABLE';
  return null;
}

export function validateAccounting(accounting: Accounting): ValidationFailureCode | null {
  const validPrograms = VALID_PROGRAM_CODES_BY_SUBSIDIARY[accounting.subsidiaryCode];
  if (!validPrograms?.includes(accounting.programCode)) return 'INVALID_ACCOUNTING_MAPPING';
  if (!accounting.departmentCode || !accounting.expenseAccount) return 'INVALID_ACCOUNTING_MAPPING';
  return null;
}
