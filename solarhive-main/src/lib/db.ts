import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let db: Firestore | null = null;

function getApp(): App {
  if (!app) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables are not set"
      );
    }
    const existing = getApps();
    app = existing.length ? existing[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp());
  }
  return db;
}

// Firestore has no auto-increment integers, but the whole frontend (cart,
// wishlist, admin forms, order refs) is typed and written against numeric
// ids. A "counters" collection with one doc per collection name, updated
// inside a transaction, gives us the same sequential numeric ids Postgres
// did instead of switching everything to string ids.
export async function nextId(collectionName: string): Promise<number> {
  const database = getDb();
  const counterRef = database.collection("counters").doc(collectionName);
  return database.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists ? (snap.data()!.value as number) : 0) + 1;
    tx.set(counterRef, { value: next });
    return next;
  });
}
