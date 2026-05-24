"use client";
import { useState } from "react";
import {
  Link2, FileText, StickyNote, Layout,
  Plus, X, ExternalLink, Edit3, Trash2,
  Globe, File, AlignLeft, Monitor, Save
} from "lucide-react";

type ResourceType = "link" | "file" | "note" | "embed";

interface Resource {
  id: string;
  type: ResourceType;
  label: string;
  url?: string;
  filePath?: string;
  content?: string;
  embedUrl?: string;
  category: string;
}

const TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
  link: <Globe size={13} />,
  file: <File size={13} />,
  note: <AlignLeft size={13} />,
  embed: <Monitor size={13} />,
};

const TYPE_COLORS: Record<ResourceType, string> = {
  link: "#6ee7b7",
  file: "#93c5fd",
  note: "#fde68a",
  embed: "#c4b5fd",
};

const INITIAL_RESOURCES: Resource[] = [
  { id: "1", type: "link", label: "GitHub", url: "https://github.com", category: "Dev" },
  { id: "2", type: "link", label: "Vercel", url: "https://vercel.com", category: "Dev" },
  { id: "3", type: "link", label: "Linear", url: "https://linear.app", category: "Dev" },
  { id: "4", type: "link", label: "Figma", url: "https://figma.com", category: "Design" },
  { id: "5", type: "file", label: "Resume.pdf", filePath: "/files/resume.pdf", category: "Docs" },
  { id: "6", type: "file", label: "Budget.xlsx", filePath: "/files/budget.xlsx", category: "Docs" },
  { id: "7", type: "note", label: "Daily Standup", content: "- What did I do yesterday?\n- What am I doing today?\n- Any blockers?", category: "Notes" },
  { id: "8", type: "embed", label: "Weather", embedUrl: "https://wttr.in/?format=3", category: "Widgets" },
  { id: "9", type: "link", label: "Claude", url: "https://claude.ai", category: "AI" },
  { id: "10", type: "link", label: "ChatGPT", url: "https://chatgpt.com", category: "AI" },
];

const CATEGORIES = ["All", "Dev", "Design", "Docs", "Notes", "AI", "Widgets"];

export default function Dashboard() {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedNote, setExpandedNote] = useState<Resource | null>(null);
  const [expandedEmbed, setExpandedEmbed] = useState<Resource | null>(null);
  const [newResource, setNewResource] = useState<Partial<Resource>>({ type: "link", category: "Dev" });

  const filtered = activeCategory === "All"
    ? resources
    : resources.filter(r => r.category === activeCategory);

  const handleAdd = () => {
    if (!newResource.label) return;
    const resource: Resource = {
      id: Date.now().toString(),
      type: newResource.type as ResourceType,
      label: newResource.label,
      url: newResource.url,
      filePath: newResource.filePath,
      content: newResource.content,
      embedUrl: newResource.embedUrl,
      category: newResource.category || "Dev",
    };
    setResources(prev => [...prev, resource]);
    setNewResource({ type: "link", category: "Dev" });
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const handleClick = (r: Resource) => {
    if (r.type === "link" && r.url) window.open(r.url, "_blank");
    if (r.type === "file" && r.filePath) window.open(r.filePath, "_blank");
    if (r.type === "note") setExpandedNote(r);
    if (r.type === "embed") setExpandedEmbed(r);
  };

  return (
    <div className="dashboard">
      {/* Category filter */}
      <nav className="category-nav">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Add
        </button>
      </nav>

      {/* Resource grid */}
      <div className="resource-grid">
        {filtered.map(r => (
          <div key={r.id} className="resource-card" onClick={() => handleClick(r)}>
            <div className="card-header">
              <span className="type-badge" style={{ color: TYPE_COLORS[r.type] }}>
                {TYPE_ICONS[r.type]}
                <span>{r.type}</span>
              </span>
              <button
                className="delete-btn"
                onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
              >
                <Trash2 size={11} />
              </button>
            </div>
            <div className="card-label">{r.label}</div>
            <div className="card-meta">
              {r.url && <span className="card-url">{r.url.replace(/https?:\/\//, "")}</span>}
              {r.filePath && <span className="card-url">{r.filePath}</span>}
              {r.content && <span className="card-url">click to open</span>}
              {r.embedUrl && <span className="card-url">click to view</span>}
            </div>
            <div className="card-category">{r.category}</div>
          </div>
        ))}
      </div>

      {/* Note Modal */}
      {expandedNote && (
        <div className="modal-overlay" onClick={() => setExpandedNote(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>{expandedNote.label}</span>
              <button onClick={() => setExpandedNote(null)}><X size={16} /></button>
            </div>
            <pre className="note-content">{expandedNote.content}</pre>
          </div>
        </div>
      )}

      {/* Embed Modal */}
      {expandedEmbed && (
        <div className="modal-overlay" onClick={() => setExpandedEmbed(null)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>{expandedEmbed.label}</span>
              <button onClick={() => setExpandedEmbed(null)}><X size={16} /></button>
            </div>
            <iframe src={expandedEmbed.embedUrl} className="embed-frame" title={expandedEmbed.label} />
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Resource</span>
              <button onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <div className="form">
              <div className="form-row">
                <label>Type</label>
                <div className="type-selector">
                  {(["link","file","note","embed"] as ResourceType[]).map(t => (
                    <button
                      key={t}
                      className={`type-btn ${newResource.type === t ? "active" : ""}`}
                      onClick={() => setNewResource(p => ({ ...p, type: t }))}
                    >
                      {TYPE_ICONS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label>Label</label>
                <input
                  placeholder="e.g. GitHub"
                  value={newResource.label || ""}
                  onChange={e => setNewResource(p => ({ ...p, label: e.target.value }))}
                />
              </div>
              {(newResource.type === "link") && (
                <div className="form-row">
                  <label>URL</label>
                  <input
                    placeholder="https://..."
                    value={newResource.url || ""}
                    onChange={e => setNewResource(p => ({ ...p, url: e.target.value }))}
                  />
                </div>
              )}
              {(newResource.type === "file") && (
                <div className="form-row">
                  <label>File Path</label>
                  <input
                    placeholder="/files/document.pdf"
                    value={newResource.filePath || ""}
                    onChange={e => setNewResource(p => ({ ...p, filePath: e.target.value }))}
                  />
                </div>
              )}
              {(newResource.type === "note") && (
                <div className="form-row">
                  <label>Content</label>
                  <textarea
                    placeholder="Your note..."
                    value={newResource.content || ""}
                    onChange={e => setNewResource(p => ({ ...p, content: e.target.value }))}
                    rows={4}
                  />
                </div>
              )}
              {(newResource.type === "embed") && (
                <div className="form-row">
                  <label>Embed URL</label>
                  <input
                    placeholder="https://..."
                    value={newResource.embedUrl || ""}
                    onChange={e => setNewResource(p => ({ ...p, embedUrl: e.target.value }))}
                  />
                </div>
              )}
              <div className="form-row">
                <label>Category</label>
                <input
                  placeholder="Dev, Design, Docs..."
                  value={newResource.category || ""}
                  onChange={e => setNewResource(p => ({ ...p, category: e.target.value }))}
                />
              </div>
              <button className="submit-btn" onClick={handleAdd}>
                <Save size={13} /> Save Resource
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard { padding: 0 0 60px; }

        .category-nav {
          display: flex;
          gap: 4px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          align-items: center;
        }

        .cat-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 5px 14px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .cat-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .cat-btn.active { border-color: var(--accent); color: var(--accent); background: #ffffff08; }

        .add-btn {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          background: #ffffff0a;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 5px 14px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .add-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: #ffffff14; }

        .resource-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .resource-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .resource-card:hover {
          border-color: var(--border-hover);
          background: var(--bg-card-hover);
          transform: translateY(-1px);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .type-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.8;
        }

        .delete-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          opacity: 0;
          transition: opacity 0.15s, color 0.15s;
          display: flex;
          align-items: center;
        }
        .resource-card:hover .delete-btn { opacity: 1; }
        .delete-btn:hover { color: #f87171; }

        .card-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .card-url {
          font-size: 10px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .card-meta { overflow: hidden; }

        .card-category {
          font-size: 9px;
          color: var(--accent-dim);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: #00000088;
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal {
          background: #141414;
          border: 1px solid var(--border-hover);
          border-radius: 6px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
        }

        .modal-wide { max-width: 720px; }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          font-size: 12px;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }
        .modal-header button {
          background: none; border: none; color: var(--text-secondary);
          cursor: pointer; display: flex; align-items: center;
          transition: color 0.15s;
        }
        .modal-header button:hover { color: var(--text-primary); }

        .note-content {
          padding: 20px 18px;
          font-family: inherit;
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.7;
          white-space: pre-wrap;
          max-height: 400px;
          overflow-y: auto;
        }

        .embed-frame {
          width: 100%;
          height: 480px;
          border: none;
          display: block;
          background: var(--bg);
        }

        /* Form */
        .form { padding: 20px 18px; display: flex; flex-direction: column; gap: 16px; }

        .form-row { display: flex; flex-direction: column; gap: 6px; }
        .form-row label { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); }
        .form-row input, .form-row textarea {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 8px 10px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s;
          resize: vertical;
        }
        .form-row input:focus, .form-row textarea:focus { border-color: var(--border-hover); }

        .type-selector { display: flex; gap: 6px; flex-wrap: wrap; }
        .type-btn {
          display: flex; align-items: center; gap: 5px;
          background: none;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          transition: all 0.15s;
          text-transform: capitalize;
        }
        .type-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .type-btn.active { border-color: var(--accent); color: var(--accent); background: #ffffff08; }

        .submit-btn {
          display: flex; align-items: center; gap: 6px; justify-content: center;
          background: #ffffff0f;
          border: 1px solid var(--border-hover);
          color: var(--text-primary);
          padding: 9px 16px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.05em;
          transition: all 0.15s;
        }
        .submit-btn:hover { background: #ffffff18; }
      `}</style>
    </div>
  );
}
