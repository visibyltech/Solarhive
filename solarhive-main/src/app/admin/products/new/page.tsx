"use client";

import ProductForm, { ProductFormValues } from "../ProductForm";

export default function NewProductPage() {
  const handleSubmit = async (values: ProductFormValues, imageFile: File | null) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("categoryId", values.categoryId);
    formData.set("price", values.price);
    if (values.oldPrice) formData.set("oldPrice", values.oldPrice);
    if (values.description) formData.set("description", values.description);
    formData.set("stock", values.stock);

    if (imageFile) {
      formData.set("imageFile", imageFile);
    } else if (values.image) {
      formData.set("imageUrl", values.image);
    }

    const res = await fetch("/api/admin/products", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Failed to create product" };
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">New Product</h2>
      <div className="mt-6">
        <ProductForm submitLabel="Create Product" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
