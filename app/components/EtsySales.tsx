"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, X, Trash2, Pencil, Save } from "lucide-react";

type TxType = "income" | "expense" | "robert";

interface Transaction {
  _id: Id<"etsyTransactions">;
  _creationTime: number;
  type: TxType;
  date: string;
  amount: number;
  description?: string;
}

interface MonthData {
  key: string;
  label: string;
  sales: number;
  total: number;
  daysInMonth: number;
}

const today = () => new Date().toLocaleDateString("en-CA");

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function computeMonthly(txs: Transaction[]): MonthData[] {
  const map: Record<string, { sales: number; total: number }> = {};
  for (const t of txs) {
    const key = t.date.slice(0, 7);
    if (!map[key]) map[key] = { sales: 0, total: 0 };
    map[key].sales++;
    map[key].total += t.amount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, d]) => {
      const [y, m] = key.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      return {
        key,
        label: new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        sales: d.sales,
        total: d.total,
        daysInMonth,
      };
    });
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

// ─── Module-level subcomponents ──────────────────────────────────────────────

function MonthTable({ months, color }: { months: MonthData[]; color: string }) {
  if (months.length === 0) return <p className="etsy-empty">No transactions yet.</p>;
  return (
    <table className="etsy-table">
      <thead>
        <tr>
          <th>Month</th>
          <th className="num">Sales</th>
          <th className="num">Total</th>
          <th className="num">Avg Sales/Day</th>
          <th className="num">Avg $/Day</th>
        </tr>
      </thead>
      <tbody>
        {months.map((m) => (
          <tr key={m.key}>
            <td className="month-label">{m.label}</td>
            <td className="num" style={{ color }}>{m.sales}</td>
            <td className="num" style={{ color }}>{usd(m.total)}</td>
            <td className="num">{(m.sales / m.daysInMonth).toFixed(2)}</td>
            <td className="num">{usd(m.total / m.daysInMonth)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TxRow({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: Id<"etsyTransactions">) => void;
}) {
  const typeColor = tx.type === "income" ? "#6ee7b7" : tx.type === "robert" ? "#a78bfa" : "#f87171";
  const typeLabel = tx.type === "income" ? "Income" : tx.type === "robert" ? "Robert" : "Expense";
  const sign = tx.type === "expense" ? "-" : "+";
  const amountColor = tx.type === "expense" ? "#f87171" : tx.type === "robert" ? "#a78bfa" : "#6ee7b7";

  return (
    <tr className="tx-row">
      <td className="tx-date">{formatDate(tx.date)}</td>
      <td><span className="tx-badge" style={{ color: typeColor, borderColor: typeColor + "44" }}>{typeLabel}</span></td>
      <td className="tx-amount" style={{ color: amountColor }}>{sign}{usd(tx.amount)}</td>
      <td className="tx-desc">{tx.description ?? <span className="tx-nodesc">—</span>}</td>
      <td className="tx-actions">
        <button className="tx-btn" onClick={() => onEdit(tx)}><Pencil size={11} /></button>
        <button className="tx-btn tx-del" onClick={() => onDelete(tx._id)}><Trash2 size={11} /></button>
      </td>
    </tr>
  );
}

function TxModal({
  title,
  form,
  setForm,
  onSave,
  onClose,
  loading,
}: {
  title: string;
  form: { type: TxType; date: string; amount: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ type: TxType; date: string; amount: string; description: string }>>;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="etsy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="etsy-modal-header">
          <span>{title}</span>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        <div className="etsy-modal-body">
          <div className="etsy-field">
            <label>Type</label>
            <div className="type-toggle">
              {(["income", "expense", "robert"] as TxType[]).map((t) => (
                <button
                  key={t}
                  className={`type-btn${form.type === t ? " active-" + t : ""}`}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                >
                  {t === "income" ? "Income" : t === "expense" ? "Expense" : "Robert"}
                </button>
              ))}
            </div>
          </div>

          <div className="etsy-row-2">
            <div className="etsy-field">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="etsy-field">
              <label>Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
          </div>

          <div className="etsy-field">
            <label>Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. DeckPress order, shipping supplies…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="etsy-modal-footer">
          <button className="etsy-save-btn" onClick={onSave} disabled={loading}>
            <Save size={13} /> {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const EMPTY_FORM = { type: "income" as TxType, date: "", amount: "", description: "" };

export default function EtsySales() {
  const transactions = (useQuery(api.etsyTransactions.list) ?? []) as Transaction[];
  const addTx = useMutation(api.etsyTransactions.add);
  const updateTx = useMutation(api.etsyTransactions.update);
  const removeTx = useMutation(api.etsyTransactions.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM, date: today() });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  const income = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");
  const robert = transactions.filter((t) => t.type === "robert");

  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpenses;
  const totalRobert = robert.reduce((s, t) => s + t.amount, 0);

  const incomeMonths = computeMonthly(income);
  const robertMonths = computeMonthly(robert);

  const handleAdd = async () => {
    if (!addForm.date || !addForm.amount) return;
    setLoading(true);
    await addTx({
      type: addForm.type,
      date: addForm.date,
      amount: parseFloat(addForm.amount),
      description: addForm.description || undefined,
    });
    setShowAdd(false);
    setAddForm({ ...EMPTY_FORM, date: today() });
    setLoading(false);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setEditForm({
      type: tx.type,
      date: tx.date,
      amount: tx.amount.toString(),
      description: tx.description ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editing || !editForm.date || !editForm.amount) return;
    setLoading(true);
    await updateTx({
      id: editing._id,
      type: editForm.type,
      date: editForm.date,
      amount: parseFloat(editForm.amount),
      description: editForm.description || undefined,
    });
    setEditing(null);
    setLoading(false);
  };

  return (
    <div className="etsy-wrap">

      {/* ── Summary ── */}
      <div className="etsy-summary">
        <div className="summary-group">
          <div className="summary-card">
            <div className="summary-label">Income</div>
            <div className="summary-value income-val">{usd(totalIncome)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Expenses</div>
            <div className="summary-value expense-val">{usd(totalExpenses)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Net</div>
            <div className={`summary-value ${net >= 0 ? "income-val" : "expense-val"}`}>{usd(net)}</div>
          </div>
        </div>
        <div className="summary-divider" />
        <div className="summary-card robert-card">
          <div className="summary-label robert-label">Robert</div>
          <div className="summary-value robert-val">{usd(totalRobert)}</div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="etsy-toolbar">
        <span className="etsy-section-label">Transactions</span>
        <button className="etsy-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={13} /> Add
        </button>
      </div>

      {/* ── Monthly Breakdown — Income ── */}
      <section className="etsy-section">
        <div className="etsy-section-header">
          <span className="etsy-section-title">Monthly — Income</span>
        </div>
        <MonthTable months={incomeMonths} color="#6ee7b7" />
      </section>

      {/* ── Monthly Breakdown — Robert ── */}
      <section className="etsy-section etsy-section-robert">
        <div className="etsy-section-header">
          <span className="etsy-section-title robert-title">Monthly — Robert</span>
        </div>
        <MonthTable months={robertMonths} color="#a78bfa" />
      </section>

      {/* ── Transaction Log ── */}
      <section className="etsy-section">
        <div className="etsy-section-header">
          <span className="etsy-section-title">All Transactions</span>
        </div>
        {transactions.length === 0 ? (
          <p className="etsy-empty">No transactions yet. Add your first one above.</p>
        ) : (
          <div className="tx-table-wrap">
            <table className="etsy-table tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th className="num">Amount</th>
                  <th>Description</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <TxRow key={tx._id} tx={tx} onEdit={openEdit} onDelete={(id) => removeTx({ id })} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Add Modal ── */}
      {showAdd && (
        <TxModal
          title="New Transaction"
          form={addForm}
          setForm={setAddForm}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
          loading={loading}
        />
      )}

      {/* ── Edit Modal ── */}
      {editing && (
        <TxModal
          title="Edit Transaction"
          form={editForm}
          setForm={setEditForm}
          onSave={handleSaveEdit}
          onClose={() => setEditing(null)}
          loading={loading}
        />
      )}

      <style>{`
        .etsy-wrap { padding-bottom: 80px; }

        /* ── Summary ── */
        .etsy-summary {
          display: flex;
          align-items: stretch;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .summary-group { display: flex; flex: 1; }
        .summary-card {
          flex: 1;
          padding: 20px 24px;
          border-right: 1px solid var(--border);
        }
        .summary-divider { width: 1px; background: var(--border); flex-shrink: 0; }
        .robert-card { padding: 20px 28px; min-width: 160px; background: #a78bfa08; }
        .summary-label {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .robert-label { color: #a78bfa99; }
        .summary-value { font-size: 24px; font-weight: 300; letter-spacing: -0.02em; color: var(--text-primary); }
        .income-val { color: #6ee7b7; }
        .expense-val { color: #f87171; }
        .robert-val { color: #a78bfa; }

        /* ── Toolbar ── */
        .etsy-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .etsy-section-label {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .etsy-add-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #ffffff0a;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .etsy-add-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: #ffffff14; }

        /* ── Sections ── */
        .etsy-section {
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 24px;
          background: #ffffff02;
        }
        .etsy-section-robert { border-color: #a78bfa22; background: #a78bfa05; }
        .etsy-section-header {
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          background: #ffffff03;
        }
        .etsy-section-robert .etsy-section-header { border-bottom-color: #a78bfa22; }
        .etsy-section-title {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .robert-title { color: #a78bfa88; }
        .etsy-empty {
          font-size: 12px;
          color: var(--text-muted);
          padding: 24px 18px;
          margin: 0;
        }

        /* ── Tables ── */
        .etsy-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .etsy-table th {
          text-align: left;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 400;
          padding: 10px 18px;
          border-bottom: 1px solid var(--border);
        }
        .etsy-table td { padding: 11px 18px; border-bottom: 1px solid var(--border); color: var(--text-primary); }
        .etsy-table tr:last-child td { border-bottom: none; }
        .etsy-table .num { text-align: right; }
        .month-label { color: var(--text-secondary); font-size: 13px; }

        /* ── Transaction table ── */
        .tx-table-wrap { overflow-x: auto; }
        .tx-table { min-width: 560px; }
        .tx-row:hover { background: #ffffff04; }
        .tx-row:hover .tx-actions { opacity: 1; }
        .tx-date { color: var(--text-secondary); white-space: nowrap; width: 100px; }
        .tx-badge {
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
          border-radius: 3px;
          padding: 2px 6px;
          white-space: nowrap;
        }
        .tx-amount { font-weight: 500; white-space: nowrap; text-align: right; width: 110px; }
        .tx-desc { color: var(--text-secondary); }
        .tx-nodesc { color: var(--text-muted); }
        .tx-actions { opacity: 0; transition: opacity 0.15s; white-space: nowrap; width: 60px; }
        .tx-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 3px 4px; border-radius: 3px; transition: color 0.15s; }
        .tx-btn:hover { color: var(--text-secondary); }
        .tx-del:hover { color: #f87171; }

        /* ── Modal ── */
        .modal-overlay { position: fixed; inset: 0; background: #00000088; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .etsy-modal { background: #141414; border: 1px solid var(--border-hover); border-radius: 6px; width: 100%; max-width: 460px; overflow: hidden; }
        .etsy-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); }
        .etsy-modal-header button { background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; transition: color 0.15s; }
        .etsy-modal-header button:hover { color: var(--text-primary); }
        .etsy-modal-body { padding: 20px 18px; display: flex; flex-direction: column; gap: 16px; }
        .etsy-modal-footer { padding: 0 18px 18px; }

        .etsy-field { display: flex; flex-direction: column; gap: 6px; }
        .etsy-field label { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); }
        .etsy-field input {
          background: var(--bg); border: 1px solid var(--border); color: var(--text-primary);
          padding: 8px 10px; border-radius: 3px; font-family: inherit; font-size: 12px;
          outline: none; transition: border-color 0.15s; color-scheme: dark;
        }
        .etsy-field input:focus { border-color: var(--border-hover); }
        .etsy-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .type-toggle { display: flex; gap: 6px; }
        .type-btn {
          flex: 1;
          background: none;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 7px 0;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .type-btn:hover { border-color: var(--border-hover); color: var(--text-secondary); }
        .type-btn.active-income { border-color: #6ee7b7; color: #6ee7b7; background: #6ee7b710; }
        .type-btn.active-expense { border-color: #f87171; color: #f87171; background: #f8717110; }
        .type-btn.active-robert { border-color: #a78bfa; color: #a78bfa; background: #a78bfa10; }

        .etsy-save-btn {
          display: flex; align-items: center; gap: 6px; justify-content: center;
          background: #ffffff0f; border: 1px solid var(--border-hover);
          color: var(--text-primary); padding: 9px 16px; border-radius: 3px;
          cursor: pointer; font-family: inherit; font-size: 12px;
          letter-spacing: 0.05em; transition: all 0.15s; width: 100%;
        }
        .etsy-save-btn:hover { background: #ffffff18; }
        .etsy-save-btn:disabled { opacity: 0.5; cursor: wait; }

        @media (max-width: 640px) {
          .etsy-summary { flex-direction: column; }
          .summary-group { flex-direction: column; }
          .summary-divider { width: 100%; height: 1px; }
          .etsy-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
