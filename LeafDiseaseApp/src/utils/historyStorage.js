// Utility for safe history persistence in localStorage
// Stores only lightweight metadata and limits history size to 50 entries

const MAX_HISTORY_ENTRIES = 50;

/**
 * Load history for a given username from localStorage.
 * @param {string} username
 * @returns {Array} Array of history entries or empty array
 */
export function loadHistory(username) {
  try {
    const data = localStorage.getItem(`history_${username}`);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    console.warn("Failed to load history for", username, e);
    return [];
  }
}

/**
 * Save history array for a given username to localStorage.
 * Trims to MAX_HISTORY_ENTRIES.
 * @param {string} username
 * @param {Array} history
 */
export function saveHistory(username, history) {
  try {
    // Sanitize entries: remove any base64, blob, or file data
    const sanitized = history.map(entry => {
      const newEntry = {};
      Object.keys(entry).forEach(key => {
        if (!key.includes('base64') && !key.includes('blob') && !key.includes('file')) {
          newEntry[key] = entry[key];
        }
      });
      return newEntry;
    });
    const trimmed = sanitized.slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(`history_${username}`, JSON.stringify(trimmed));
  } catch (e) {
    // Handle quota exceeded gracefully by trimming older entries without wiping history
    if (e.name === 'QuotaExceededError' || (e.message && e.message.includes('quota'))) {
      console.warn(`Quota exceeded for history_${username}. Trimming history to 10 entries.`);
      try {
        const trimmed10 = history.slice(0, 10);
        localStorage.setItem(`history_${username}`, JSON.stringify(trimmed10));
      } catch (err) {
        console.error("Could not save trimmed history", err);
      }
    } else {
      console.warn("Failed to save history for", username, e);
    }
  }
}
