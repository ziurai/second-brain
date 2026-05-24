"use client";
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
  type = "text",
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="cell-input"
      type={type}
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

export default function PrintSchedule() {
  const jobs = (useQuery(api.printJobs.list) ?? []) as Job[];
  const addJob = useMutation(api.printJobs.add);
  const updateJob = useMutation(api.printJobs.update);
  const removeJob = useMutation(api.printJobs.remove);

  const update = (id: Id<"printJobs">, fields: Partial<Omit<Job, "_id" | "order">>) => {
    updateJob({ id, ...fields });
  };

  return (
    <div className="print-schedule">
      <div className="table-wrap">
        <table className="print-table">
          <thead>
            <tr>
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
              <tr key={job._id} className="print-row">
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
                  <EditableCell
                    value={job.produce ?? ""}
                    type="date"
                    onSave={(v) => update(job._id, { produce: v })}
                  />
                </td>
                <td>
                  <EditableCell
                    value={job.shipDate ?? ""}
                    type="date"
                    onSave={(v) => update(job._id, { shipDate: v })}
                  />
                </td>
                <td>
                  <EditableCell
                    value={job.shipBy ?? ""}
                    type="date"
                    onSave={(v) => update(job._id, { shipBy: v })}
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

      <style>{`
        .print-schedule { padding-bottom: 60px; }

        .table-wrap { overflow-x: auto; }

        .print-table {
          width: 100%;
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

        .print-table td { padding: 4px 6px; vertical-align: middle; }

        .col-status { width: 64px; text-align: center; }
        .col-descriptor { width: 140px; }
        .col-product { width: 200px; }
        .col-customer { width: 180px; }
        .col-date { width: 140px; }
        .col-del { width: 36px; }

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
      `}</style>
    </div>
  );
}
