const express        = require('express')
const prisma         = require('../prisma/client')
const authMiddleware = require('../middleware/auth')
const { requireManager } = require('../middleware/role')

const router = express.Router()
router.use(authMiddleware)

// ── GET /api/employees ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        employee_id: true,
        name:        true,
        username:    true,
        role:        true,
        phone:       true,
        is_active:   true,
        created_at:  true,
        _count: { select: { orders: true } },
      },
    })
    res.json(employees)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── GET /api/employees/:id ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { employee_id: req.params.id },
      select: {
        employee_id: true,
        name:        true,
        username:    true,
        role:        true,
        phone:       true,
        is_active:   true,
        created_at:  true,
        _count: { select: { orders: true } },
      },
    })
    if (!employee) return res.status(404).json({ error: 'Không tìm thấy nhân viên.' })
    res.json(employee)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/employees/:id ──────────────────────────────
// Cập nhật tên, phone (Manager hoặc chính chủ)
router.patch('/:id', async (req, res) => {
  const { name, phone } = req.body

  // Chỉ cho phép Manager hoặc chính chủ tài khoản
  const isSelf    = req.user.employee_id === req.params.id
  const isManager = req.user.role === 'Manager'
  if (!isSelf && !isManager) {
    return res.status(403).json({ error: 'Không có quyền chỉnh sửa tài khoản này.' })
  }

  const data = {}
  if (name  !== undefined) data.name  = name
  if (phone !== undefined) data.phone = phone || null

  try {
    const updated = await prisma.employee.update({
      where: { employee_id: req.params.id },
      data,
      select: {
        employee_id: true,
        name:        true,
        username:    true,
        role:        true,
        phone:       true,
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── DELETE /api/employees/:id ─────────────────────────────
// Xóa tài khoản (Manager only, không tự xóa mình)
router.delete('/:id', requireManager, async (req, res) => {
  if (req.user.employee_id === req.params.id) {
    return res.status(400).json({ error: 'Không thể xóa tài khoản của chính mình.' })
  }

  try {
    await prisma.employee.delete({ where: { employee_id: req.params.id } })
    res.json({ message: 'Đã xóa tài khoản.' })
  } catch (err) {
    if (err.code === 'P2003') {
      // Có orders liên quan → deactivate thay vì xóa
      await prisma.employee.update({
        where: { employee_id: req.params.id },
        data:  { is_active: false },
      })
      return res.json({ message: 'Tài khoản có đơn hàng liên quan, đã vô hiệu hóa thay vì xóa.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

module.exports = router