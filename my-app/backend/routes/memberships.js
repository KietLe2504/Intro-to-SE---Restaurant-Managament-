const express = require('express')
const prisma  = require('../prisma/client')
const authMiddleware     = require('../middleware/auth')
const { requireManager } = require('../middleware/role')

const router = express.Router()
router.use(authMiddleware)

// ── GET /api/memberships ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      orderBy: { min_spend: 'asc' },
      include: { _count: { select: { customers: true } } },
    })
    res.json(memberships)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/memberships ─────────────────────────────────
// Tạo hạng thành viên (Manager only)
// Body: { level, min_spend, point_rate, benefit_description? }
router.post('/', requireManager, async (req, res) => {
  const { level, min_spend, point_rate, benefit_description } = req.body
  if (!level || min_spend === undefined || point_rate === undefined) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' })
  }
  try {
    const membership = await prisma.membership.create({
      data: {
        level,
        min_spend:           parseFloat(min_spend),
        point_rate:          parseFloat(point_rate),
        benefit_description: benefit_description || null,
      },
    })
    res.status(201).json(membership)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/memberships/:id ────────────────────────────
router.patch('/:id', requireManager, async (req, res) => {
  const { min_spend, point_rate, benefit_description } = req.body
  const data = {}
  if (min_spend           !== undefined) data.min_spend           = parseFloat(min_spend)
  if (point_rate          !== undefined) data.point_rate          = parseFloat(point_rate)
  if (benefit_description !== undefined) data.benefit_description = benefit_description

  try {
    const membership = await prisma.membership.update({
      where: { membership_id: req.params.id },
      data,
    })
    res.json(membership)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── DELETE /api/memberships/:id ───────────────────────────
router.delete('/:id', requireManager, async (req, res) => {
  try {
    await prisma.membership.delete({ where: { membership_id: req.params.id } })
    res.json({ message: 'Đã xóa hạng thành viên.' })
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Hạng này đang có khách hàng sử dụng.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

module.exports = router