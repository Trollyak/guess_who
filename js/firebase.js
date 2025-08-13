// Firestore realtime lobby sync
// Public API used by script_v3.js

(function(){
  if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) {
    console.warn('Firebase config is empty. Realtime sync disabled.');
    window.Realtime = {
      init: () => false,
      ensureRoom: async () => null,
      onRoomSnapshot: () => () => {},
      updateRoom: async () => {},
    };
    return;
  }

  const app = firebase.initializeApp(window.FIREBASE_CONFIG);
  const db = firebase.firestore(app);

  const rooms = db.collection('rooms');

  function getRoomIdFromHash() {
    // Treat current hash without changes as roomId
    // Ensure basic format (6-8 upper/alnum as used in code)
    const hash = (document.location.hash || '').replace('#','');
    return hash || null;
  }

  async function ensureRoom(roomId, initialState){
    const ref = rooms.doc(roomId);
    const doc = await ref.get();
    if (!doc.exists) {
      await ref.set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        // game state
        dataset: initialState.dataset, // number (index_world)
        seed: initialState.seed,       // number
        name: initialState.name || '', // world name for display
      });
    }
    return ref;
  }

  function onRoomSnapshot(roomId, callback){
    return rooms.doc(roomId).onSnapshot(snap => {
      if (!snap.exists) return;
      callback(snap.data());
    });
  }

  async function updateRoom(roomId, partial){
    await rooms.doc(roomId).set({
      ...partial,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  window.Realtime = {
    init: () => true,
    getRoomIdFromHash,
    ensureRoom,
    onRoomSnapshot,
    updateRoom,
  };
})();





