import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('/Users/judahshellswell/Downloads/ozzys-barbering-firebase-adminsdk-fbsvc-d5f1ab467a.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const services = [
  { name: 'Haircut', description: 'Classic scissor or clipper cut, styled to finish.', duration: 30, price: 20, active: true, order: 1 },
  { name: 'Haircut & Beard', description: 'Full haircut plus beard trim and shape.', duration: 45, price: 28, active: true, order: 2 },
  { name: 'Beard Trim', description: 'Beard shape, line-up and tidy.', duration: 20, price: 12, active: true, order: 3 },
  { name: 'Skin Fade', description: 'Precision skin fade with styled finish.', duration: 45, price: 25, active: true, order: 4 },
  { name: 'Kids Cut (under 12)', description: 'Haircut for children 12 and under.', duration: 20, price: 14, active: true, order: 5 },
];

const availability = [
  { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isActive: false }, // Sun
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },  // Mon
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },  // Tue
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },  // Wed
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },  // Thu
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },  // Fri
  { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isActive: true },  // Sat
];

async function seed() {
  console.log('Seeding services...');
  for (const s of services) {
    await db.collection('services').add({ ...s, createdAt: new Date() });
    console.log(`  ✓ ${s.name}`);
  }

  console.log('Seeding availability...');
  for (const a of availability) {
    await db.collection('availability').doc(String(a.dayOfWeek)).set(a);
    console.log(`  ✓ Day ${a.dayOfWeek} (${a.isActive ? 'open' : 'closed'})`);
  }

  console.log('\nDone! Database seeded.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
