import { useState, type FormEvent } from 'react';
import { useSimulator } from '../../state/useSimulator';
import { NSCF_PROGRAMS } from '../../engine/validators';
import {
  newCorrelationId,
  nextCrmAccountId,
  nextDocumentId,
  nextErpVendorId,
  nextPaymentRequestId,
} from '../../data/idGenerators';
import type { PaymentRequest } from '../../types/domain';
import { inputClass, primaryButtonClass } from '../shared/formStyles';

const CURRENCIES = ['USD', 'EUR', 'GBP'];

export default function PaymentRequestForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const { dispatch } = useSimulator();
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentDate, setPaymentDate] = useState('');
  const [justification, setJustification] = useState('');
  const [department, setDepartment] = useState('Programs');
  const [programCode, setProgramCode] = useState(NSCF_PROGRAMS[0].code);
  const [expenseAccount, setExpenseAccount] = useState(NSCF_PROGRAMS[0].expenseAccount);
  const [hasDocument, setHasDocument] = useState(true);

  function handleProgramChange(code: string) {
    setProgramCode(code);
    const program = NSCF_PROGRAMS.find((p) => p.code === code);
    if (program) setExpenseAccount(program.expenseAccount);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const program = NSCF_PROGRAMS.find((p) => p.code === programCode);

    const request: PaymentRequest = {
      paymentRequestId: nextPaymentRequestId(),
      correlationId: newCorrelationId(),
      businessStatus: 'Draft',
      integrationStatus: 'Not Started',
      payee: {
        crmAccountId: nextCrmAccountId(),
        legalName: payeeName.trim(),
        erpVendorId: nextErpVendorId(),
        payabilityStatus: 'Payable',
      },
      payment: {
        amount: Number(amount),
        currency,
        requestedPaymentDate: paymentDate,
        memo: justification.trim(),
      },
      accounting: {
        subsidiaryCode: 'NSCF',
        departmentCode: department.trim().toUpperCase().replace(/\s+/g, '_'),
        programCode,
        expenseAccount: expenseAccount.trim(),
      },
      documents: hasDocument ? [{ documentId: nextDocumentId(), documentType: 'Approval Letter' }] : [],
      businessJustification: justification.trim(),
      department: department.trim(),
      program: program?.label ?? programCode,
    };

    dispatch({ type: 'CREATE_REQUEST', request });
    onCreated?.(request.paymentRequestId);

    setPayeeName('');
    setAmount('');
    setPaymentDate('');
    setJustification('');
    setHasDocument(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
    >
      <div className="sm:col-span-2">
        <h3 className="font-semibold mb-1">New payment request</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Fictional data only — e.g. Payee "Harbor Youth Services", Amount $12,500, Program "Youth Access".
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Payee
        <input
          required
          value={payeeName}
          onChange={(e) => setPayeeName(e.target.value)}
          placeholder="Harbor Youth Services"
          className={inputClass}
        />
      </label>

      <div className="flex gap-2">
        <label className="flex flex-col gap-1 text-sm flex-1">
          Amount
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="12500"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm w-28">
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Payment date
        <input
          required
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Department
        <input required value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Program
        <select value={programCode} onChange={(e) => handleProgramChange(e.target.value)} className={inputClass}>
          {NSCF_PROGRAMS.map((p) => (
            <option key={p.code} value={p.code}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Expense account
        <input
          required
          value={expenseAccount}
          onChange={(e) => setExpenseAccount(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="sm:col-span-2 flex flex-col gap-1 text-sm">
        Business justification
        <textarea
          required
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </label>

      <label className="sm:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={hasDocument} onChange={(e) => setHasDocument(e.target.checked)} />
        Supporting document attached
      </label>

      <div className="sm:col-span-2">
        <button type="submit" className={primaryButtonClass}>
          Create request
        </button>
      </div>
    </form>
  );
}
