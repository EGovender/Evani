// Sequence counters start just past the highest number used by the seed dataset
// (src/data/seed.ts) so IDs created during a live session never collide with seeded IDs.

let paymentRequestSeq = 493;
let documentNumberSeq = 10885;
let internalIdSeq = 984226;
let exceptionSeq = 1008;
let crmAccountSeq = 10600;
let erpVendorSeq = 3900;
let documentIdSeq = 78400;

export function nextPaymentRequestId(): string {
  return `PAY-2026-${String(paymentRequestSeq++).padStart(5, '0')}`;
}

export function nextDocumentNumber(): string {
  return `VB-2026-${documentNumberSeq++}`;
}

export function nextInternalId(): string {
  return String(internalIdSeq++);
}

export function nextExceptionId(): string {
  return `EXC-${exceptionSeq++}`;
}

export function nextEventId(): string {
  return `EVT-${crypto.randomUUID().slice(0, 8)}`;
}

export function newCorrelationId(): string {
  return crypto.randomUUID();
}

export function nextCrmAccountId(): string {
  return `ACC-${crmAccountSeq++}`;
}

export function nextErpVendorId(): string {
  return `VEND-${erpVendorSeq++}`;
}

export function nextDocumentId(): string {
  return `DOC-${documentIdSeq++}`;
}
