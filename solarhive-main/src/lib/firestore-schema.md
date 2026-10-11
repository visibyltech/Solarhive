# Solar Hive — Firestore data model

Firestore is schemaless (no migration step — collections and fields are
created implicitly on first write). This documents the shape every route in
`src/app/api/**` reads and writes, so it stays consistent across routes.

All numeric ids are assigned via `nextId()` in `src/lib/db.ts` (a
transactional counter per collection) and used as both the `id` field and
the document's own ID (as a string) — this keeps the whole frontend, which
is typed and written against numeric ids (cart, wishlist, admin forms,
order references), unchanged from the previous Postgres-backed version.

Dates are stored as ISO strings (not Firestore `Timestamp`s), since routes
return them directly as JSON.

### `users/{id}`
`{ id, name, email, password_hash, role: "user" | "admin", created_at }`
Every account is created with role `"user"`; role is only ever changed to
`"admin"` by an existing admin (`PATCH /api/admin/users/[id]/role`) or by
`scripts/seed-admin.mjs` run directly against Firestore.

### `categories/{id}`
`{ id, name, slug, image, parent_id: number | null, created_at }`
`parent_id` is `null` for a top-level category and set for a leaf category
nested under one. Only two levels are supported; products always belong to
a leaf category when a hierarchy is in use (Solar Hive's own catalog is flat —
every category is top-level with no children).

### `products/{id}`
`{ id, category_id, name, slug, description, image, image_data, image_mime_type, price, old_price, rating, reviews_count, stock, is_active, created_at, updated_at }`
`image` is the URL/path rendered everywhere. `image_data`/`image_mime_type`
are only set when the admin uploaded a file directly rather than linking to
an external image (and `image` becomes `/api/products/[id]/image`).

### `orders/{id}`
`{ id, user_id: number | null, status: "pending" | "completed", payment_method: "bank-transfer" | "installments" | "klump", full_name, email, phone, address, city, subtotal, delivery_fee, total, installment_weeks, installment_interest_rate, installment_deposit, receipt_filename, receipt_mime_type, receipt_data, items: OrderItem[], created_at }`
`items` is embedded directly on the order document (no separate collection)
since it's always read and written together with its order. Each
`OrderItem` is `{ id, product_id: number | null, name, image, price, qty }`,
`id` being that item's own position id within the order (assigned via
`nextId("order_items")`), used only to give each row a stable React key.
Klump orders have no receipt (Klump verifies itself).

### `newsletter_subscribers/{email}`
`{ email, created_at }` — keyed by email (lowercased) for free uniqueness,
equivalent to the old `ON CONFLICT (email) DO NOTHING`.

### `counters/{collectionName}`
`{ value: number }` — internal, not read by any route. Holds the last
assigned id for the named collection.
