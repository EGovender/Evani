import type {
  ErpVendorBill,
  PaymentRequest,
  ReconciliationCategory,
  ReconciliationSummary,
  SupportException,
} from '../types/domain';

// Implements the reconciliation controls from docs/workflows/crm-to-erp-payment-request.md:
// approved requests without ERP IDs, ERP bills without CRM external IDs, duplicate external
// IDs, amount comparison, and status comparison.
export function runReconciliation(
  requests: PaymentRequest[],
  erpBills: ErpVendorBill[],
  exceptions: SupportException[],
): ReconciliationSummary {
  const categorized: Record<ReconciliationCategory, string[]> = {
    Matched: [],
    'Missing in ERP': [],
    'Missing in CRM': [],
    'Amount mismatch': [],
    Duplicate: [],
    'Status mismatch': [],
  };

  const approvedRequests = requests.filter((r) => r.businessStatus === 'Approved');

  const billsByExternalId = new Map<string, ErpVendorBill[]>();
  for (const bill of erpBills) {
    const list = billsByExternalId.get(bill.externalId) ?? [];
    list.push(bill);
    billsByExternalId.set(bill.externalId, list);
  }

  let amountDifference = 0;

  for (const request of approvedRequests) {
    const bills = billsByExternalId.get(request.paymentRequestId) ?? [];

    if (bills.length === 0) {
      categorized['Missing in ERP'].push(request.paymentRequestId);
      amountDifference += request.payment.amount;
      continue;
    }

    if (bills.length > 1) {
      categorized.Duplicate.push(request.paymentRequestId);
      const [, ...extraBills] = bills;
      amountDifference += extraBills.reduce((sum, b) => sum + b.amount, 0);
      continue;
    }

    const [bill] = bills;

    if (bill.amount !== request.payment.amount) {
      categorized['Amount mismatch'].push(request.paymentRequestId);
      amountDifference += Math.abs(bill.amount - request.payment.amount);
      continue;
    }

    const crmExpectsClosed = request.integrationStatus === 'Completed';
    const erpIsVoided = bill.status === 'Voided';
    if (crmExpectsClosed && erpIsVoided) {
      categorized['Status mismatch'].push(request.paymentRequestId);
      continue;
    }

    categorized.Matched.push(request.paymentRequestId);
  }

  const knownRequestIds = new Set(requests.map((r) => r.paymentRequestId));
  for (const bill of erpBills) {
    if (!knownRequestIds.has(bill.externalId)) {
      categorized['Missing in CRM'].push(bill.externalId);
      amountDifference += bill.amount;
    }
  }

  const openExceptions = exceptions.filter((e) => e.status !== 'Resolved');

  return {
    approvedCrmRequests: approvedRequests.length,
    erpBillsCreated: erpBills.length,
    matchedRecords: categorized.Matched.length,
    exceptions: openExceptions.length,
    amountDifference,
    categorized,
    runAt: new Date().toISOString(),
  };
}
