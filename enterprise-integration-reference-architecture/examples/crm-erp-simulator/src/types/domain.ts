// Status vocabularies mirror docs/workflows/crm-to-erp-payment-request.md exactly.
// Business status, integration status, and ERP status are kept as separate fields on
// purpose — combining them into one field is called out in the docs as an anti-pattern.

export type BusinessStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Cancelled';

export type IntegrationStatus =
  | 'Not Started'
  | 'Queued'
  | 'Validating'
  | 'Processing'
  | 'Completed'
  | 'Retrying'
  | 'Failed'
  | 'Manual Review';

export type ErpStatus = 'Pending Approval' | 'Open' | 'Scheduled for Payment' | 'Paid' | 'Voided';

// The first nine codes are exactly the failure codes from the workflow doc's Validation
// Rules table. The last four are engine-only additions for failure-injection modes that
// the doc's validation table doesn't cover (auth/availability/timeout/locking).
export type ValidationFailureCode =
  | 'MISSING_REQUEST_ID'
  | 'REQUEST_NOT_APPROVED'
  | 'INVALID_AMOUNT'
  | 'UNSUPPORTED_CURRENCY'
  | 'MISSING_VENDOR_MAPPING'
  | 'PAYEE_NOT_PAYABLE'
  | 'INVALID_ACCOUNTING_MAPPING'
  | 'MISSING_DOCUMENTATION'
  | 'MISSING_APPROVAL'
  | 'AUTH_FAILURE'
  | 'ERP_UNAVAILABLE'
  | 'API_TIMEOUT'
  | 'RECORD_LOCKED';

export interface Payee {
  crmAccountId: string;
  legalName: string;
  erpVendorId?: string;
  payabilityStatus: 'Payable' | 'Not Payable';
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  requestedPaymentDate: string;
  memo: string;
}

export interface Accounting {
  subsidiaryCode: string;
  departmentCode: string;
  programCode: string;
  expenseAccount: string;
}

export interface Approval {
  approvedBy: string;
  approvedAt: string;
}

export interface DocumentRef {
  documentId: string;
  documentType: string;
}

export type FailureInjectionMode =
  | 'NONE'
  | 'INVALID_ACCOUNTING_MAPPING'
  | 'PAYEE_NOT_PAYABLE'
  | 'MISSING_VENDOR_ID'
  | 'DUPLICATE_REQUEST'
  | 'ERP_UNAVAILABLE'
  | 'AUTHENTICATION_FAILURE'
  | 'API_TIMEOUT'
  | 'RECORD_LOCKED';

export interface PaymentRequest {
  paymentRequestId: string; // PAY-2026-#####
  correlationId: string; // uuid v4, carried through every downstream audit event
  businessStatus: BusinessStatus;
  integrationStatus: IntegrationStatus;
  erpTransactionId?: string; // links to ErpVendorBill.internalId once created
  payee: Payee;
  payment: PaymentDetails;
  accounting: Accounting;
  approval?: Approval;
  documents: DocumentRef[];
  businessJustification: string;
  department: string;
  program: string;
  failureInjection?: FailureInjectionMode;
}

export interface ErpVendorBill {
  internalId: string; // e.g. "984215"
  documentNumber: string; // VB-2026-#####
  externalId: string; // = paymentRequestId, the idempotency key
  vendorLegalName: string;
  amount: number;
  currency: string;
  status: ErpStatus;
}

export interface AuditEvent {
  eventId: string; // EVT-<8 hex chars>
  correlationId: string;
  sourceSystem: 'CRM' | 'ERP' | 'Integration Service' | 'Monitoring Platform';
  sourceRecordId: string;
  targetSystem: 'CRM' | 'ERP' | 'Integration Service' | 'Monitoring Platform';
  targetRecordId: string;
  operation:
    | 'AUTHENTICATE_REQUEST'
    | 'VALIDATE_SCHEMA'
    | 'VALIDATE_PAYEE'
    | 'VALIDATE_ACCOUNTING'
    | 'CHECK_DUPLICATE'
    | 'CREATE_VENDOR_BILL'
    | 'UPDATE_CRM_STATUS'
    | 'REQUEST_APPROVED'
    | 'REQUEST_SUBMITTED'
    | 'REQUEST_REJECTED'
    | 'REQUEST_CANCELLED'
    | 'EXCEPTION_CREATED'
    | 'EXCEPTION_REPROCESSED'
    | 'ERP_STATUS_ADVANCED';
  attemptNumber: number;
  result: 'SUCCESS' | 'FAILURE' | 'RETRY';
  occurredAt: string; // ISO 8601
  message?: string;
  errorCode?: ValidationFailureCode;
}

export type ExceptionStatus = 'Open' | 'Needs correction' | 'Resolved';

export interface SupportException {
  exceptionId: string; // EXC-####
  paymentRequestId: string;
  errorCode: ValidationFailureCode;
  errorMessage: string;
  attempts: number;
  status: ExceptionStatus;
  createdAt: string;
}

export type ReconciliationCategory =
  | 'Matched'
  | 'Missing in ERP'
  | 'Missing in CRM'
  | 'Amount mismatch'
  | 'Duplicate'
  | 'Status mismatch';

export interface ReconciliationSummary {
  approvedCrmRequests: number;
  erpBillsCreated: number;
  matchedRecords: number;
  exceptions: number;
  amountDifference: number;
  categorized: Record<ReconciliationCategory, string[]>; // paymentRequestIds per bucket
  runAt: string;
}
