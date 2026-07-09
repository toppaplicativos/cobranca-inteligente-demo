// Service Worker for Cobrança Inteligente
const CACHE_NAME = 'cobranca-inteligente-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
];

const DB_NAME = 'CobrancaOfflineDB';
const STORE_NAME = 'syncQueue';

// Broadcast Channel for UI communication
const syncChannel = new BroadcastChannel('cobranca-sync');

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Caching failed during install, skipping assets:', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch Event (Network first, fallback to cache)
self.addEventListener('fetch', (event) => {
  // Only handle standard HTTP/HTTPS requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache new assets if they are valid
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Background Sync Event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recebimentos') {
    event.waitUntil(syncPendingPayments());
  }
});

// Listen to direct messages (e.g. manual sync request)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    event.waitUntil(
      syncPendingPayments().then((syncedCount) => {
        event.ports[0]?.postMessage({ success: true, syncedCount });
      }).catch((err) => {
        event.ports[0]?.postMessage({ success: false, error: err.message });
      })
    );
  }
});

// Sync Logic
async function syncPendingPayments() {
  console.log('[Service Worker] Background sync triggered!');
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    
    request.onerror = () => {
      console.error('[Service Worker] Failed to open IndexedDB in Service Worker:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = async () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('[Service Worker] Store does not exist yet.');
        resolve(0);
        return;
      }
      
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
      
      getAllRequest.onsuccess = async () => {
        const items = getAllRequest.result || [];
        if (items.length === 0) {
          console.log('[Service Worker] No pending payments to synchronize.');
          resolve(0);
          return;
        }
        
        console.log(`[Service Worker] Found ${items.length} pending payments to sync.`);
        
        let successCount = 0;
        
        // Process each item in sequence
        for (const item of items) {
          try {
            console.log(`[Service Worker] Syncing receipt for client ${item.parcela.clienteNome}, parcel id: ${item.id}`);
            
            // Send to server (Simulated server API call)
            // In a real environment, this would do fetch('/api/recebimentos', { method: 'POST', body: JSON.stringify(item.parcela) })
            await simulateServerUpload(item.parcela);
            
            // Delete from IndexedDB upon successful upload
            await deleteFromIndexedDB(db, item.id);
            successCount++;
            
            // Broadcast single item sync completion to active clients
            syncChannel.postMessage({
              type: 'SYNC_ITEM_SUCCESS',
              parcelaId: item.id,
              parcela: item.parcela,
              timestamp: new Date().toISOString()
            });
            
          } catch (error) {
            console.error(`[Service Worker] Failed to sync item ${item.id}:`, error);
          }
        }
        
        // Broadcast total sync summary
        syncChannel.postMessage({
          type: 'SYNC_ALL_COMPLETE',
          count: successCount,
          timestamp: new Date().toISOString()
        });
        
        resolve(successCount);
      };
    };
  });
}

// Simulates a slow API upload with a promise delay
function simulateServerUpload(parcela) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 201, message: 'Payment synchronized with server.' });
    }, 1000); // 1s network latency simulation
  });
}

// Delete item helper
function deleteFromIndexedDB(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
