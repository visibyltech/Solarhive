import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// One-time catalog seed for a fresh Solar Hive Firestore project — run
// directly against Firestore with server-side env vars. Safe to re-run:
// categories and products are matched by slug and skipped if they already
// exist.
const CATEGORIES = [
  { name: "Solar Package", slug: "solar-package", image: "/solarhive/products/residential-rooftop-scenic.jpg" },
  { name: "Inverters", slug: "inverters", image: "/solarhive/products/inverter-battery-stack.jpg" },
  { name: "Batteries", slug: "batteries", image: "/solarhive/products/battery-standalone.jpg" },
  { name: "Charge Controllers", slug: "charge-controllers", image: "/solarhive/products/charge-controller-unit.jpg" },
  { name: "Panels", slug: "panels", image: "/solarhive/products/solar-panel-standalone.jpg" },
  { name: "Accessories", slug: "accessories", image: "/solarhive/products/mounting-rail-kit.jpg" },
];

const PRODUCTS = [
  { category: "solar-package", name: "3kVA Home Solar Starter System", slug: "3kva-home-solar-starter-system", description: "A complete entry-level system for a small home — panels, inverter, and battery sized to run lights, fans, TV, and small appliances.", image: "/solarhive/products/residential-rooftop-scenic.jpg", price: 850000, old_price: 950000, rating: 4.6, reviews_count: 31, stock: 12 },
  { category: "solar-package", name: "5kVA Residential Solar System", slug: "5kva-residential-solar-system", description: "Our most popular home system — enough capacity to run a full household including AC units, fridges, and pumping systems.", image: "/solarhive/products/residential-rooftop-close.jpg", price: 1450000, old_price: null, rating: 4.8, reviews_count: 47, stock: 8 },
  { category: "solar-package", name: "20kVA Commercial Solar System", slug: "20kva-commercial-solar-system", description: "Reliable, affordable power for offices, shops, and small businesses — cuts generator running costs and downtime.", image: "/solarhive/products/commercial-rooftop-aerial.jpg", price: 5800000, old_price: 6500000, rating: 4.7, reviews_count: 22, stock: 4 },
  { category: "solar-package", name: "50kVA Industrial Solar Array", slug: "50kva-industrial-solar-array", description: "A large-scale rooftop or ground-mount array built for factories, warehouses, and industrial facilities.", image: "/solarhive/products/commercial-field-array.jpg", price: 13500000, old_price: null, rating: 4.6, reviews_count: 9, stock: 2 },
  { category: "solar-package", name: "10kVA Solar Farm System", slug: "10kva-solar-farm-system", description: "Keeps your farm running even in remote areas — powers irrigation, storage, and processing equipment off-grid.", image: "/solarhive/products/agricultural-farm-barn.jpg", price: 3200000, old_price: null, rating: 4.7, reviews_count: 14, stock: 5 },
  { category: "solar-package", name: "Solar Water Pumping System", slug: "solar-water-pumping-system", description: "Off-grid solar water pumping for irrigation and livestock — no diesel, no grid connection needed.", image: "/solarhive/products/agricultural-ground-mount.jpg", price: 1850000, old_price: 2100000, rating: 4.5, reviews_count: 18, stock: 7 },
  { category: "inverters", name: "5kVA Pure Sine Wave Inverter & Battery Bank", slug: "5kva-inverter-battery-bank", description: "A complete inverter and battery bank setup — clean pure sine wave power with reliable storage for cloudy days.", image: "/solarhive/products/inverter-battery-stack.jpg", price: 980000, old_price: null, rating: 4.8, reviews_count: 39, stock: 15 },
  { category: "charge-controllers", name: "Solar Charge Controller Unit", slug: "solar-charge-controller-unit", description: "Regulates power from your panels to your battery bank, protecting against overcharging and extending battery life.", image: "/solarhive/products/charge-controller-unit.jpg", price: 145000, old_price: 165000, rating: 4.4, reviews_count: 26, stock: 20 },
  { category: "panels", name: "435W Monocrystalline Solar Panel", slug: "435w-monocrystalline-solar-panel", description: "High-efficiency monocrystalline panel for new installations or expanding an existing array. Built to withstand Nigerian sun and weather for 25+ years.", image: "/solarhive/products/solar-panel-standalone.jpg", price: 185000, old_price: null, rating: 4.7, reviews_count: 21, stock: 40 },
  { category: "batteries", name: "200Ah Deep Cycle Solar Battery", slug: "200ah-deep-cycle-solar-battery", description: "Long-life deep cycle battery for storing solar power and running your home or business through the night and cloudy days.", image: "/solarhive/products/battery-standalone.jpg", price: 420000, old_price: null, rating: 4.6, reviews_count: 19, stock: 18 },
  { category: "accessories", name: "Solar Mounting Rail Kit", slug: "solar-mounting-rail-kit", description: "Complete aluminum mounting rail and clamp kit for securely fixing panels to roof or ground mounts.", image: "/solarhive/products/mounting-rail-kit.jpg", price: 95000, old_price: null, rating: 4.5, reviews_count: 17, stock: 25 },
  { category: "accessories", name: "Professional Installation Service", slug: "professional-installation-service", description: "Certified technicians handle site survey, mounting, wiring, and commissioning for your solar system.", image: "/solarhive/products/installation-service.jpg", price: 250000, old_price: null, rating: 4.9, reviews_count: 33, stock: 50 },
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
  for (const cat of CATEGORIES) {
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

  for (const p of PRODUCTS) {
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

  console.log("Catalog seed complete.");
}

main().catch((err) => {
  console.error("Seeding catalog failed:", err);
  process.exit(1);
});
