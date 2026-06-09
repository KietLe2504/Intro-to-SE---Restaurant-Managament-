const express  = require('express')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const prisma   = require('../prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// ── POST /api/auth/login ──────────────────────────────────
// Body: { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập username và password.' })
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { username },
    })

    if (!employee) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' })
    }

    if (!employee.is_active) {
      return res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa.' })
    }

    const isMatch = await bcrypt.compare(password, employee.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' })
    }

    const token = jwt.sign(
      {
        employee_id: employee.employee_id,
        username:    employee.username,
        role:        employee.role,
        name:        employee.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      user: {
        employee_id: employee.employee_id,
        name:        employee.name,
        username:    employee.username,
        role:        employee.role,
        phone:       employee.phone,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/auth/register ───────────────────────────────
// Tạo tài khoản Manager mới (không cần auth)
// Body: { name, username, password, phone }
router.post('/register', async (req, res) => {
  const { name, username, password, phone } = req.body

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu tối thiểu 6 ký tự.' })
  }

  try {
    const existing = await prisma.employee.findUnique({ where: { username } })
    if (existing) {
      return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại.' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const employee = await prisma.employee.create({
      data: { name, username, password_hash, role: 'Manager', phone: phone || null },
    })

    res.status(201).json({
      message: 'Đăng ký thành công!',
      user: {
        employee_id: employee.employee_id,
        name:        employee.name,
        username:    employee.username,
        role:        employee.role,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/auth/create-staff ───────────────────────────
// Manager tạo tài khoản Staff
// Body: { name, username, password, phone }
router.post('/create-staff', authMiddleware, async (req, res) => {
  if (req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Chỉ Manager mới có quyền tạo tài khoản nhân viên.' })
  }

  const { name, username, password, phone } = req.body

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu tối thiểu 6 ký tự.' })
  }

  try {
    const existing = await prisma.employee.findUnique({ where: { username } })
    if (existing) {
      return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại.' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const employee = await prisma.employee.create({
      data: { name, username, password_hash, role: 'Staff', phone: phone || null },
    })

    res.status(201).json({
      message: `Tạo tài khoản ${name} thành công!`,
      user: {
        employee_id: employee.employee_id,
        name:        employee.name,
        username:    employee.username,
        role:        employee.role,
        phone:       employee.phone,
      },
    })
  } catch (err) {
    console.error('Create staff error:', err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────
// Lấy thông tin user hiện tại từ token
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { employee_id: req.user.employee_id },
      select: {
        employee_id: true,
        name:        true,
        username:    true,
        role:        true,
        phone:       true,
        is_active:   true,
      },
    })
    if (!employee) return res.status(404).json({ error: 'Không tìm thấy tài khoản.' })
    res.json(employee)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

module.exports = router