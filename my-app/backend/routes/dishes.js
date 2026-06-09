const express = require('express')
const prisma  = require('../prisma/client')
const authMiddleware     = require('../middleware/auth')
const { requireManager } = require('../middleware/role')
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

// ── Multer config ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/dishes'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `dish-${Date.now()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true)
    else cb(new Error('Chỉ chấp nhận ảnh jpeg, jpg, png, webp'))
  },
})

const router = express.Router()
router.use(authMiddleware)

// ── GET /api/dishes ───────────────────────────────────────
// Lấy tất cả món (Staff + Manager)
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query
    const where = {}
    if (category)  where.category     = category
    if (available) where.is_available = available === 'true'

    const dishes = await prisma.dish.findMany({
      where,
      orderBy: [{ category: 'asc' }, { dish_name: 'asc' }],
    })
    res.json(dishes)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── GET /api/dishes/:id ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const dish = await prisma.dish.findUnique({
      where: { dish_id: req.params.id },
    })
    if (!dish) return res.status(404).json({ error: 'Không tìm thấy món.' })
    res.json(dish)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})


// ── POST /api/dishes ──────────────────────────────────────
// Thêm món mới (Manager only)
// Body: { dish_name, category, price, description?, emoji? }
router.post('/', requireManager, async (req, res) => {
  const { dish_name, category, price, description } = req.body

  if (!dish_name || !category || !price) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ tên món, danh mục và giá.' })
  }

  const validCategories = ['Khai vi', 'Mon chinh', 'Trang mieng', 'Do uong']
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Danh mục không hợp lệ. Chọn: ${validCategories.join(', ')}` })
  }

  try {
    const dish = await prisma.dish.create({
      data: {
        dish_name,
        category,
        price:        parseFloat(price),
        description:  description || null,
        is_available: true,
      },
    })
    res.status(201).json(dish)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/dishes/:id ─────────────────────────────────
// Sửa món (Manager only)
router.patch('/:id', requireManager, async (req, res) => {
  const { dish_name, category, price, description, is_available } = req.body
  const data = {}
  if (dish_name    !== undefined) data.dish_name    = dish_name
  if (category     !== undefined) data.category     = category
  if (price        !== undefined) data.price        = parseFloat(price)
  if (description  !== undefined) data.description  = description
  if (is_available !== undefined) data.is_available = is_available

  try {
    const dish = await prisma.dish.update({
      where: { dish_id: req.params.id },
      data,
    })
    res.json(dish)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── DELETE /api/dishes/:id ────────────────────────────────
// Xóa món (Manager only)
router.delete('/:id', requireManager, async (req, res) => {
  try {
    await prisma.dish.delete({ where: { dish_id: req.params.id } })
    res.json({ message: 'Đã xóa món.' })
  } catch (err) {
    // Nếu món đã có trong order thì không xóa được — ẩn đi thay vì xóa
    if (err.code === 'P2003') {
      await prisma.dish.update({
        where: { dish_id: req.params.id },
        data:  { is_available: false },
      })
      return res.json({ message: 'Món đã có trong đơn hàng, đã ẩn thay vì xóa.' })
    }
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/dishes/:id/image ────────────────────────────
router.post('/:id/image', requireManager, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Vui lòng chọn ảnh.' })
  try {
    // Xóa ảnh cũ nếu có
    const old = await prisma.dish.findUnique({ where: { dish_id: req.params.id } })
    if (old?.image_url) {
      const oldPath = path.join(__dirname, '..', old.image_url)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
    const image_url = `/uploads/dishes/${req.file.filename}`
    const dish = await prisma.dish.update({
      where: { dish_id: req.params.id },
      data:  { image_url },
    })
    res.json(dish)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})
module.exports = router