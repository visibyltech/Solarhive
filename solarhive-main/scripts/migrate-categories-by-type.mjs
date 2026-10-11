import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// One-time migration: replace the customer-segment category taxonomy
// (Residential / Commercial / Agricultural / Inverters & Batteries /
// Accessories & Installation) with a product-type taxonomy (Solar Package /
// Inverters / Batteries / Charge Controllers / Panels / Accessories).
// Safe to re-run: category renames are keyed by old slug, new categories
// are matched by slug, and product reassignment is idempotent.

const RENAMES = [
  // old slug -> new category fields (keeps the same doc id)
  { oldSlug: "residential", name: "Solar Package", slug: "solar-package", image: "/solarhive/products/residential-rooftop-scenic.jpg" },
  { oldSlug: "inverters-batteries", name: "Inverters", slug: "inverters", image: "/solarhive/products/inverter-battery-stack.jpg" },
  { oldSlug: "accessories-installation", name: "Accessories", slug: "accessories", image: "/solarhive/products/mounting-rail-kit.jpg" },
];

const NEW_CATEGORIES = [
  { name: "Batteries", slug: "batteries", image: "/solarhive/products/battery-standalone.jpg" },
  { name: "Charge Controllers", slug: "charge-controllers", image: "/solarhive/products/charge-controller-unit.jpg" },
  { name: "Panels", slug: "panels", image: "/solarhive/products/solar-panel-standalone.jpg" },
];

const REMOVED_SLUGS = ["commercial", "agricultural"];

// product slug -> new category slug it should move to
const PRODUCT_MOVES = {
  "20kva-commercial-solar-system": "solar-package",
  "50kva-industrial-solar-array": "solar-package",
  "10kva-solar-farm-system": "solar-package",
  "solar-water-pumping-system": "solar-package",
  "solar-charge-controller-unit": "charge-controllers",
};

const NEW_PRODUCTS = [
  {
    category: "panels",
    name: "435W Monocrystalline Solar Panel",
    slug: "435w-monocrystalline-solar-panel",
    description: "High-efficiency monocrystalline panel for new installations or expanding an existing array. Built to withstand Nigerian sun and weather for 25+ years.",
    image: "/solarhive/products/solar-panel-standalone.jpg",
    price: 185000,
    old_price: null,
    rating: 4.7,
    reviews_count: 21,
    stock: 40,
  },
  {
    category: "batteries",
    name: "200Ah Deep Cycle Solar Battery",
    slug: "200ah-deep-cycle-solar-battery",
    description: "Long-life deep cycle battery for storing solar power and running your home or business through the night and cloudy days.",
    image: "/solarhive/products/battery-standalone.jpg",
    price: 420000,
    old_price: null,
    rating: 4.6,
    reviews_count: 19,
    stock: 18,
  },
];

async function nextId(db, collectionName) {
  const counterRef = db.collection("counters").doc(collectionName);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists ? snap.data().value : 0) + 1;
    tx.set(counterRef, { value: next });
    return next;
  });
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables are not set"
    );
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore();
  const now = new Date().toISOString();

  const slugToId = {};

  // Rename existing categories in place (keeps their doc id, so any
  // product still pointing at that category_id keeps working automatically).
  for (const cat of RENAMES) {
    const existing = await db.collection("categories").where("slug", "==", cat.oldSlug).limit(1).get();
    if (existing.empty) {
      console.log(`Category with old slug "${cat.oldSlug}" not found, skipping rename.`);
      continue;
    }
    const doc = existing.docs[0];
    await doc.ref.update({ name: cat.name, slug: cat.slug, image: cat.image });
    slugToId[cat.slug] = doc.data().id;
    console.log(`Renamed category "${cat.oldSlug}" -> "${cat.slug}" (id ${doc.data().id}).`);
  }

  // Create the new categories that didn't exist before.
  for (const cat of NEW_CATEGORIES) {
    const existing = await db.collection("categories").where("slug", "==", cat.slug).limit(1).get();
    if (!existing.empty) {
      slugToId[cat.slug] = existing.docs[0].data().id;
      console.log(`Category "${cat.name}" already exists, skipping.`);
      continue;
    }
    const id = await nextId(db, "categories");
    await db.collection("categories").doc(String(id)).set({
      id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      parent_id: null,
      created_at: now,
    });
    slugToId[cat.slug] = id;
    console.log(`Created category "${cat.name}" (id ${id}).`);
  }

  // Move products that belonged to a now-removed category (commercial,
  // agricultural) or need to split out (charge controller) to their new home.
  for (const [productSlug, newCategorySlug] of Object.entries(PRODUCT_MOVES)) {
    const existing = await db.collection("products").where("slug", "==", productSlug).limit(1).get();
    if (existing.empty) {
      console.log(`Product "${productSlug}" not found, skipping move.`);
      continue;
    }
    const newCategoryId = slugToId[newCategorySlug];
    await existing.docs[0].ref.update({ category_id: newCategoryId, updated_at: now });
    console.log(`Moved product "${productSlug}" -> category "${newCategorySlug}" (id ${newCategoryId}).`);
  }

  // Add the two new standalone products so Panels and Batteries aren't empty.
  for (const p of NEW_PRODUCTS) {
    const existing = await db.collection("products").where("slug", "==", p.slug).limit(1).get();
    if (!existing.empty) {
      console.log(`Product "${p.name}" already exists, skipping.`);
      continue;
    }
    const id = await nextId(db, "products");
    await db.collection("products").doc(String(id)).set({
      id,
      category_id: slugToId[p.category],
      name: p.name,
      slug: p.slug,
      description: p.description,
      image: p.image,
      image_data: null,
      image_mime_type: null,
      price: p.price,
      old_price: p.old_price,
      rating: p.rating,
      reviews_count: p.reviews_count,
      stock: p.stock,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
    console.log(`Created product "${p.name}" (id ${id}).`);
  }

  // Now that commercial/agricultural products have all moved to
  // solar-package, the now-empty old category docs can be removed.
  for (const oldSlug of REMOVED_SLUGS) {
    const existing = await db.collection("categories").where("slug", "==", oldSlug).limit(1).get();
    if (existing.empty) {
      console.log(`Category "${oldSlug}" already removed.`);
      continue;
    }
    const stillUsed = await db.collection("products").where("category_id", "==", existing.docs[0].data().id).limit(1).get();
    if (!stillUsed.empty) {
      console.log(`Category "${oldSlug}" still has products assigned, NOT deleting.`);
      continue;
    }
    await existing.docs[0].ref.delete();
    console.log(`Deleted now-empty category "${oldSlug}".`);
  }

  console.log("Category migration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
