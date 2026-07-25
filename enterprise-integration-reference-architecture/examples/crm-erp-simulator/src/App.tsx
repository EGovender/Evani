import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import { useSimulator } from './state/useSimulator';
import PaymentRequestForm from './components/crm/PaymentRequestForm';
import PaymentRequestList from './components/crm/PaymentRequestList';
import PaymentRequestDetail from './components/crm/PaymentRequestDetail';
import ErpBillList from './components/erp/ErpBillList';
import ErpBillDetail from './components/erp/ErpBillDetail';
import ExceptionQueueTable from './components/exceptions/ExceptionQueueTable';
import ExceptionDetail from './components/exceptions/ExceptionDetail';
import EventLogTimeline from './components/events/EventLogTimeline';
import ReconciliationDashboard from './components/reconciliation/ReconciliationDashboard';

const TABS = [
  { key: 'crm', label: 'CRM Requests' },
  { key: 'erp', label: 'ERP Ledger' },
  { key: 'exceptions', label: 'Exception Queue' },
  { key: 'events', label: 'Event Log' },
  { key: 'reconciliation', label: 'Reconciliation' },
];

function App() {
  const [activeTab, setActiveTab] = useState('crm');
  const { state } = useSimulator();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    state.paymentRequests[0]?.paymentRequestId ?? null,
  );
  const [selectedBillId, setSelectedBillId] = useState<string | null>(state.erpBills[0]?.internalId ?? null);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(
    state.exceptions[0]?.exceptionId ?? null,
  );

  const selectedRequest = state.paymentRequests.find((r) => r.paymentRequestId === selectedRequestId) ?? null;
  const selectedBill = state.erpBills.find((b) => b.internalId === selectedBillId) ?? null;
  const selectedException = state.exceptions.find((e) => e.exceptionId === selectedExceptionId) ?? null;

  return (
    <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <PaymentRequestForm onCreated={setSelectedRequestId} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <PaymentRequestList
              requests={state.paymentRequests}
              selectedId={selectedRequestId}
              onSelect={setSelectedRequestId}
            />
            {selectedRequest ? (
              <PaymentRequestDetail request={selectedRequest} />
            ) : (
              <EmptyState message="Select a request to view details." />
            )}
          </div>
        </div>
      )}

      {activeTab === 'erp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <ErpBillList bills={state.erpBills} selectedId={selectedBillId} onSelect={setSelectedBillId} />
          {selectedBill ? (
            <ErpBillDetail bill={selectedBill} />
          ) : (
            <EmptyState message="Select a vendor bill to view details." />
          )}
        </div>
      )}

      {activeTab === 'exceptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <ExceptionQueueTable
            exceptions={state.exceptions}
            selectedId={selectedExceptionId}
            onSelect={setSelectedExceptionId}
          />
          {selectedException ? (
            <ExceptionDetail exception={selectedException} />
          ) : (
            <EmptyState message="Select an exception to view details." />
          )}
        </div>
      )}

      {activeTab === 'events' && <EventLogTimeline events={state.events} />}

      {activeTab === 'reconciliation' && <ReconciliationDashboard />}
    </AppShell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export default App;
