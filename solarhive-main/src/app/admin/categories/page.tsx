"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

type Category = { id: number; name: string; slug: string; image: string | null; parent_id: number | null };

const emptyForm = { name: "", slug: "", image: "", parentId: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Category>>({});
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState(emptyForm);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const applyCategories = (list: Category[]) => {
    setCategories(list);
    setDrafts(Object.fromEntries(list.map((c) => [c.id, c])));
  };

  const load = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => applyCategories(data.categories ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => applyCategories(data.categories ?? []))
      .finally(() => setLoading(false));
  }, []);

  const updateDraft = (id: number, field: keyof Category, value: string | number | null) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const parentOptions = categories.filter((c) => c.parent_id === null);
  const topLevel = categories.filter((c) => c.parent_id === null);
  const childrenOf = (parentId: number) => categories.filter((c) => c.parent_id === parentId);
  const orphaned = categories.filter(
    (c) => c.parent_id !== null && !categories.some((p) => p.id === c.parent_id)
  );

  const handleSave = async (id: number) => {
    setError("");
    setSavingId(id);
    const draft = drafts[id];
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        slug: draft.slug,
        image: draft.image || null,
        parent_id: draft.parent_id,
      }),
    });
    const data = await res.json();
    setSavingId(null);
    if (!res.ok) {
      setError(data.error ?? "Failed to save category");
      return;
    }
    load();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? Categories that still have products or subcategories can't be deleted.`))
      return;
    setError("");
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to delete category");
      return;
    }
    load();
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategory.name,
        slug: newCategory.slug || undefined,
        image: newCategory.image || null,
        parent_id: newCategory.parentId ? Number(newCategory.parentId) : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create category");
      return;
    }
    setNewCategory(emptyForm);
    load();
  };

  const CategoryRow = ({ category, indent }: { category: Category; indent: boolean }) => {
    const draft = drafts[category.id] ?? category;
    return (
      <div
        className={`flex flex-wrap items-center gap-3 rounded-2xl bg-black/5 p-4 ${indent ? "ml-8" : ""}`}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/10">
          {draft.image && <Image src={draft.image} alt={draft.name} fill className="object-cover" />}
        </div>
        <input
          value={draft.name}
          onChange={(e) => updateDraft(category.id, "name", e.target.value)}
          className="min-w-40 flex-1 rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm focus:border-gold focus:outline-none"
        />
        <input
          value={draft.slug}
          onChange={(e) => updateDraft(category.id, "slug", e.target.value)}
          className="min-w-32 flex-1 rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm text-black/60 focus:border-gold focus:outline-none"
        />
        <input
          value={draft.image ?? ""}
          onChange={(e) => updateDraft(category.id, "image", e.target.value)}
          placeholder="Image URL"
          className="min-w-40 flex-1 rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
        />
        <select
          value={draft.parent_id ?? ""}
          onChange={(e) =>
            updateDraft(category.id, "parent_id", e.target.value ? Number(e.target.value) : null)
          }
          className="rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm focus:border-gold focus:outline-none"
        >
          <option value="">Top-level</option>
          {parentOptions
            .filter((p) => p.id !== category.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                Under {p.name}
              </option>
            ))}
        </select>
        <button
          onClick={() => handleSave(category.id)}
          disabled={savingId === category.id}
          className="rounded-md bg-gold px-4 py-2 text-xs font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingId === category.id ? "Saving…" : "Save"}
        </button>
        <button onClick={() => handleDelete(category.id, category.name)} className="text-black/50 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Categories ({categories.length})</h2>
      <p className="mt-1 text-sm text-black/50">
        Two levels supported. Solar Hive currently uses a flat catalog — Solar Package,
        Inverters, Batteries, Charge Controllers, Panels, Accessories —
        but you can nest subcategories under any of them if needed.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl bg-black/5 p-4"
      >
        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Name
          </label>
          <input
            required
            value={newCategory.name}
            onChange={(e) => setNewCategory((v) => ({ ...v, name: e.target.value }))}
            className="mt-2 rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Slug (optional)
          </label>
          <input
            value={newCategory.slug}
            onChange={(e) => setNewCategory((v) => ({ ...v, slug: e.target.value }))}
            placeholder="auto from name"
            className="mt-2 rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Image URL
          </label>
          <input
            value={newCategory.image}
            onChange={(e) => setNewCategory((v) => ({ ...v, image: e.target.value }))}
            placeholder="https://images.example.com/category.jpg"
            className="mt-2 rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Parent Category
          </label>
          <select
            value={newCategory.parentId}
            onChange={(e) => setNewCategory((v) => ({ ...v, parentId: e.target.value }))}
            className="mt-2 rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          >
            <option value="">None (top-level)</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          + Add Category
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-sm text-black/50">Loading…</p>
      ) : (
        <div className="mt-6 space-y-3">
          {topLevel.map((parent) => (
            <div key={parent.id} className="space-y-3">
              <CategoryRow category={parent} indent={false} />
              {childrenOf(parent.id).map((child) => (
                <CategoryRow key={child.id} category={child} indent />
              ))}
            </div>
          ))}
          {orphaned.map((category) => (
            <CategoryRow key={category.id} category={category} indent={false} />
          ))}
        </div>
      )}
    </div>
  );
}
