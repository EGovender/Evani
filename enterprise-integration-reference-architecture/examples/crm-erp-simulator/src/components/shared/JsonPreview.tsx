import { useState } from 'react';

export default function JsonPreview({ title, data }: { title: string; data: unknown }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        {open ? 'Hide' : 'View'} raw payload — {title}
      </button>
      {open && (
        <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-900 text-slate-100 text-xs p-3">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
