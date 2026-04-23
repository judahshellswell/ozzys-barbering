import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('/Users/judahshellswell/Downloads/ozzys-barbering-firebase-adminsdk-fbsvc-d5f1ab467a.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  // Delete all existing services
  const existing = await db.collection('services').get();
  const deletes = existing.docs.map((d) => d.ref.delete());
  await Promise.all(deletes);
  console.log(`Deleted ${existing.size} old services`);

  // Add the one real service
  await db.collection('services').add({
    name: "Boys Haircut",
    description: "Clean, fresh cut for boys of all ages. Scissor or clipper, styled to finish.",
    duration: 30,
    price: 12,
    active: true,
    order: 1,
    createdAt: new Date(),
  });
  console.log('Added: Boys Haircut');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
