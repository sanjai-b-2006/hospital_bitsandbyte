// Minimal standalone Vercel function — no Express import.
// If this works but /api/health doesn't, the problem is the Express import,
// not Vercel's function deployment.
export default function handler(req, res) {
  res.json({ pong: true, at: new Date().toISOString(), preview: 'medassist' });
}