import type { AuditEvent } from '../types/domain';

export type IntegrationStepOperation = Extract<
  AuditEvent['operation'],
  | 'AUTHENTICATE_REQUEST'
  | 'VALIDATE_SCHEMA'
  | 'VALIDATE_PAYEE'
  | 'VALIDATE_ACCOUNTING'
  | 'CHECK_DUPLICATE'
  | 'CREATE_VENDOR_BILL'
  | 'UPDATE_CRM_STATUS'
>;

export interface IntegrationStep {
  operation: IntegrationStepOperation;
  label: string; // exact wording from the product spec, shown in IntegrationConsole
}

// The 7 visible processing steps, in order, exactly as listed in the product spec's
// "Integration processing" section.
export const INTEGRATION_STEPS: IntegrationStep[] = [
  { operation: 'AUTHENTICATE_REQUEST', label: 'Request authenticated' },
  { operation: 'VALIDATE_SCHEMA', label: 'JSON schema validated' },
  { operation: 'VALIDATE_PAYEE', label: 'Payee confirmed payable' },
  { operation: 'VALIDATE_ACCOUNTING', label: 'Accounting mappings validated' },
  { operation: 'CHECK_DUPLICATE', label: 'Duplicate check completed' },
  { operation: 'CREATE_VENDOR_BILL', label: 'ERP vendor bill created' },
  { operation: 'UPDATE_CRM_STATUS', label: 'CRM updated with ERP transaction ID' },
];
