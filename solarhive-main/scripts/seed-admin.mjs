import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";

// Bootstraps or promotes the first admin account. Run directly against
// Firestore with server-side env vars — this is intentionally NOT exposed
// over HTTP, since regular users must never be able to grant themselves
// the admin role through the API.
async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables are not set"
    );
  }
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the first admin");
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore();

  const normalizedEmail = email.trim().toLowerCase();
  const existingSnap = await db.collection("users").where("email", "==", normalizedEmail).limit(1).get();

  if (!existingSnap.empty) {
    const doc = existingSnap.docs[0];
    await doc.ref.update({ role: "admin" });
    console.log(`Promoted existing user ${normalizedEmail} to admin.`);
    return;
  }

  const counterRef = db.collection("counters").doc("users");
  const id = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists ? snap.data().value : 0) + 1;
    tx.set(counterRef, { value: next });
    return next;
  });

  const passwordHash = await bcrypt.hash(password, 10);
  await db
    .collection("users")
    .doc(String(id))
    .set({
      id,
      name,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: "admin",
      created_at: new Date().toISOString(),
    });

  console.log(`Created admin user ${normalizedEmail}.`);
}

main().catch((err) => {
  console.error("Seeding admin failed:", err);
  process.exit(1);
});
