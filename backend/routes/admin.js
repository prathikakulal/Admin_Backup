// backend/routes/admin.js
// Admin API routes — served via Firebase Admin SDK (bypasses Firestore security rules)

const express       = require('express')
const { getAdmin }  = require('../firebase/admin')

const router = express.Router()

// ── Health / status ───────────────────────────────────────────────────────────
router.get('/status', (_req, res) => {
  res.json({
    service: 'traxelon-admin-backend',
    version: '1.0.0',
    ts: new Date().toISOString(),
  })
})

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Returns all documents in the `users` collection
router.get('/users', async (_req, res) => {
  try {
    const db   = getAdmin().firestore()
    const snap = await db.collection('users').orderBy('createdAt', 'desc').get()
    const data = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
    res.json(data)
  } catch (err) {
    console.error('[admin/users]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/links ──────────────────────────────────────────────────────
// Returns all documents in the `trackingLinks` collection
router.get('/links', async (_req, res) => {
  try {
    const db   = getAdmin().firestore()
    const snap = await db.collection('trackingLinks').orderBy('createdAt', 'desc').limit(200).get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json(data)
  } catch (err) {
    console.error('[admin/links]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
// Returns aggregate counts (used by Overview)
router.get('/stats', async (_req, res) => {
  try {
    const db = getAdmin().firestore()
    const [usersSnap, linksSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('trackingLinks').get(),
    ])
    const users     = usersSnap.docs.map(d => d.data())
    const approved  = users.filter(u => u.status === 'approved').length
    const pending   = users.filter(u => u.status === 'pending').length
    const credits   = users.reduce((s, u) => s + (u.credits || 0), 0)
    const captures  = linksSnap.docs.reduce((s, d) => s + (d.data().captures?.length || 0), 0)
    res.json({
      totalOfficers: usersSnap.size,
      approved,
      pending,
      totalCredits: credits,
      totalLinks:   linksSnap.size,
      totalCaptures: captures,
    })
  } catch (err) {
    console.error('[admin/stats]', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
