// Configuration for API Base URL
// In development: uses proxy (empty string)
// In production: uses env variable VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export default API_BASE_URL;
