/* ========================================== */
/* db.js: IndexedDB Client-Side Database      */
/* ========================================== */

const DB_NAME = "PlatformDB";
const DB_VERSION = 1;
const STORE_NAME = "offline_proposals";

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        console.log(`🗄️ Database Store '${STORE_NAME}' created.`);
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);

    request.onerror = (event) => {
      console.error("IndexedDB Error:", event.target.errorCode);
      reject("Failed to open database.");
    };
  });
}

export async function saveOfflineData(payload) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.add({
      ...payload,
      savedAt: Date.now(),
    });

    request.onsuccess = () => {
      console.log("💾 Data safely stored in IndexedDB for future sync.");
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Failed to save data:", event.target.error);
      reject(event.target.error);
    };
  });
}

// Bonus: retrieve everything saved while offline
export async function getOfflineData() {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}
