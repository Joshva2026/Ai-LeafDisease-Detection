/**
 * LeafGuard AI - Unified History Service
 * Uses Firebase Firestore (primary), IndexedDB (web fallback), Capacitor Preferences (Android/iOS fallback)
 * Keeps latest 50 scan results per user (local) / unlimited (Firestore)
 */

import { 
  saveScanReport as firebaseSaveScan, 
  getUserScans as firebaseGetScans, 
  deleteScanReport as firebaseDeleteScan, 
  clearUserScans as firebaseClearHistory,
  isFirebaseEnabled,
  firebaseDb
} from './firebase';

const DB_NAME = 'LeafGuardHistory';
const DB_VERSION = 1;
const STORE_NAME = 'scans';
const MAX_ENTRIES = 50; // Increased for better local history

function isCapacitor() {
  return typeof window !== 'undefined' &&
         window.Capacitor &&
         window.Capacitor.isNativePlatform();
}

function getPreferences() {
  return new Promise(function(resolve) {
    if (isCapacitor() && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
      resolve(window.Capacitor.Plugins.Preferences);
    } else {
      resolve(null);
    }
  });
}

// Unified username getter: checks localStorage (web) then Capacitor Preferences (Android/iOS)
function getCurrentUsername() {
  // 1. Check localStorage (web)
  try {
    var userStr = localStorage.getItem('user');
    if (userStr) {
      var user = JSON.parse(userStr);
      if (user && user.username) {
        return Promise.resolve(user.username);
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // 2. Check Capacitor Preferences (Android/iOS native)
  if (isCapacitor()) {
    return getPreferences().then(function(Preferences) {
      if (!Preferences) return 'guest';
      return Preferences.get({ key: 'user' }).then(function(result) {
        if (result && result.value) {
          try {
            var user = JSON.parse(result.value);
            if (user && user.username) {
              return user.username;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        return 'guest';
      });
    });
  }

  // 3. Fallback
  return Promise.resolve('guest');
}

// Simple UUID generator for Capacitor scans
function generateScanId() {
  return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function initIndexedDB() {
  return new Promise(function(resolve, reject) {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    var request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = function() { reject(request.error); };
    request.onsuccess = function() { resolve(request.result); };

    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        var store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('username', 'username', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getScansFromIndexedDB(username) {
  return initIndexedDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([STORE_NAME], 'readonly');
      var store = transaction.objectStore(STORE_NAME);
      var index = store.index('username');
      var request = index.getAll(username);

      request.onsuccess = function() {
        var scans = request.result
          .sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); })
          .slice(0, MAX_ENTRIES);
        resolve(scans);
      };
      request.onerror = function() { reject(request.error); };
    });
  });
}

function addScanToIndexedDB(scan) {
  return initIndexedDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([STORE_NAME], 'readwrite');
      var store = transaction.objectStore(STORE_NAME);

      var scanWithUser = Object.assign({}, scan);
      if (!scanWithUser.username) {
        var userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            var user = JSON.parse(userStr);
            scanWithUser.username = user.username;
          } catch (e) {
            scanWithUser.username = 'guest';
          }
        } else {
          scanWithUser.username = 'guest';
        }
      }

      if (!scanWithUser.timestamp) {
        scanWithUser.timestamp = new Date().toISOString();
      }

      return new Promise(function(resolve, reject) {
        var request = store.add(scanWithUser);
        request.onsuccess = function() {
          enforceMaxEntries(db, scanWithUser.username).then(resolve).catch(reject);
        };
        request.onerror = function() { reject(request.error); };
      });
    });
  });
}

function deleteScanFromIndexedDB(id) {
  return initIndexedDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([STORE_NAME], 'readwrite');
      var store = transaction.objectStore(STORE_NAME);
      var request = store.delete(id);
      request.onsuccess = function() { resolve(true); };
      request.onerror = function() { reject(request.error); };
    });
  });
}

function clearHistoryFromIndexedDB(username) {
  return initIndexedDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var transaction = db.transaction([STORE_NAME], 'readwrite');
      var store = transaction.objectStore(STORE_NAME);
      var index = store.index('username');
      var request = index.getAllKeys(username);

      request.onsuccess = function() {
        var keys = request.result;
        var completed = 0;
        var total = keys.length;

        if (total === 0) {
          resolve(true);
          return;
        }

        keys.forEach(function(key) {
          var deleteRequest = store.delete(key);
          deleteRequest.onsuccess = function() {
            completed++;
            if (completed === total) resolve(true);
          };
          deleteRequest.onerror = function() { reject(deleteRequest.error); };
        });
      };
      request.onerror = function() { reject(request.error); };
    });
  });
}

function enforceMaxEntries(db, username) {
  return new Promise(function(resolve, reject) {
    var transaction = db.transaction([STORE_NAME], 'readwrite');
    var store = transaction.objectStore(STORE_NAME);
    var index = store.index('username');
    var request = index.getAllKeys(username);

    request.onsuccess = function() {
      var keys = request.result;
      if (keys.length > MAX_ENTRIES) {
        var keysToDelete = keys.slice(0, keys.length - MAX_ENTRIES);
        var deleted = 0;

        if (keysToDelete.length === 0) {
          resolve();
          return;
        }

        keysToDelete.forEach(function(key) {
          var deleteRequest = store.delete(key);
          deleteRequest.onsuccess = function() {
            deleted++;
            if (deleted === keysToDelete.length) resolve();
          };
          deleteRequest.onerror = function() { reject(deleteRequest.error); };
        });
      } else {
        resolve();
      }
    };
    request.onerror = function() { reject(request.error); };
  });
}

function getScansFromCapacitor(username) {
  return getPreferences().then(function(Preferences) {
    if (!Preferences) return Promise.resolve([]);
    return Preferences.get({ key: 'history_' + username }).then(function(result) {
      if (!result.value) return [];
      try {
        var scans = JSON.parse(result.value);
        return Array.isArray(scans)
          ? scans.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); }).slice(0, MAX_ENTRIES).map(function(scan) {
              // Normalize: map capacitorId to id for consistent API
              // Backward compat: assign capacitorId if missing (legacy scans)
              var capacitorId = scan.capacitorId || scan.id || generateScanId();
              return Object.assign({}, scan, { id: capacitorId, capacitorId: capacitorId });
            })
          : [];
      } catch (e) {
        console.warn('Failed to load history from Capacitor:', e);
        return [];
      }
    });
  });
}

function addScanToCapacitor(scan) {
  return getPreferences().then(function(Preferences) {
    if (!Preferences) return Promise.resolve(false);
    var username = scan.username || 'guest';
    return getScansFromCapacitor(username).then(function(existing) {
      var scanWithUser = Object.assign({}, scan, { username: username });
      if (!scanWithUser.timestamp) {
        scanWithUser.timestamp = new Date().toISOString();
      }
      // Generate unique ID for Capacitor scan
      if (!scanWithUser.capacitorId) {
        scanWithUser.capacitorId = generateScanId();
      }
      var updated = [scanWithUser].concat(existing).slice(0, MAX_ENTRIES);
      return Preferences.set({ key: 'history_' + username, value: JSON.stringify(updated) }).then(function() { return true; });
    });
  });
}

function deleteScanFromCapacitor(id) {
  return getCurrentUsername().then(function(username) {
    return getPreferences().then(function(Preferences) {
      if (!Preferences) return Promise.resolve(false);
      
      return getScansFromCapacitor(username).then(function(scans) {
        var filtered = scans.filter(function(scan) {
          // Match by capacitorId (new) or id (legacy normalized)
          return scan.capacitorId !== id && scan.id !== id;
        });
        
        if (filtered.length === scans.length) {
          // Scan not found
          return false;
        }
        
        var updated = filtered.slice(0, MAX_ENTRIES);
        return Preferences.set({ key: 'history_' + username, value: JSON.stringify(updated) }).then(function() { return true; });
      });
    });
  });
}

function clearHistoryFromCapacitor(username) {
  return getPreferences().then(function(Preferences) {
    if (!Preferences) return Promise.resolve(false);
    return Preferences.remove({ key: 'history_' + username }).then(function() { return true; });
  });
}

// ============================================
// UNIFIED HISTORY SERVICE WITH FIRESTORE SYNC
// ============================================

var historyService = {
  /**
   * Get scans for a user - tries Firestore first, falls back to local storage
   */
  getScans: async function(username) {
    const user = username || await getCurrentUsername();
    
    // Try Firestore first if enabled
    if (isFirebaseEnabled()) {
      try {
        const firestoreScans = await firebaseGetScans(user);
        if (firestoreScans && firestoreScans.length > 0) {
          // Sync to local storage for offline access
          await this._syncToLocal(user, firestoreScans);
          return firestoreScans.map(s => ({ ...s, source: 'firestore' }));
        }
      } catch (e) {
        console.warn('Firestore getScans failed, falling back to local:', e);
      }
    }
    
    // Fallback to local storage
    if (isCapacitor()) {
      return getScansFromCapacitor(user);
    } else {
      return getScansFromIndexedDB(user);
    }
  },

  /**
   * Internal: sync Firestore scans to local storage
   */
  _syncToLocal: async function(username, scans) {
    if (isCapacitor()) {
      const Preferences = await getPreferences();
      if (Preferences) {
        const localScans = scans.slice(0, MAX_ENTRIES).map(scan => ({
          ...scan,
          id: scan.id || scan.firestoreId || generateScanId(),
          capacitorId: scan.id || scan.firestoreId || generateScanId(),
          firestoreId: scan.id,
        }));
        await Preferences.set({ key: 'history_' + username, value: JSON.stringify(localScans) });
      }
    } else {
      const db = await initIndexedDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing for this user
      const index = store.index('username');
      const keysRequest = index.getAllKeys(username);
      keysRequest.onsuccess = () => {
        keysRequest.result.forEach(key => store.delete(key));
        scans.slice(0, MAX_ENTRIES).forEach(scan => {
          const scanWithUser = { 
            ...scan, 
            username, 
            id: scan.id || scan.firestoreId || undefined, // Let auto-increment handle it
            firestoreId: scan.id 
          };
          store.add(scanWithUser);
        });
      };
    }
  },

  /**
   * Add a scan - saves to Firestore (if available) and local storage
   */
  addScan: async function(scan) {
    const scanToSave = Object.assign({}, scan, {
      timestamp: scan.timestamp || new Date().toISOString()
    });
    
    const username = await getCurrentUsername();
    let firestoreId = null;
    let success = false;

    // 1. Try Firestore first
    if (isFirebaseEnabled()) {
      try {
        firestoreId = await firebaseSaveScan(username, {
          ...scanToSave,
          // Don't store images in Firestore
          originalImageUrl: scanToSave.original_url || null,
          gradcamImageUrl: scanToSave.gradcam_url || null,
        });
        success = true;
        console.log('[History] Saved to Firestore:', firestoreId);
      } catch (e) {
        console.warn('[History] Firestore save failed:', e);
      }
    }

    // 2. Always save to local storage as backup/offline
    const localScan = {
      ...scanToSave,
      firestoreId,
      id: firestoreId || generateScanId(),
    };

    if (isCapacitor()) {
      const localSuccess = await addScanToCapacitor({ ...localScan, username });
      success = success || localSuccess;
    } else {
      try {
        await addScanToIndexedDB(localScan);
        success = true;
      } catch (e) {
        console.error('[History] IndexedDB save failed:', e);
      }
    }

    return success;
  },

  /**
   * Delete a scan from both Firestore and local storage
   */
  deleteScan: async function(id) {
    const username = await getCurrentUsername();
    let deleted = false;
    let errors = [];

    // 1. Try Firestore if the ID looks like a Firestore ID or we have a mapping
    if (isFirebaseEnabled()) {
      try {
        await firebaseDeleteScan(username, id);
        deleted = true;
        console.log('[History] Deleted from Firestore:', id);
      } catch (e) {
        console.warn('[History] Firestore delete failed:', e);
        errors.push(e.message);
      }
    }

    // 2. Delete from local storage
    let localDeleted = false;
    if (isCapacitor()) {
      localDeleted = await deleteScanFromCapacitor(id);
    } else {
      try {
        await deleteScanFromIndexedDB(id);
        localDeleted = true;
      } catch (e) {
        console.error('[History] IndexedDB delete failed:', e);
        errors.push(e.message);
      }
    }
    deleted = deleted || localDeleted;

    if (!deleted) {
      throw new Error('Failed to delete scan: ' + errors.join(', '));
    }

    return true;
  },

  /**
   * Clear all history for a user from both Firestore and local storage
   */
  clearHistory: async function(username) {
    const user = username || await getCurrentUsername();
    let cleared = false;
    let errors = [];

    // 1. Clear Firestore
    if (isFirebaseEnabled()) {
      try {
        const count = await firebaseClearHistory(user);
        console.log('[History] Cleared', count, 'scans from Firestore');
        cleared = true;
      } catch (e) {
        console.warn('[History] Firestore clear failed:', e);
        errors.push(e.message);
      }
    }

    // 2. Clear local storage
    let localCleared = false;
    if (isCapacitor()) {
      localCleared = await clearHistoryFromCapacitor(user);
    } else {
      try {
        await clearHistoryFromIndexedDB(user);
        localCleared = true;
      } catch (e) {
        console.error('[History] IndexedDB clear failed:', e);
        errors.push(e.message);
      }
    }
    cleared = cleared || localCleared;

    if (!cleared) {
      throw new Error('Failed to clear history: ' + errors.join(', '));
    }

    return true;
  },

  /**
   * Check if Firestore is available
   */
  isFirestoreEnabled: isFirebaseEnabled,

  isNative: function() { return isCapacitor(); }
};

export default historyService;