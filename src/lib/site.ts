/** Public contact addresses. Override per deployment with VITE_* env vars. */
export const PRIVACY_EMAIL: string = import.meta.env["VITE_PRIVACY_EMAIL"] ?? "privacy@evidence.app";
export const LEGAL_EMAIL: string = import.meta.env["VITE_LEGAL_EMAIL"] ?? "legal@evidence.app";
