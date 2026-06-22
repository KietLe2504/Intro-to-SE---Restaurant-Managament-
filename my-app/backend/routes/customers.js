const express = require('express')
const prisma  = require('../prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
router.use(authMiddleware)

// ── GET /api/customers ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query
    const where = {}
    if (phone) where.phone = { contains: phone }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        membership: true,
        _count: { select: { orders: true } },  // 👈 thêm dòng này
      },
      orderBy: { created_at: 'desc' },
    })
    res.json(customers)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})
// ── GET /api/customers/phone/:phone ───────────────────────
// Tra cứu theo SĐT (dùng khi tạo đơn)
router.get('/phone/:phone', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where:   { phone: req.params.phone },
      include: { membership: true },
    })
    if (!customer) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' })
    res.json(customer)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── GET /api/customers/:id ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where:   { customer_id: req.params.id },
      include: {
        membership: true,
        orders: {
          orderBy: { order_time: 'desc' },
          take: 10,
          select: {
            order_id:     true,
            order_time:   true,
            status:       true,
            total_amount: true,
          },
        },
      },
    })
    if (!customer) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' })
    res.json(customer)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/customers ───────────────────────────────────
// Đăng ký thành viên mới
// Body: { name, phone, email? }
router.post('/', async (req, res) => {
  const { name, phone, email } = req.body
  if (!name || !phone) {
    return res.status(400).json({ error: 'Vui lòng điền họ tên và số điện thoại.' })
  }

  try {
    // Tìm membership Bronze (mặc định khi đăng ký)
    const bronzeMembership = await prisma.membership.findFirst({
      where: { level: 'Bronze' },
    })

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email:         email || null,
        membership_id: bronzeMembership?.membership_id || null,
      },
      include: { membership: true },
    })
    res.status(201).json(customer)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Số điện thoại đã được đăng ký.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/customers/:id ──────────────────────────────
// Cập nhật thông tin khách hàng
router.patch('/:id', async (req, res) => {
  const { name, email, phone } = req.body
  const data = {}
  if (name)  data.name  = name
  if (email) data.email = email
  if (phone) data.phone = phone

  try {
    const customer = await prisma.customer.update({
      where: { customer_id: req.params.id },
      data,
      include: { membership: true },
    })
    res.json(customer)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/customers/:id/points ──────────────────────
// Điều chỉnh điểm (Manager only)
// Body: { delta } — số dương để cộng, số âm để trừ
router.patch('/:id/points', async (req, res) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Chỉ Manager mới có quyền điều chỉnh điểm.' })
  }

  const delta = parseInt(req.body.delta)
  if (isNaN(delta)) {
    return res.status(400).json({ error: 'Giá trị điểm không hợp lệ.' })
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { customer_id: req.params.id },
    })
    if (!customer) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' })

    const newPoints = Math.max(0, customer.total_points + delta)
    const updated = await prisma.customer.update({
      where: { customer_id: req.params.id },
      data:  { total_points: newPoints },
      include: { membership: true },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/customers/recalculate-tiers ─────────────────
// Tính lại total_spent và membership cho TẤT CẢ khách hàng (Manager only)
router.post('/recalculate-tiers', async (req, res) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Chỉ Manager mới có quyền thực hiện.' })
  }

  try {
    const customers = await prisma.customer.findMany()
    const memberships = await prisma.membership.findMany({
      orderBy: { min_spend: 'desc' },
    })

    let updated = 0
    for (const customer of customers) {
      // Tính tổng chi tiêu từ các đơn Completed
      const result = await prisma.order.aggregate({
        where: { customer_id: customer.customer_id, status: 'Completed' },
        _sum: { total_amount: true },
      })
      const totalSpent = parseFloat(result._sum.total_amount || 0)

      // Tìm tier phù hợp
      const tier = memberships.find(m => totalSpent >= parseFloat(m.min_spend))

      await prisma.customer.update({
        where: { customer_id: customer.customer_id },
        data: {
          total_spent:   totalSpent,
          membership_id: tier?.membership_id || null,
        },
      })
      updated++
    }

    res.json({ message: `Đã cập nhật hạng cho ${updated} khách hàng.` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

module.exports = router