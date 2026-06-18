const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'lifehope-web-2605'
});
const db = admin.firestore();
// Connect to the Firestore emulator
db.settings({
  host: 'localhost:8080',
  ssl: false
});

async function run() {
  const ref = db.collection('demo').doc('test');
  await ref.set({ hello: 'world' });
  const snap = await ref.get();
  console.log('Document data:', snap.data());
}

run().catch(err => {
  console.error('Error:', err);
});
