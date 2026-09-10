/**
 * localStorage helpers shared by the review, read and opt-in stores.
 *
 * All three keep a flat `Record<string, T>` and must degrade quietly: a corrupt or unavailable
 * store is a reason to lose triage state, never a reason to break the bell.
 */

export function readRecordFromStorage<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    // Anything other than a plain object (a stale format, a hand-edited value) is discarded.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeRecordToStorage<T>(key: string, value: Record<string, T>) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not persist smart notification state to ${key}`, error);
  }
}
