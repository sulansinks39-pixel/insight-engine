/**
 * Cookie/tracking consent. Non-essential scripts are NEVER loaded until the
 * visitor actively opts in — there is no implied consent and no pre-ticked box.
 */
export type ConsentValue = "granted" | "denied";

const KEY = "evidence.cookie-consent.v1";

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === "granted" || raw === "denied" ? raw : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    /* storage unavailable — treat as denied for this session */
  }
  window.dispatchEvent(new CustomEvent("evidence:consent", { detail: value }));
  if (value === "granted") loadNonEssentialScripts();
}

let loaded = false;

/**
 * Single place where analytics / marketing scripts may be injected.
 * Called only after explicit opt-in. Empty by design until such a script
 * is actually added to the project.
 */
export function loadNonEssentialScripts() {
  if (loaded || readConsent() !== "granted") return;
  loaded = true;
  // e.g. append <script src="https://analytics.example.com/script.js"> here.
}
