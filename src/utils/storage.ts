export const STORAGE_KEY = "resumeData_v1";
export function load<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
}
export function save<T>(data: T) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
}
