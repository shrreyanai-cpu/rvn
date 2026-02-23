const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 12;

export function addToRecentlyViewed(productId: number): void {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((id) => id !== productId);
    filtered.unshift(productId);
    const trimmed = filtered.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable
  }
}

export function getRecentlyViewed(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number");
  } catch {
    return [];
  }
}
