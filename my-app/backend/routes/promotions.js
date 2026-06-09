const express = require('express')
const prisma  = require('../prisma/client')
const authMiddleware     = require('../middleware/auth')
const { requireManager } = require('../middleware/role')

const router = express.Router()
router.use(authMiddleware)

// ── GET /api/promotions ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { active } = req.query
    const where = {}
    if (active !== undefined) where.is_active = active === 'true'

    const promotions = await prisma.eventPromotion.findMany({
      where,
      orderBy: { start_date: 'desc' },
    })
    res.json(promotions)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── GET /api/promotions/code/:code ────────────────────────
// Tra cứu promotion theo mã — dùng khi tạo đơn
router.get('/code/:code', async (req, res) => {
  try {
    const promo = await prisma.eventPromotion.findUnique({
      where: { code: req.params.code.toUpperCase() },
    })
    if (!promo) {
      return res.status(404).json({ error: 'Mã khuyến mãi không tồn tại.' })
    }
    if (!promo.is_active) {
      return res.status(400).json({ error: 'Mã khuyến mãi đã hết hạn hoặc không hoạt động.' })
    }
    // Kiểm tra ngày hết hạn
    const now = new Date()
    if (promo.end_date && new Date(promo.end_date) < now) {
      return res.status(400).json({ error: 'Mã khuyến mãi đã hết hạn.' })
    }
    if (promo.start_date && new Date(promo.start_date) > now) {
      return res.status(400).json({ error: 'Mã khuyến mãi chưa đến thời gian áp dụng.' })
    }
    res.json(promo)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── GET /api/promotions/:id ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const promo = await prisma.eventPromotion.findUnique({
      where: { event_id: req.params.id },
    })
    if (!promo) return res.status(404).json({ error: 'Không tìm thấy khuyến mãi.' })
    res.json(promo)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/promotions ──────────────────────────────────
// Tạo khuyến mãi mới (Manager only)
// Body: { name, code, event_type, type, value, min_order?, description?, start_date?, end_date? }
router.post('/', requireManager, async (req, res) => {
  const {
    name, code, event_type, type,
    value, min_order, description,
    start_date, end_date,
  } = req.body

  if (!name || !code || !event_type || !type || value === undefined) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' })
  }

  const validTypes = ['percent', 'fixed']
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Loại giảm giá không hợp lệ. Chọn: percent hoặc fixed.' })
  }

  if (type === 'percent' && parseFloat(value) > 100) {
    return res.status(400).json({ error: 'Giảm % không thể lớn hơn 100%.' })
  }

  // Validate code: chỉ chữ hoa và số
  const cleanCode = code.trim().toUpperCase()
  if (!/^[A-Z0-9]+$/.test(cleanCode)) {
    return res.status(400).json({ error: 'Mã chỉ được dùng chữ hoa và số, không dấu cách.' })
  }

  try {
    const promo = await prisma.eventPromotion.create({
      data: {
        name,
        code:        cleanCode,
        event_type,
        type,
        value:       parseFloat(value),
        min_order:   min_order ? parseFloat(min_order) : 0,
        description: description || null,
        start_date:  start_date  ? new Date(start_date)  : null,
        end_date:    end_date    ? new Date(end_date)    : null,
        is_active:   true,
      },
    })
    res.status(201).json(promo)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Mã khuyến mãi đã tồn tại.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/promotions/:id ─────────────────────────────
// Sửa khuyến mãi (Manager only)
router.patch('/:id', requireManager, async (req, res) => {
  const {
    name, value, min_order, description,
    start_date, end_date, is_active,
  } = req.body
  const data = {}
  if (name        !== undefined) data.name        = name
  if (value       !== undefined) data.value       = parseFloat(value)
  if (min_order   !== undefined) data.min_order   = parseFloat(min_order)
  if (description !== undefined) data.description = description
  if (start_date  !== undefined) data.start_date  = start_date ? new Date(start_date) : null
  if (end_date    !== undefined) data.end_date    = end_date   ? new Date(end_date)   : null
  if (is_active   !== undefined) data.is_active   = is_active

  try {
    const promo = await prisma.eventPromotion.update({
      where: { event_id: req.params.id },
      data,
    })
    res.json(promo)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── DELETE /api/promotions/:id ────────────────────────────
router.delete('/:id', requireManager, async (req, res) => {
  try {
    await prisma.eventPromotion.delete({ where: { event_id: req.params.id } })
    res.json({ message: 'Đã xóa khuyến mãi.' })
  } catch (err) {
    if (err.code === 'P2003') {
      // Đã áp dụng vào đơn → tắt thay vì xóa
      await prisma.eventPromotion.update({
        where: { event_id: req.params.id },
        data:  { is_active: false },
      })
      return res.json({ message: 'Khuyến mãi đã được dùng trong đơn hàng, đã tắt thay vì xóa.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

module.exports = router