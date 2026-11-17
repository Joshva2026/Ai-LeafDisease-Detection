/**
 * LeafGuard AI - Unified History Service
 * Uses IndexedDB for web, Capacitor Preferences for Android/iOS
 * Keeps latest 10 scan results per user
 */

const DB_NAME = 'LeafGuardHistory';
const DB_VERSION = 1;
const STORE_NAME = 'scans';
const MAX_ENTRIES = 10;

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
          ? scans.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); }).slice(0, MAX_ENTRIES)
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
  return getPreferences().then(function(Preferences) {
    if (!Preferences) return Promise.resolve(false);
    
    // Get current username from localStorage
    var username = 'guest';
    try {
      var userStr = localStorage.getItem('user');
      if (userStr) {
        var user = JSON.parse(userStr);
        username = user.username;
      }
    } catch (e) {
      username = 'guest';
    }

    return getScansFromCapacitor(username).then(function(scans) {
      var filtered = scans.filter(function(scan) {
        return scan.capacitorId !== id;
      });
      
      if (filtered.length === scans.length) {
        // Scan not found
        return false;
      }
      
      var updated = filtered.slice(0, MAX_ENTRIES);
      return Preferences.set({ key: 'history_' + username, value: JSON.stringify(updated) }).then(function() { return true; });
    });
  });
}

function clearHistoryFromCapacitor(username) {
  return getPreferences().then(function(Preferences) {
    if (!Preferences) return Promise.resolve(false);
    return Preferences.remove({ key: 'history_' + username }).then(function() { return true; });
  });
}

var historyService = {
  getScans: function(username) {
    if (!username) {
      try {
        var userStr = localStorage.getItem('user');
        if (userStr) {
          var user = JSON.parse(userStr);
          username = user.username;
        }
      } catch (e) {
        username = 'guest';
      }
    }

    if (isCapacitor()) {
      return getScansFromCapacitor(username);
    } else {
      return getScansFromIndexedDB(username);
    }
  },

  addScan: function(scan) {
    var scanToSave = Object.assign({}, scan, {
      timestamp: scan.timestamp || new Date().toISOString()
    });

    if (isCapacitor()) {
      return addScanToCapacitor(scanToSave);
    } else {
      return addScanToIndexedDB(scanToSave).then(function() { return true; }).catch(function(e) {
        console.error('Failed to add scan to IndexedDB:', e);
        return false;
      });
    }
  },

  deleteScan: function(id) {
    if (isCapacitor()) {
      return deleteScanFromCapacitor(id);
    } else {
      return deleteScanFromIndexedDB(id).then(function() { return true; }).catch(function(e) {
        console.error('Failed to delete scan from IndexedDB:', e);
        return false;
      });
    }
  },

  clearHistory: function(username) {
    if (!username) {
      try {
        var userStr = localStorage.getItem('user');
        if (userStr) {
          var user = JSON.parse(userStr);
          username = user.username;
        }
      } catch (e) {
        username = 'guest';
      }
    }

    if (isCapacitor()) {
      return clearHistoryFromCapacitor(username);
    } else {
      return clearHistoryFromIndexedDB(username).then(function() { return true; }).catch(function(e) {
        console.error('Failed to clear history from IndexedDB:', e);
        return false;
      });
    }
  },

  isNative: function() { return isCapacitor(); }
};

export default historyService;