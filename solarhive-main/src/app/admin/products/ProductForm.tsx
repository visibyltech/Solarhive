"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X } from "lucide-react";
import { groupCategories } from "@/lib/categories";
import type { ApiCategory } from "@/types/api";

export type ProductFormValues = {
  name: string;
  categoryId: string;
  price: string;
  oldPrice: string;
  description: string;
  image: string;
  stock: string;
  isActive: boolean;
};

const emptyValues: ProductFormValues = {
  name: "",
  categoryId: "",
  price: "",
  oldPrice: "",
  description: "",
  image: "",
  stock: "0",
  isActive: true,
};

type ProductFormProps = {
  initialValues?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (
    values: ProductFormValues,
    imageFile: File | null
  ) => Promise<{ error?: string } | void>;
};

const ProductForm = ({ initialValues, submitLabel, onSubmit }: ProductFormProps) => {
  const router = useRouter();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [values, setValues] = useState<ProductFormValues>({ ...emptyValues, ...initialValues });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const set = (key: keyof ProductFormValues, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (file: File | null) => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setImageFile(file);
    setObjectUrl(file ? URL.createObjectURL(file) : null);
  };

  const previewSrc = objectUrl ?? values.image;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await onSubmit(values, imageFile);
    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl rounded-2xl bg-black/5 p-6">
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Name
          </label>
          <input
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Category
          </label>
          <select
            required
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm focus:border-gold focus:outline-none"
          >
            <option value="" disabled className="bg-white">
              Select a category
            </option>
            {groupCategories(categories).map(({ parent, children }) =>
              children.length > 0 ? (
                <optgroup key={parent.slug} label={parent.name}>
                  {children.map((category) => (
                    <option key={category.id} value={category.id} className="bg-white">
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={parent.slug} value={parent.id} className="bg-white">
                  {parent.name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Price (₦)
            </label>
            <input
              required
              type="number"
              min={0}
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Old Price (₦)
            </label>
            <input
              type="number"
              min={0}
              value={values.oldPrice}
              onChange={(e) => set("oldPrice", e.target.value)}
              placeholder="Optional"
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Product Image
          </label>
          <div className="mt-2 flex items-center gap-4">
            {previewSrc && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewSrc} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
            <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 py-6 text-sm text-black/50 transition hover:border-gold hover:text-gold">
              <UploadCloud className="h-5 w-5" />
              {imageFile?.name ?? "Click to upload an image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {imageFile ? (
            <button
              type="button"
              onClick={() => handleFileChange(null)}
              className="mt-2 flex items-center gap-1 text-xs text-black/50 hover:text-gold"
            >
              <X className="h-3 w-3" /> Remove selected file, use a URL instead
            </button>
          ) : (
            <>
              <label className="mt-3 block text-xs font-semibold tracking-wide text-black/60 uppercase">
                Or Image URL
              </label>
              <input
                value={values.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://images.example.com/product.jpg"
                className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
              />
            </>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
            Description
          </label>
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Stock
            </label>
            <input
              required
              type="number"
              min={0}
              value={values.stock}
              onChange={(e) => set("stock", e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2 text-sm text-black/70">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="accent-gold"
              />
              Active (visible in shop)
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
};

export default ProductForm;
