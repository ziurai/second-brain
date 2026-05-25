"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, Trash2 } from "lucide-react";

type Status = "not-started" | "in-progress" | "done";

const STATUS_NEXT: Record<Status, Status> = {
  "not-started": "in-progress",
  "in-progress": "done",
  "done": "not-started",
};

const STATUS_COLOR: Record<Status, string> = {
  "not-started": "transparent",
  "in-progress": "#f97316",
  "done": "#22c55e",
};

const STATUS_LABEL: Record<Status, string> = {
  "not-started": "—",
  "in-progress": "In Progress",
  "done": "Done",
};

interface Job {
  _id: Id<"printJobs">;
  status: Status;
  descriptor: string;
  product: string;
  customer: string;
  produce?: string;
  shipDate?: string;
  shipBy?: string;
  order: number;
}

function EditableCell({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="cell-input"
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      onBlur={(e) => {
        if (e.target.value !== value) onSave(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          (e.target as HTMLInputElement).value = value;
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function DateCell({
  value,
  onSave,
  copiedDate,
  onCopy,
}: {
  value: string;
  onSave: (v: string) => void;
  copiedDate: string | null;
  onCopy: (date: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);

  return (
    <input
      className={`cell-input${!local ? " date-empty" : ""}`}
      type="date"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onSave(local); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          setLocal(value);
          (e.target as HTMLInputElement).blur();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "c" && local) {
          e.preventDefault();
          onCopy(local);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "v" && copiedDate) {
          e.preventDefault();
          setLocal(copiedDate);
        }
      }}
    />
  );
}

export default function PrintSchedule() {
  const jobs = (useQuery(api.printJobs.list) ?? []) as Job[];
  const addJob = useMutation(api.printJobs.add);
  const updateJob = useMutation(api.printJobs.update);
  const removeJob = useMutation(api.printJobs.remove);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedDate, setCopiedDate] = useState<string | null>(null);

  const update = (id: Id<"printJobs">, fields: Partial<Omit<Job, "_id" | "order">>) => {
    updateJob({ id, ...fields });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = jobs.length > 0 && selected.size === jobs.length;

  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(jobs.map((j) => j._id)));
  };

  const deleteSelected = async () => {
    for (const id of selected) {
      await removeJob({ id: id as Id<"printJobs"> });
    }
    setSelected(new Set());
  };

  const formatCopiedDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
  };

  return (
    <div className="print-schedule">
      <div className="table-wrap">
        <table className="print-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  className="row-check"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  title="Select all"
                />
              </th>
              <th className="col-status">Status</th>
              <th className="col-descriptor">Color / Descriptor</th>
              <th className="col-product">Product</th>
              <th className="col-customer">Customer</th>
              <th className="col-date">Produce</th>
              <th className="col-date">Ship Date</th>
              <th className="col-date">Ship By</th>
              <th className="col-del" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job._id}
                className={`print-row${selected.has(job._id) ? " row-selected" : ""}`}
              >
                <td className="col-check">
                  <input
                    type="checkbox"
                    className="row-check"
                    checked={selected.has(job._id)}
                    onChange={() => toggleSelect(job._id)}
                  />
                </td>
                <td className="col-status">
                  <button
                    className="status-btn"
                    style={{ background: STATUS_COLOR[job.status] }}
                    title={STATUS_LABEL[job.status]}
                    onClick={() => update(job._id, { status: STATUS_NEXT[job.status] })}
                  />
                </td>
                <td>
                  <EditableCell
                    value={job.descriptor}
                    placeholder="e.g. Black"
                    onSave={(v) => update(job._id, { descriptor: v })}
                  />
                </td>
                <td>
                  <EditableCell
                    value={job.product}
                    placeholder="Product name"
                    onSave={(v) => update(job._id, { product: v })}
                  />
                </td>
                <td>
                  <EditableCell
                    value={job.customer}
                    placeholder="Customer name"
                    onSave={(v) => update(job._id, { customer: v })}
                  />
                </td>
                <td>
                  <DateCell
                    value={job.produce ?? ""}
                    onSave={(v) => update(job._id, { produce: v })}
                    copiedDate={copiedDate}
                    onCopy={setCopiedDate}
                  />
                </td>
                <td>
                  <DateCell
                    value={job.shipDate ?? ""}
                    onSave={(v) => update(job._id, { shipDate: v })}
                    copiedDate={copiedDate}
                    onCopy={setCopiedDate}
                  />
                </td>
                <td>
                  <DateCell
                    value={job.shipBy ?? ""}
                    onSave={(v) => update(job._id, { shipBy: v })}
                    copiedDate={copiedDate}
                    onCopy={setCopiedDate}
                  />
                </td>
                <td className="col-del">
                  <button className="del-btn" onClick={() => removeJob({ id: job._id })}>
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="add-row-btn" onClick={() => addJob()}>
        <Plus size={13} /> Add row
      </button>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selected.size} row{selected.size !== 1 ? "s" : ""} selected</span>
          <button className="bulk-delete-btn" onClick={deleteSelected}>
            <Trash2 size={13} />
            Delete {selected.size} row{selected.size !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {copiedDate && (
        <div className="copy-toast">
          {formatCopiedDate(copiedDate)} copied — ⌘V to paste into any date field
        </div>
      )}

      <style>{`
        .print-schedule { padding-bottom: 80px; }

        .table-wrap { overflow-x: auto; }

        .print-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          font-size: 13px;
        }

        .print-table th {
          text-align: left;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          font-weight: 400;
        }

        .print-row { border-bottom: 1px solid var(--border); }
        .print-row:hover { background: #ffffff04; }
        .print-row.row-selected { background: #ffffff07; }

        .print-table td { padding: 4px 6px; vertical-align: middle; }

        .col-check { width: 36px; text-align: center; }
        .col-status { width: 64px; text-align: center; }
        .col-descriptor { width: 140px; }
        .col-product { width: 200px; }
        .col-customer { width: 180px; }
        .col-date { width: 140px; }
        .col-del { width: 36px; }

        .row-check {
          accent-color: #888;
          cursor: pointer;
          width: 14px;
          height: 14px;
        }

        .status-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--border-hover);
          cursor: pointer;
          display: block;
          margin: 0 auto;
          transition: transform 0.1s, opacity 0.1s;
        }
        .status-btn:hover { transform: scale(1.15); opacity: 0.85; }

        .cell-input {
          width: 100%;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 13px;
          padding: 6px 8px;
          border-radius: 3px;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .cell-input:hover { border-color: var(--border); }
        .cell-input:focus { border-color: var(--border-hover); background: #ffffff08; }
        .cell-input[type="date"] { color-scheme: dark; }
        .cell-input::placeholder { color: var(--text-muted); }
        .cell-input.date-empty { color: var(--text-muted); }
        .cell-input.date-empty:focus { color: var(--text-primary); }

        .del-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 3px;
          opacity: 0;
          transition: color 0.15s, opacity 0.15s;
        }
        .print-row:hover .del-btn { opacity: 1; }
        .del-btn:hover { color: #f87171; }

        .add-row-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          background: none;
          border: 1px dashed var(--border);
          color: var(--text-muted);
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 7px 16px;
          border-radius: 3px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .add-row-btn:hover { color: var(--text-secondary); border-color: var(--border-hover); }

        .bulk-bar {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          background: #141414;
          border: 1px solid var(--border-hover);
          border-radius: 8px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          z-index: 100;
          white-space: nowrap;
        }
        .bulk-count {
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.03em;
        }
        .bulk-delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #450a0a;
          border: 1px solid #7f1d1d;
          color: #fca5a5;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.03em;
          padding: 6px 14px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .bulk-delete-btn:hover { background: #7f1d1d; }

        .copy-toast {
          position: fixed;
          bottom: 32px;
          right: 40px;
          font-size: 11px;
          color: var(--text-muted);
          background: #141414;
          border: 1px solid var(--border);
          border-radius: 5px;
          padding: 6px 12px;
          z-index: 99;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}
