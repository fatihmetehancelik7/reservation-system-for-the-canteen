# Frontend Config

The frontend can read build time settings through Vite.

API URL sets the backend API base URL.
Active year optionally overrides the reservation year at build time.

If active year is not supplied, the frontend falls back to the current browser year. The backend remains the source of truth for reservation validation.
