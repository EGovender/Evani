import type {
  AuditEvent,
  ErpVendorBill,
  PaymentRequest,
  SupportException,
} from '../types/domain';

// Extends the fictional universe already established in
// docs/workflows/crm-to-erp-payment-request.md (Northstar Community Foundation /
// Harbor Youth Services) with five more payees in the same style, so the app reads
// as a "live" version of the documented example rather than an unrelated scenario.
//
// The 12 requests below are engineered so the reconciliation dashboard reproduces the
// product spec's example numbers exactly on first load, with no user interaction:
//   Approved CRM requests: 12 · ERP bills created: 11 · Matched records: 10
//   Exceptions: 1 · Amount difference: $12,500
//
// #1-#10  -> fully matched, spread across ERP statuses
// #11     -> ERP bill created but its status diverges from what CRM expects
//            (bucketed as "Status mismatch", not "Matched"; $0 amount delta)
// #12     -> approved in CRM, ERP unavailable exhausted retries, no bill created
//            (bucketed as "Missing in ERP"; its $12,500 is the sole contributor
//            to the headline "Amount difference" figure)

const approval = (approvedBy: string, approvedAt: string) => ({ approvedBy, approvedAt });

const doc = (documentId: string, documentType = 'Approval Letter') => [{ documentId, documentType }];

export const seedPaymentRequests: PaymentRequest[] = [
  {
    paymentRequestId: 'PAY-2026-00481',
    correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984215',
    payee: { crmAccountId: 'ACC-10492', legalName: 'Harbor Youth Services', erpVendorId: 'VEND-3814', payabilityStatus: 'Payable' },
    payment: { amount: 12500, currency: 'USD', requestedPaymentDate: '2026-08-15', memo: 'Community program installment 2 of 4' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'YOUTH-ACCESS', expenseAccount: '6100' },
    approval: approval('USR-2207', '2026-08-10T18:42:12Z'),
    documents: doc('DOC-78145'),
    businessJustification: 'Second of four installments for the Youth Access after-school program.',
    department: 'Programs',
    program: 'Youth Access',
  },
  {
    paymentRequestId: 'PAY-2026-00482',
    correlationId: '4a2f5b3e-9c1d-4e6a-8b2f-7d3e9c5a1f60',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984216',
    payee: { crmAccountId: 'ACC-10501', legalName: 'Riverside Family Center', erpVendorId: 'VEND-3822', payabilityStatus: 'Payable' },
    payment: { amount: 8200, currency: 'USD', requestedPaymentDate: '2026-08-18', memo: 'Family counseling services, Q3' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'FAMILY-SUPPORT', expenseAccount: '6110' },
    approval: approval('USR-2207', '2026-08-11T09:15:04Z'),
    documents: doc('DOC-78201'),
    businessJustification: 'Quarterly family counseling services contract payment.',
    department: 'Programs',
    program: 'Family Support',
  },
  {
    paymentRequestId: 'PAY-2026-00483',
    correlationId: 'e7c1a9d4-2b6f-4a83-9e5c-1d8b4f2a7c33',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984217',
    payee: { crmAccountId: 'ACC-10512', legalName: 'Lakeside Senior Outreach', erpVendorId: 'VEND-3830', payabilityStatus: 'Payable' },
    payment: { amount: 5400, currency: 'USD', requestedPaymentDate: '2026-08-20', memo: 'Senior transportation program' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'SENIOR-SERVICES', expenseAccount: '6120' },
    approval: approval('USR-2214', '2026-08-11T14:02:47Z'),
    documents: doc('DOC-78219'),
    businessJustification: 'Monthly senior transportation program funding.',
    department: 'Programs',
    program: 'Senior Services',
  },
  {
    paymentRequestId: 'PAY-2026-00484',
    correlationId: '9d3f6a1c-5e28-4b7d-a1c9-3f7e8b2d5a94',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984218',
    payee: { crmAccountId: 'ACC-10520', legalName: 'Bright Path Learning Collective', erpVendorId: 'VEND-3841', payabilityStatus: 'Payable' },
    payment: { amount: 30000, currency: 'USD', requestedPaymentDate: '2026-08-22', memo: 'Annual literacy program grant, tranche 1' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'EDUCATION', expenseAccount: '6130' },
    approval: approval('USR-2214', '2026-08-12T11:30:00Z'),
    documents: doc('DOC-78233'),
    businessJustification: 'First tranche of the annual literacy program grant.',
    department: 'Programs',
    program: 'Education',
  },
  {
    paymentRequestId: 'PAY-2026-00485',
    correlationId: '2b8e4f7a-1c9d-4a6e-8b3f-5d2a9c7e1f48',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984219',
    payee: { crmAccountId: 'ACC-10531', legalName: 'Cedar Grove Youth Alliance', erpVendorId: 'VEND-3852', payabilityStatus: 'Payable' },
    payment: { amount: 6750, currency: 'USD', requestedPaymentDate: '2026-08-24', memo: 'Summer mentorship program' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'YOUTH-ACCESS', expenseAccount: '6100' },
    approval: approval('USR-2207', '2026-08-12T16:48:22Z'),
    documents: doc('DOC-78247'),
    businessJustification: 'Summer mentorship program stipends and supplies.',
    department: 'Programs',
    program: 'Youth Access',
  },
  {
    paymentRequestId: 'PAY-2026-00486',
    correlationId: '6f1a3d9c-8b2e-4f75-9a1d-7c3e5b8f2a61',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984220',
    payee: { crmAccountId: 'ACC-10542', legalName: 'Union Street Community Kitchen', erpVendorId: 'VEND-3860', payabilityStatus: 'Payable' },
    payment: { amount: 4000, currency: 'USD', requestedPaymentDate: '2026-08-26', memo: 'Weekly meal program supplies' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'NUTRITION', expenseAccount: '6140' },
    approval: approval('USR-2214', '2026-08-13T08:55:31Z'),
    documents: doc('DOC-78255'),
    businessJustification: 'Weekly meal program supplies and staffing.',
    department: 'Programs',
    program: 'Nutrition',
  },
  {
    paymentRequestId: 'PAY-2026-00487',
    correlationId: 'a4e7c2f9-3d6b-4e81-9f2c-8a5d1b7e4c93',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984221',
    payee: { crmAccountId: 'ACC-10553', legalName: 'Willow Creek Housing Partners', erpVendorId: 'VEND-3871', payabilityStatus: 'Payable' },
    payment: { amount: 18300, currency: 'USD', requestedPaymentDate: '2026-08-28', memo: 'Emergency housing assistance fund' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'HOUSING', expenseAccount: '6150' },
    approval: approval('USR-2207', '2026-08-13T13:20:10Z'),
    documents: doc('DOC-78266'),
    businessJustification: 'Emergency housing assistance fund replenishment.',
    department: 'Programs',
    program: 'Housing',
  },
  {
    paymentRequestId: 'PAY-2026-00488',
    correlationId: 'c8b3f6a1-7e9d-4c25-8b1f-4a7c9e2d6b58',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984222',
    payee: { crmAccountId: 'ACC-10492', legalName: 'Harbor Youth Services', erpVendorId: 'VEND-3814', payabilityStatus: 'Payable' },
    payment: { amount: 2100, currency: 'USD', requestedPaymentDate: '2026-08-29', memo: 'Field trip transportation' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'YOUTH-ACCESS', expenseAccount: '6100' },
    approval: approval('USR-2214', '2026-08-14T09:05:55Z'),
    documents: doc('DOC-78279'),
    businessJustification: 'Field trip transportation for the Youth Access cohort.',
    department: 'Programs',
    program: 'Youth Access',
  },
  {
    paymentRequestId: 'PAY-2026-00489',
    correlationId: 'f2d9a5c8-1b6e-4d73-9c8f-2b5a7e1d9c46',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984223',
    payee: { crmAccountId: 'ACC-10501', legalName: 'Riverside Family Center', erpVendorId: 'VEND-3822', payabilityStatus: 'Payable' },
    payment: { amount: 9900, currency: 'USD', requestedPaymentDate: '2026-08-30', memo: 'Family counseling services, Q4 prepay' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'FAMILY-SUPPORT', expenseAccount: '6110' },
    approval: approval('USR-2207', '2026-08-14T15:40:02Z'),
    documents: doc('DOC-78288'),
    businessJustification: 'Advance payment for Q4 family counseling services.',
    department: 'Programs',
    program: 'Family Support',
  },
  {
    paymentRequestId: 'PAY-2026-00490',
    correlationId: '5a1e8c3f-9d2b-4f64-8a7c-1e9d3b5f8c27',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984224',
    payee: { crmAccountId: 'ACC-10512', legalName: 'Lakeside Senior Outreach', erpVendorId: 'VEND-3830', payabilityStatus: 'Payable' },
    payment: { amount: 3300, currency: 'USD', requestedPaymentDate: '2026-09-01', memo: 'Senior wellness check-ins' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'SENIOR-SERVICES', expenseAccount: '6120' },
    approval: approval('USR-2214', '2026-08-15T10:12:38Z'),
    documents: doc('DOC-78302'),
    businessJustification: 'Monthly senior wellness check-in program.',
    department: 'Programs',
    program: 'Senior Services',
  },
  // #11 — ERP bill exists but its status has diverged from what CRM expects
  // (Status mismatch, not Matched). Amount is identical on both sides, so this
  // contributes $0 to the reconciliation "Amount difference" figure.
  {
    paymentRequestId: 'PAY-2026-00491',
    correlationId: '8e4c1f7a-3b9d-4e52-8c1f-6a3e9b7d2c85',
    businessStatus: 'Approved',
    integrationStatus: 'Completed',
    erpTransactionId: '984225',
    payee: { crmAccountId: 'ACC-10520', legalName: 'Bright Path Learning Collective', erpVendorId: 'VEND-3841', payabilityStatus: 'Payable' },
    payment: { amount: 15000, currency: 'USD', requestedPaymentDate: '2026-09-03', memo: 'Annual literacy program grant, tranche 2' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'EDUCATION', expenseAccount: '6130' },
    approval: approval('USR-2207', '2026-08-16T12:25:19Z'),
    documents: doc('DOC-78315'),
    businessJustification: 'Second tranche of the annual literacy program grant.',
    department: 'Programs',
    program: 'Education',
  },
  // #12 — Approved in CRM, but the ERP was unavailable through all retry attempts.
  // No vendor bill exists (Missing in ERP). Paired with the seeded EXC-1007 below.
  {
    paymentRequestId: 'PAY-2026-00492',
    correlationId: '1c6f9a4d-7e2b-4c86-9f1a-5d8c3e7b2f19',
    businessStatus: 'Approved',
    integrationStatus: 'Manual Review',
    payee: { crmAccountId: 'ACC-10531', legalName: 'Cedar Grove Youth Alliance', erpVendorId: 'VEND-3852', payabilityStatus: 'Payable' },
    payment: { amount: 12500, currency: 'USD', requestedPaymentDate: '2026-09-05', memo: 'Fall mentorship program installment 1 of 3' },
    accounting: { subsidiaryCode: 'NSCF', departmentCode: 'PROGRAMS', programCode: 'YOUTH-ACCESS', expenseAccount: '6100' },
    approval: approval('USR-2214', '2026-08-17T17:58:44Z'),
    documents: doc('DOC-78329'),
    businessJustification: 'First installment of the fall mentorship program.',
    department: 'Programs',
    program: 'Youth Access',
    failureInjection: 'ERP_UNAVAILABLE',
  },
];

export const seedErpBills: ErpVendorBill[] = [
  { internalId: '984215', documentNumber: 'VB-2026-10874', externalId: 'PAY-2026-00481', vendorLegalName: 'Harbor Youth Services', amount: 12500, currency: 'USD', status: 'Paid' },
  { internalId: '984216', documentNumber: 'VB-2026-10875', externalId: 'PAY-2026-00482', vendorLegalName: 'Riverside Family Center', amount: 8200, currency: 'USD', status: 'Paid' },
  { internalId: '984217', documentNumber: 'VB-2026-10876', externalId: 'PAY-2026-00483', vendorLegalName: 'Lakeside Senior Outreach', amount: 5400, currency: 'USD', status: 'Scheduled for Payment' },
  { internalId: '984218', documentNumber: 'VB-2026-10877', externalId: 'PAY-2026-00484', vendorLegalName: 'Bright Path Learning Collective', amount: 30000, currency: 'USD', status: 'Scheduled for Payment' },
  { internalId: '984219', documentNumber: 'VB-2026-10878', externalId: 'PAY-2026-00485', vendorLegalName: 'Cedar Grove Youth Alliance', amount: 6750, currency: 'USD', status: 'Open' },
  { internalId: '984220', documentNumber: 'VB-2026-10879', externalId: 'PAY-2026-00486', vendorLegalName: 'Union Street Community Kitchen', amount: 4000, currency: 'USD', status: 'Open' },
  { internalId: '984221', documentNumber: 'VB-2026-10880', externalId: 'PAY-2026-00487', vendorLegalName: 'Willow Creek Housing Partners', amount: 18300, currency: 'USD', status: 'Pending Approval' },
  { internalId: '984222', documentNumber: 'VB-2026-10881', externalId: 'PAY-2026-00488', vendorLegalName: 'Harbor Youth Services', amount: 2100, currency: 'USD', status: 'Pending Approval' },
  { internalId: '984223', documentNumber: 'VB-2026-10882', externalId: 'PAY-2026-00489', vendorLegalName: 'Riverside Family Center', amount: 9900, currency: 'USD', status: 'Open' },
  { internalId: '984224', documentNumber: 'VB-2026-10883', externalId: 'PAY-2026-00490', vendorLegalName: 'Lakeside Senior Outreach', amount: 3300, currency: 'USD', status: 'Paid' },
  // #11's bill: CRM shows the request as Completed, but the ERP later voided the bill —
  // a status divergence the reconciliation engine buckets separately from "Matched".
  { internalId: '984225', documentNumber: 'VB-2026-10884', externalId: 'PAY-2026-00491', vendorLegalName: 'Bright Path Learning Collective', amount: 15000, currency: 'USD', status: 'Voided' },
];

export const seedExceptions: SupportException[] = [
  {
    exceptionId: 'EXC-1007',
    paymentRequestId: 'PAY-2026-00492',
    errorCode: 'ERP_UNAVAILABLE',
    errorMessage: 'ERP unavailable — retry limit reached after 3 attempts.',
    attempts: 3,
    status: 'Needs correction',
    createdAt: '2026-08-17T18:05:30Z',
  },
];

let seedEventSeq = 0;
const evt = (
  overrides: Partial<AuditEvent> & Pick<AuditEvent, 'correlationId' | 'sourceRecordId' | 'targetRecordId' | 'operation' | 'result' | 'occurredAt'>,
): AuditEvent => ({
  eventId: `EVT-seed${String(seedEventSeq++).padStart(4, '0')}`,
  sourceSystem: 'CRM',
  targetSystem: 'Integration Service',
  attemptNumber: 1,
  ...overrides,
});

export const seedEvents: AuditEvent[] = [
  // Request #1 — the canonical doc example, full happy path.
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: 'PAY-2026-00481', targetRecordId: 'PAY-2026-00481', operation: 'REQUEST_APPROVED', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:12Z', message: 'Payment request approved', sourceSystem: 'CRM', targetSystem: 'CRM' }),
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: 'PAY-2026-00481', targetRecordId: 'PAY-2026-00481', operation: 'AUTHENTICATE_REQUEST', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:13Z', message: 'Integration request received' }),
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: 'PAY-2026-00481', targetRecordId: 'PAY-2026-00481', operation: 'VALIDATE_SCHEMA', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:13Z', message: 'Validation completed' }),
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: 'PAY-2026-00481', targetRecordId: 'VEND-3814', operation: 'VALIDATE_PAYEE', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:13Z', message: 'Payee confirmed payable' }),
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: 'PAY-2026-00481', targetRecordId: 'PAY-2026-00481', operation: 'VALIDATE_ACCOUNTING', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:14Z', message: 'Accounting mappings validated' }),
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: 'PAY-2026-00481', targetRecordId: 'PAY-2026-00481', operation: 'CHECK_DUPLICATE', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:14Z', message: 'Duplicate check completed' }),
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: 'PAY-2026-00481', targetRecordId: '984215', operation: 'CREATE_VENDOR_BILL', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:15Z', message: 'ERP vendor bill created', targetSystem: 'ERP' }),
  evt({ correlationId: '31ed5e48-df47-4e8f-8d8c-261916cd942a', sourceRecordId: '984215', targetRecordId: 'PAY-2026-00481', operation: 'UPDATE_CRM_STATUS', result: 'SUCCESS', occurredAt: '2026-08-10T18:42:15Z', message: 'CRM status updated', sourceSystem: 'ERP', targetSystem: 'CRM' }),
  // Request #12 — ERP unavailable through all retries, exception created.
  evt({ correlationId: '1c6f9a4d-7e2b-4c86-9f1a-5d8c3e7b2f19', sourceRecordId: 'PAY-2026-00492', targetRecordId: 'PAY-2026-00492', operation: 'REQUEST_APPROVED', result: 'SUCCESS', occurredAt: '2026-08-17T17:58:44Z', message: 'Payment request approved', sourceSystem: 'CRM', targetSystem: 'CRM' }),
  evt({ correlationId: '1c6f9a4d-7e2b-4c86-9f1a-5d8c3e7b2f19', sourceRecordId: 'PAY-2026-00492', targetRecordId: 'PAY-2026-00492', operation: 'CREATE_VENDOR_BILL', result: 'RETRY', occurredAt: '2026-08-17T18:05:12Z', message: 'Attempt 1 failed — retrying', errorCode: 'ERP_UNAVAILABLE', attemptNumber: 1, targetSystem: 'ERP' }),
  evt({ correlationId: '1c6f9a4d-7e2b-4c86-9f1a-5d8c3e7b2f19', sourceRecordId: 'PAY-2026-00492', targetRecordId: 'PAY-2026-00492', operation: 'CREATE_VENDOR_BILL', result: 'RETRY', occurredAt: '2026-08-17T18:05:19Z', message: 'Attempt 2 failed — retrying', errorCode: 'ERP_UNAVAILABLE', attemptNumber: 2, targetSystem: 'ERP' }),
  evt({ correlationId: '1c6f9a4d-7e2b-4c86-9f1a-5d8c3e7b2f19', sourceRecordId: 'PAY-2026-00492', targetRecordId: 'PAY-2026-00492', operation: 'CREATE_VENDOR_BILL', result: 'FAILURE', occurredAt: '2026-08-17T18:05:27Z', message: 'Attempt 3 failed — retry limit reached', errorCode: 'ERP_UNAVAILABLE', attemptNumber: 3, targetSystem: 'ERP' }),
  evt({ correlationId: '1c6f9a4d-7e2b-4c86-9f1a-5d8c3e7b2f19', sourceRecordId: 'PAY-2026-00492', targetRecordId: 'PAY-2026-00492', operation: 'EXCEPTION_CREATED', result: 'FAILURE', occurredAt: '2026-08-17T18:05:30Z', message: 'Support exception EXC-1007 created', errorCode: 'ERP_UNAVAILABLE', attemptNumber: 3, sourceSystem: 'Integration Service', targetSystem: 'Monitoring Platform' }),
];
