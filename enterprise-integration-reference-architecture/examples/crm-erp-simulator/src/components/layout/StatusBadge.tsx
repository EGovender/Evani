const COLOR_BY_STATUS: Record<string, string> = {
  // Business status
  Draft: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Submitted: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
  Cancelled: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  // Integration status
  'Not Started': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Queued: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
  Validating: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
  Processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  Retrying: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
  Failed: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
  'Manual Review': 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
  // ERP status
  'Pending Approval': 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
  Open: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
  'Scheduled for Payment': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  Voided: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  // Exception status
  'Needs correction': 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
  Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
};

export default function StatusBadge({ status }: { status: string }) {
  const classes = COLOR_BY_STATUS[status] ?? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${classes}`}>
      {status}
    </span>
  );
}
