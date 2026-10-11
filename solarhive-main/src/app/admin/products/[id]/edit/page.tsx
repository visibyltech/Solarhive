"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm, { ProductFormValues } from "../../ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<Partial<ProductFormValues> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.product) {
          setNotFound(true);
          return;
        }
        const p = data.product;
        setInitialValues({
          name: p.name,
          categoryId: String(p.category_id),
          price: String(p.price),
          oldPrice: p.old_price != null ? String(p.old_price) : "",
          description: p.description ?? "",
          image: p.image ?? "",
          stock: String(p.stock),
          isActive: p.is_active,
        });
      });
  }, [params.id]);

  const handleSubmit = async (values: ProductFormValues, imageFile: File | null) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("categoryId", values.categoryId);
    formData.set("price", values.price);
    if (values.oldPrice) formData.set("oldPrice", values.oldPrice);
    formData.set("description", values.description);
    formData.set("stock", values.stock);
    formData.set("isActive", String(values.isActive));

    if (imageFile) {
      formData.set("imageFile", imageFile);
    } else if (values.image) {
      formData.set("imageUrl", values.image);
    }

    const res = await fetch(`/api/admin/products/${params.id}`, {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Failed to update product" };
  };

  if (notFound) {
    return <p className="text-sm text-black/50">Product not found.</p>;
  }

  if (!initialValues) {
    return <p className="text-sm text-black/50">Loading…</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Edit Product</h2>
      <div className="mt-6">
        <ProductForm initialValues={initialValues} submitLabel="Save Changes" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
