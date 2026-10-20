// Shares the Home pig's on-screen Y so other screens can place their pig in the same spot
let anchorY = null;
const listeners = new Set();

export function setPigAnchorY(y) {
  if (anchorY !== null && Math.abs(anchorY - y) < 0.5) return;
  anchorY = y;
  listeners.forEach((fn) => fn(y));
}

export function getPigAnchorY() {
  return anchorY;
}

export function subscribePigAnchor(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
