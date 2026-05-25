"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Plus, X, Trash2, Globe, File, AlignLeft, Monitor, Save, Pencil, Pin, PinOff
} from "lucide-react";
import MediaCards from "./MediaCards";

type ResourceType = "link" | "file" | "note" | "embed";

interface Resource {
  _id: Id<"resources">;
  type: ResourceType;
  label: string;
  url?: string;
  filePath?: string;
  content?: string;
  embedUrl?: string;
  category: string;
  categories?: string[];
  pinned?: boolean;
  order: number;
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

function getCategories(r: Resource): string[] {
  return r.categories && r.categories.length > 0 ? r.categories : [r.category];
}

function CategoryToggle({
  categories,
  selected,
  onChange,
}: {
  categories: { _id: Id<"categories">; name: string }[];
  selected: string[];
  onChange: (cats: string[]) => void;
}) {
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((c) => c !== name));
    } else {
      onChange([...selected, name]);
    }
  };
  return (
    <div className="cat-toggle-group">
      {categories.map((c) => (
        <button
          key={c._id}
          className={`cat-toggle-btn${selected.includes(c.name) ? " active" : ""}`}
          onClick={() => toggle(c.name)}
          type="button"
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const resources = (useQuery(api.resources.list) ?? []) as Resource[];
  const categories = useQuery(api.categories.list) ?? [];

  const addResource = useMutation(api.resources.add);
  const removeResource = useMutation(api.resources.remove);
  const updateResource = useMutation(api.resources.update);
  const addCategory = useMutation(api.categories.add);
  const removeCategory = useMutation(api.categories.remove);

  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [expandedNote, setExpandedNote] = useState<Resource | null>(null);
  const [noteEditContent, setNoteEditContent] = useState("");
  const [expandedEmbed, setExpandedEmbed] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editFields, setEditFields] = useState<{
    label: string;
    url: string;
    filePath: string;
    content: string;
    embedUrl: string;
    categories: string[];
  }>({ label: "", url: "", filePath: "", content: "", embedUrl: "", categories: [] });
  const [newResource, setNewResource] = useState<{
    type: ResourceType;
    label: string;
    url: string;
    filePath: string;
    content: string;
    embedUrl: string;
    categories: string[];
  }>({ type: "link", label: "", url: "", filePath: "", content: "", embedUrl: "", categories: [] });
  const [newCategoryName, setNewCategoryName] = useState("");

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  const pinned = resources.filter((r) => r.pinned);
  const unpinned = resources.filter((r) => !r.pinned);

  const filtered =
    activeCategory === "All"
      ? unpinned
      : unpinned.filter((r) => getCategories(r).includes(activeCategory));

  const handleAdd = async () => {
    if (!newResource.label) return;
    const cats = newResource.categories;
    await addResource({
      type: newResource.type,
      label: newResource.label,
      url: newResource.url || undefined,
      filePath: newResource.filePath || undefined,
      content: newResource.content || undefined,
      embedUrl: newResource.embedUrl || undefined,
      category: cats[0] || "General",
      categories: cats.length > 0 ? cats : undefined,
      order: resources.length,
    });
    setNewResource({ type: "link", label: "", url: "", filePath: "", content: "", embedUrl: "", categories: [] });
    setShowAddModal(false);
  };

  const handleDelete = async (id: Id<"resources">) => {
    await removeResource({ id });
  };

  const handleEdit = (r: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingResource(r);
    setEditFields({
      label: r.label,
      url: r.url ?? "",
      filePath: r.filePath ?? "",
      content: r.content ?? "",
      embedUrl: r.embedUrl ?? "",
      categories: getCategories(r),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingResource) return;
    const cats = editFields.categories;
    await updateResource({
      id: editingResource._id,
      label: editFields.label,
      url: editFields.url || undefined,
      filePath: editFields.filePath || undefined,
      content: editFields.content || undefined,
      embedUrl: editFields.embedUrl || undefined,
      category: cats[0] || "General",
      categories: cats.length > 0 ? cats : undefined,
    });
    setEditingResource(null);
  };

  const handlePin = async (r: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateResource({ id: r._id, pinned: !r.pinned });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await addCategory({ name: newCategoryName.trim(), order: categories.length });
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const handleDeleteCategory = async (id: Id<"categories">, name: string) => {
    await removeCategory({ id });
    if (activeCategory === name) setActiveCategory("All");
  };

  const handleClick = (r: Resource) => {
    if (r.type === "link" && r.url) window.open(r.url, "_blank");
    if (r.type === "file" && r.filePath) {
      let href = r.filePath;
      if (href.startsWith("file://")) {
        href = "openlocal://" + href.slice("file://".length);
      } else if (href.startsWith("/")) {
        href = "openlocal://" + href;
      }
      const a = document.createElement("a");
      a.href = href;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (r.type === "note") { setExpandedNote(r); setNoteEditContent(r.content ?? ""); }
    if (r.type === "embed") setExpandedEmbed(r);
  };

  const ResourceCard = ({ r }: { r: Resource }) => {
    const cats = getCategories(r);
    return (
      <div
        className={`resource-card${r.pinned ? " pinned-card" : ""}`}
        onClick={() => handleClick(r)}
      >
        <div className="card-header">
          <span className="type-badge" style={{ color: TYPE_COLORS[r.type] }}>
            {TYPE_ICONS[r.type]}
            <span>{r.type}</span>
          </span>
          <div className="card-actions">
            <button
              className={`action-btn pin-btn${r.pinned ? " pinned" : ""}`}
              onClick={(e) => handlePin(r, e)}
              title={r.pinned ? "Unpin" : "Pin to top"}
            >
              {r.pinned ? <PinOff size={11} /> : <Pin size={11} />}
            </button>
            <button className="action-btn" onClick={(e) => handleEdit(r, e)}>
              <Pencil size={11} />
            </button>
            <button
              className="action-btn delete"
              onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
        <div className="card-label">{r.label}</div>
        <div className="card-meta">
          {r.url && <span className="card-url">{r.url.replace(/https?:\/\//, "")}</span>}
          {r.filePath && <span className="card-url">{r.filePath}</span>}
          {r.content && <span className="card-url">click to open</span>}
          {r.embedUrl && <span className="card-url">click to view</span>}
        </div>
        <div className="card-categories">
          {cats.map((cat) => (
            <span key={cat} className="card-cat-pill">{cat}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <MediaCards />

      {pinned.length > 0 && (
        <section className="pinned-section">
          <div className="pinned-label">Pinned</div>
          <div className="resource-grid">
            {pinned.map((r) => <ResourceCard key={r._id} r={r} />)}
          </div>
        </section>
      )}

      <nav className="category-nav">
        {categoryNames.map((cat) => (
          <div key={cat} className="cat-wrapper">
            <button
              className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
            {cat !== "All" && (
              <button
                className="cat-delete"
                onClick={() => {
                  const found = categories.find((c) => c.name === cat);
                  if (found) handleDeleteCategory(found._id, cat);
                }}
              >
                <X size={9} />
              </button>
            )}
          </div>
        ))}
        {showAddCategory ? (
          <div className="inline-cat-form">
            <input
              autoFocus
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCategory();
                if (e.key === "Escape") setShowAddCategory(false);
              }}
            />
            <button onClick={handleAddCategory}><Save size={12} /></button>
            <button onClick={() => setShowAddCategory(false)}><X size={12} /></button>
          </div>
        ) : (
          <button className="cat-btn ghost" onClick={() => setShowAddCategory(true)}>
            <Plus size={11} /> Category
          </button>
        )}
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Add
        </button>
      </nav>

      <div className="resource-grid">
        {filtered.map((r) => <ResourceCard key={r._id} r={r} />)}
        {filtered.length === 0 && (
          <div className="empty-state">
            No resources in {activeCategory === "All" ? "your brain" : activeCategory} yet.
            <button onClick={() => setShowAddModal(true)}>Add one →</button>
          </div>
        )}
      </div>

      {expandedNote && (
        <div className="modal-overlay" onClick={() => setExpandedNote(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{expandedNote.label}</span>
              <button onClick={() => setExpandedNote(null)}><X size={16} /></button>
            </div>
            <div className="note-edit-wrap">
              <textarea
                className="note-edit-area"
                value={noteEditContent}
                onChange={(e) => setNoteEditContent(e.target.value)}
                rows={12}
                placeholder="Write your note here..."
              />
            </div>
            <div className="note-footer">
              <button className="submit-btn" onClick={async () => {
                await updateResource({ id: expandedNote._id, content: noteEditContent });
                setExpandedNote(null);
              }}>
                <Save size={13} /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {expandedEmbed && (
        <div className="modal-overlay" onClick={() => setExpandedEmbed(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{expandedEmbed.label}</span>
              <button onClick={() => setExpandedEmbed(null)}><X size={16} /></button>
            </div>
            <iframe src={expandedEmbed.embedUrl} className="embed-frame" title={expandedEmbed.label} />
          </div>
        </div>
      )}

      {editingResource && (
        <div className="modal-overlay" onClick={() => setEditingResource(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Edit Resource</span>
              <button onClick={() => setEditingResource(null)}><X size={16} /></button>
            </div>
            <div className="form">
              <div className="form-row">
                <label>Label</label>
                <input
                  value={editFields.label}
                  onChange={(e) => setEditFields((p) => ({ ...p, label: e.target.value }))}
                />
              </div>
              {editingResource.type === "link" && (
                <div className="form-row">
                  <label>URL</label>
                  <input
                    value={editFields.url}
                    onChange={(e) => setEditFields((p) => ({ ...p, url: e.target.value }))}
                  />
                </div>
              )}
              {editingResource.type === "file" && (
                <div className="form-row">
                  <label>File Path</label>
                  <input
                    value={editFields.filePath}
                    onChange={(e) => setEditFields((p) => ({ ...p, filePath: e.target.value }))}
                  />
                </div>
              )}
              {editingResource.type === "note" && (
                <div className="form-row">
                  <label>Content</label>
                  <textarea
                    value={editFields.content}
                    onChange={(e) => setEditFields((p) => ({ ...p, content: e.target.value }))}
                    rows={6}
                  />
                </div>
              )}
              {editingResource.type === "embed" && (
                <div className="form-row">
                  <label>Embed URL</label>
                  <input
                    value={editFields.embedUrl}
                    onChange={(e) => setEditFields((p) => ({ ...p, embedUrl: e.target.value }))}
                  />
                </div>
              )}
              <div className="form-row">
                <label>Categories</label>
                <CategoryToggle
                  categories={categories}
                  selected={editFields.categories}
                  onChange={(cats) => setEditFields((p) => ({ ...p, categories: cats }))}
                />
              </div>
              <button className="submit-btn" onClick={handleSaveEdit}>
                <Save size={13} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Resource</span>
              <button onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <div className="form">
              <div className="form-row">
                <label>Type</label>
                <div className="type-selector">
                  {(["link", "file", "note", "embed"] as ResourceType[]).map((t) => (
                    <button
                      key={t}
                      className={`type-btn ${newResource.type === t ? "active" : ""}`}
                      onClick={() => setNewResource((p) => ({ ...p, type: t }))}
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
                  value={newResource.label}
                  onChange={(e) => setNewResource((p) => ({ ...p, label: e.target.value }))}
                />
              </div>
              {newResource.type === "link" && (
                <div className="form-row">
                  <label>URL</label>
                  <input
                    placeholder="https://..."
                    value={newResource.url}
                    onChange={(e) => setNewResource((p) => ({ ...p, url: e.target.value }))}
                  />
                </div>
              )}
              {newResource.type === "file" && (
                <div className="form-row">
                  <label>File Path</label>
                  <input
                    placeholder="file:///Users/you/Documents/file.html"
                    value={newResource.filePath}
                    onChange={(e) => setNewResource((p) => ({ ...p, filePath: e.target.value }))}
                  />
                </div>
              )}
              {newResource.type === "note" && (
                <div className="form-row">
                  <label>Content</label>
                  <textarea
                    placeholder="Your note..."
                    value={newResource.content}
                    onChange={(e) => setNewResource((p) => ({ ...p, content: e.target.value }))}
                    rows={4}
                  />
                </div>
              )}
              {newResource.type === "embed" && (
                <div className="form-row">
                  <label>Embed URL</label>
                  <input
                    placeholder="https://..."
                    value={newResource.embedUrl}
                    onChange={(e) => setNewResource((p) => ({ ...p, embedUrl: e.target.value }))}
                  />
                </div>
              )}
              <div className="form-row">
                <label>Categories</label>
                <CategoryToggle
                  categories={categories}
                  selected={newResource.categories}
                  onChange={(cats) => setNewResource((p) => ({ ...p, categories: cats }))}
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

        .pinned-section { margin-bottom: 32px; }
        .pinned-label {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .category-nav { display: flex; gap: 4px; margin-bottom: 32px; flex-wrap: wrap; align-items: center; }
        .cat-wrapper { position: relative; display: flex; align-items: center; }
        .cat-delete { position: absolute; top: -5px; right: -5px; background: #1a1a1a; border: 1px solid var(--border); color: var(--text-muted); border-radius: 50%; width: 14px; height: 14px; display: none; align-items: center; justify-content: center; cursor: pointer; padding: 0; z-index: 1; }
        .cat-wrapper:hover .cat-delete { display: flex; }
        .cat-delete:hover { color: #f87171; border-color: #f87171; }
        .cat-btn { background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 5px 14px; border-radius: 3px; cursor: pointer; font-family: inherit; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; transition: all 0.15s; }
        .cat-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .cat-btn.active { border-color: var(--accent); color: var(--accent); background: #ffffff08; }
        .cat-btn.ghost { color: var(--text-muted); border-style: dashed; display: flex; align-items: center; gap: 4px; }
        .cat-btn.ghost:hover { color: var(--text-secondary); border-color: var(--border-hover); }
        .inline-cat-form { display: flex; align-items: center; gap: 4px; }
        .inline-cat-form input { background: var(--bg); border: 1px solid var(--border-hover); color: var(--text-primary); padding: 4px 8px; border-radius: 3px; font-family: inherit; font-size: 11px; outline: none; width: 120px; }
        .inline-cat-form button { background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 4px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; transition: all 0.15s; }
        .inline-cat-form button:hover { color: var(--text-primary); border-color: var(--border-hover); }
        .add-btn { margin-left: auto; display: flex; align-items: center; gap: 5px; background: #ffffff0a; border: 1px solid var(--border); color: var(--text-secondary); padding: 5px 14px; border-radius: 3px; cursor: pointer; font-family: inherit; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; transition: all 0.15s; }
        .add-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: #ffffff14; }

        .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }

        .resource-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; position: relative; display: flex; flex-direction: column; gap: 6px; }
        .resource-card:hover { border-color: var(--border-hover); background: var(--bg-card-hover); transform: translateY(-1px); }
        .resource-card:hover .card-actions { opacity: 1; }

        .pinned-card {
          border-color: #dc2626 !important;
          box-shadow: 0 0 0 1px #dc262630, inset 0 0 20px #dc262608;
        }
        .pinned-card:hover { border-color: #ef4444 !important; }

        .card-header { display: flex; align-items: center; justify-content: space-between; }
        .type-badge { display: flex; align-items: center; gap: 4px; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8; }
        .card-actions { display: flex; align-items: center; gap: 4px; opacity: 0; transition: opacity 0.15s; }
        .action-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; align-items: center; transition: color 0.15s; }
        .action-btn:hover { color: var(--text-secondary); }
        .action-btn.delete:hover { color: #f87171; }
        .action-btn.pin-btn.pinned { color: #dc2626; opacity: 1 !important; }
        .action-btn.pin-btn:hover { color: #dc2626; }

        .card-label { font-size: 14px; font-weight: 500; color: var(--text-primary); letter-spacing: -0.01em; }
        .card-url { font-size: 10px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
        .card-meta { overflow: hidden; }

        .card-categories { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
        .card-cat-pill { font-size: 9px; color: var(--accent-dim); letter-spacing: 0.1em; text-transform: uppercase; background: #ffffff06; border: 1px solid var(--border); border-radius: 2px; padding: 1px 5px; }

        .empty-state { grid-column: 1 / -1; color: var(--text-muted); font-size: 12px; display: flex; gap: 12px; align-items: center; padding: 40px 0; }
        .empty-state button { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-family: inherit; font-size: 12px; transition: color 0.15s; }
        .empty-state button:hover { color: var(--text-primary); }

        .modal-overlay { position: fixed; inset: 0; background: #00000088; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modal { background: #141414; border: 1px solid var(--border-hover); border-radius: 6px; width: 100%; max-width: 480px; overflow: hidden; }
        .modal-wide { max-width: 720px; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); }
        .modal-header button { background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; transition: color 0.15s; }
        .modal-header button:hover { color: var(--text-primary); }
        .note-edit-wrap { padding: 16px 18px 0; }
        .note-edit-area { width: 100%; background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); padding: 12px 14px; border-radius: 4px; font-family: inherit; font-size: 13px; line-height: 1.7; outline: none; resize: vertical; box-sizing: border-box; transition: border-color 0.15s; }
        .note-edit-area:focus { border-color: var(--border-hover); }
        .note-footer { padding: 12px 18px 18px; }
        .embed-frame { width: 100%; height: 480px; border: none; display: block; background: var(--bg); }
        .form { padding: 20px 18px; display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: flex; flex-direction: column; gap: 6px; }
        .form-row label { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); }
        .form-row input, .form-row textarea, .form-row select { background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); padding: 8px 10px; border-radius: 3px; font-family: inherit; font-size: 12px; outline: none; transition: border-color 0.15s; resize: vertical; }
        .form-row select option { background: #141414; }
        .form-row input:focus, .form-row textarea:focus, .form-row select:focus { border-color: var(--border-hover); }

        .cat-toggle-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .cat-toggle-btn { background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 4px 10px; border-radius: 3px; cursor: pointer; font-family: inherit; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; transition: all 0.15s; }
        .cat-toggle-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .cat-toggle-btn.active { border-color: var(--accent); color: var(--accent); background: #ffffff08; }

        .type-selector { display: flex; gap: 6px; flex-wrap: wrap; }
        .type-btn { display: flex; align-items: center; gap: 5px; background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 5px 10px; border-radius: 3px; cursor: pointer; font-family: inherit; font-size: 11px; transition: all 0.15s; text-transform: capitalize; }
        .type-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .type-btn.active { border-color: var(--accent); color: var(--accent); background: #ffffff08; }
        .submit-btn { display: flex; align-items: center; gap: 6px; justify-content: center; background: #ffffff0f; border: 1px solid var(--border-hover); color: var(--text-primary); padding: 9px 16px; border-radius: 3px; cursor: pointer; font-family: inherit; font-size: 12px; letter-spacing: 0.05em; transition: all 0.15s; }
        .submit-btn:hover { background: #ffffff18; }
      `}</style>
    </div>
  );
}
