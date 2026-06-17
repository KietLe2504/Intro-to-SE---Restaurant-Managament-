const express = require('express')
const prisma  = require('../prisma/client')
const authMiddleware     = require('../middleware/auth')
const { requireManager } = require('../middleware/role')

const router = express.Router()
router.use(authMiddleware)

// ── GET /api/tables ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { table_number: 'asc' },
      include: {
        orders: {
          where:  { status: { in: ['Pending', 'Serving'] } },
          select: { order_id: true, status: true, order_time: true },
        },
      },
    })
    res.json(tables)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})
// ── POST /api/tables/:id/reserve ──────────────────────────
// Đặt chỗ trước
router.post('/:id/reserve', async (req, res) => {
  const { name, phone, guests } = req.body
  if (!name || !guests) {
    return res.status(400).json({ error: 'Vui lòng nhập tên và số khách.' })
  }
  try {
    const table = await prisma.table.findUnique({ where: { table_id: req.params.id } })
    if (!table) return res.status(404).json({ error: 'Không tìm thấy bàn.' })
    if (table.status !== 'Available') {
      return res.status(400).json({ error: 'Bàn hiện không trống.' })
    }
    const updated = await prisma.table.update({
      where: { table_id: req.params.id },
      data: {
        status:          'Reserved',
        reserved_at:     new Date(),
        reserved_name:   name,
        reserved_phone:  phone || null,
        reserved_guests: parseInt(guests),
      },
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── DELETE /api/tables/:id/reserve ───────────────────────
// Hủy đặt chỗ / khách đến
router.delete('/:id/reserve', async (req, res) => {
  const { action } = req.body // 'cancel' | 'arrive'
  try {
    const updated = await prisma.table.update({
      where: { table_id: req.params.id },
      data: {
        status:          action === 'arrive' ? 'Occupied' : 'Available',
        reserved_at:     null,
        reserved_name:   null,
        reserved_phone:  null,
        reserved_guests: null,
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})
// ── GET /api/tables/:id ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const table = await prisma.table.findUnique({
      where: { table_id: req.params.id },
      include: {
        orders: {
          where:  { status: { in: ['Pending', 'Serving'] } },
          include: {
            order_items: { include: { dish: true } },
          },
        },
      },
    })
    if (!table) return res.status(404).json({ error: 'Không tìm thấy bàn.' })
    res.json(table)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/tables ──────────────────────────────────────
// Thêm bàn mới (Manager only)
router.post('/', requireManager, async (req, res) => {
  const { table_number, capacity, location } = req.body
  if (!table_number || !capacity) {
    return res.status(400).json({ error: 'Vui lòng điền số bàn và sức chứa.' })
  }
  try {
    const table = await prisma.table.create({
      data: {
        table_number: parseInt(table_number),
        capacity:     parseInt(capacity),
        location:     location || null,
        status:       'Available',
      },
    })
    res.status(201).json(table)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Số bàn đã tồn tại.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/tables/:id ─────────────────────────────────
// Cập nhật thông tin hoặc trạng thái bàn
router.patch('/:id', async (req, res) => {
  const { status, capacity, location, table_number } = req.body
  const data = {}

  // Manager mới được sửa thông tin bàn
  if (req.user.role === 'Manager') {
    if (capacity     !== undefined) data.capacity     = parseInt(capacity)
    if (location     !== undefined) data.location     = location
    if (table_number !== undefined) data.table_number = parseInt(table_number)
  }

  // Cả Staff và Manager đều cập nhật status được
  if (status !== undefined) {
    const validStatuses = ['Available', 'Occupied', "Reserved"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ.' })
    }
    data.status = status
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu để cập nhật.' })
  }

  try {
    const table = await prisma.table.update({
      where: { table_id: req.params.id },
      data,
    })
    res.json(table)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── DELETE /api/tables/:id ────────────────────────────────
// Xóa bàn (Manager only)
router.delete('/:id', requireManager, async (req, res) => {
  try {
    await prisma.table.delete({ where: { table_id: req.params.id } })
    res.json({ message: 'Đã xóa bàn.' })
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Bàn đã có đơn hàng, không thể xóa.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

module.exports = router