import type { AuditEvent, ErpVendorBill, PaymentRequest } from '../types/domain';

// Maps the app's internal camelCase domain model back to the exact snake_case JSON
// shapes shown in docs/workflows/crm-to-erp-payment-request.md, for a "View raw payload"
// panel — a visible, literal tie between the interactive app and the documented example.

export function toDocRequestPayload(request: PaymentRequest) {
  return {
    payment_request_id: request.paymentRequestId,
    correlation_id: request.correlationId,
    request_status: request.businessStatus,
    payee: {
      crm_account_id: request.payee.crmAccountId,
      legal_name: request.payee.legalName,
      erp_vendor_id: request.payee.erpVendorId ?? null,
      payability_status: request.payee.payabilityStatus,
    },
    payment: {
      amount: request.payment.amount,
      currency: request.payment.currency,
      requested_payment_date: request.payment.requestedPaymentDate,
      memo: request.payment.memo,
    },
    accounting: {
      subsidiary_code: request.accounting.subsidiaryCode,
      department_code: request.accounting.departmentCode,
      program_code: request.accounting.programCode,
      expense_account: request.accounting.expenseAccount,
    },
    approval: request.approval
      ? { approved_by: request.approval.approvedBy, approved_at: request.approval.approvedAt }
      : null,
    documents: request.documents.map((d) => ({ document_id: d.documentId, document_type: d.documentType })),
  };
}

export function toDocIntegrationResponse(request: PaymentRequest, bill?: ErpVendorBill) {
  return {
    payment_request_id: request.paymentRequestId,
    correlation_id: request.correlationId,
    processing_status: request.integrationStatus,
    erp_transaction: bill
      ? {
          transaction_type: 'VendorBill',
          internal_id: bill.internalId,
          document_number: bill.documentNumber,
          status: bill.status,
        }
      : null,
  };
}

export function toDocAuditEvent(event: AuditEvent) {
  return {
    event_id: event.eventId,
    correlation_id: event.correlationId,
    source_system: event.sourceSystem,
    source_record_id: event.sourceRecordId,
    target_system: event.targetSystem,
    target_record_id: event.targetRecordId,
    operation: event.operation,
    attempt_number: event.attemptNumber,
    result: event.result,
    occurred_at: event.occurredAt,
  };
}
