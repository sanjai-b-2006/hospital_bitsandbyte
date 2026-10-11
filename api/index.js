// Vercel serverless entry point.
// Vercel automatically maps `api/index.js` to handle every /api/* request,
// so the existing Express routes (all prefixed /api/...) work unchanged.
import app from '../server/server.js';

export default app;