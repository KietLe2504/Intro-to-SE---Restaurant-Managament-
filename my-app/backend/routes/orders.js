const express = require('express')
const prisma  = require('../prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
router.use(authMiddleware)

// ── Helper: tính discount từ promotion ───────────────────
function calcDiscount(promo, total) {
  if (!promo || !promo.is_active) return 0
  if (total < parseFloat(promo.min_order)) return 0
  if (promo.type === 'percent') {
    return Math.round(total * parseFloat(promo.value) / 100)
  }
  return Math.min(parseFloat(promo.value), total)
}

// ── Helper: tính điểm tích lũy ───────────────────────────
function calcEarnPoints(pointRate, finalTotal) {
  const MAX_POINTS_PER_ORDER = 50000
  const earned = Math.round(finalTotal * parseFloat(pointRate) / 100)
  return Math.min(earned, MAX_POINTS_PER_ORDER)
}

// ── Helper: tìm membership tier phù hợp ─────────────────
async function getAppropriateMembership(totalSpent) {
  const memberships = await prisma.membership.findMany({
    orderBy: { min_spend: 'desc' },
  })
  return memberships.find(m => totalSpent >= parseFloat(m.min_spend)) || null
}

// ── GET /api/orders ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, table_id, employee_id, date_from, date_to } = req.query
    const where = {}

    // Tất cả đều xem được hết, Manager có thể filter theo employee
    if (employee_id && req.user.role === 'Manager') {
      where.employee_id = employee_id
    }

    if (status)   where.status   = status
    if (table_id) where.table_id = table_id

    if (date_from || date_to) {
      where.order_time = {}
      if (date_from) where.order_time.gte = new Date(date_from)
      if (date_to)   where.order_time.lte = new Date(date_to)
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { order_time: 'desc' },
      include: {
        table:    { select: { table_number: true, capacity: true } },
        employee: { select: { name: true, role: true } },
        customer: { select: { name: true, phone: true, total_points: true } },
        order_items: {
          include: { dish: { select: { dish_name: true, category: true } } },
        },
        events: {
          include: { event: { select: { name: true, code: true } } },
        },
      },
    })
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── GET /api/orders/:id ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { order_id: req.params.id },
      include: {
        table:    true,
        employee: { select: { name: true, role: true } },
        customer: { include: { membership: true } },
        order_items: {
          include: { dish: true },
        },
        events: {
          include: { event: true },
        },
      },
    })
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn.' })

    // Staff chỉ xem đơn của mình
    if (req.user.role !== 'Manager' && order.employee_id !== req.user.employee_id) {
      return res.status(403).json({ error: 'Không có quyền xem đơn này.' })
    }
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── POST /api/orders ──────────────────────────────────────
// Tạo đơn mới
// Body:
//   { order_type, table_id?, customer_name?, customer_phone?,
//     customer_id?, promo_code?, redeem_points?,
//     notes?, items: [{ dish_id, quantity }] }
router.post('/', async (req, res) => {
  const {
    order_type = 'dine-in',
    table_id,
    customer_name,
    customer_phone,
    customer_id,
    promo_code,
    redeem_points = 0,
    notes,
    items,
  } = req.body

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Đơn hàng phải có ít nhất một món.' })
  }
  if (order_type === 'dine-in' && !table_id) {
    return res.status(400).json({ error: 'Vui lòng chọn bàn.' })
  }

  try {
    // 1. Lấy thông tin các món để tính giá
    const dishIds  = items.map(i => i.dish_id)
    const dishes   = await prisma.dish.findMany({ where: { dish_id: { in: dishIds } } })

    // Kiểm tra món còn không
    for (const item of items) {
      const dish = dishes.find(d => d.dish_id === item.dish_id)
      if (!dish)             return res.status(404).json({ error: `Không tìm thấy món: ${item.dish_id}` })
      if (!dish.is_available) return res.status(400).json({ error: `Món "${dish.dish_name}" hiện đã hết.` })
    }

    // 2. Tính subtotal từng món
    const orderItems = items.map(item => {
      const dish     = dishes.find(d => d.dish_id === item.dish_id)
      const unit_price = parseFloat(dish.price)
      return {
        dish_id:    item.dish_id,
        quantity:   parseInt(item.quantity),
        unit_price,
        subtotal:   unit_price * parseInt(item.quantity),
        is_served:  false,
      }
    })

    let total_amount = orderItems.reduce((s, i) => s + i.subtotal, 0)

    // 3. Áp dụng promotion nếu có
    let promoData    = null
    let discountAmt  = 0
    if (promo_code) {
      const promo = await prisma.eventPromotion.findUnique({
        where: { code: promo_code.toUpperCase() },
      })
      if (!promo || !promo.is_active) {
        return res.status(400).json({ error: 'Mã khuyến mãi không hợp lệ.' })
      }
      discountAmt = calcDiscount(promo, total_amount)
      promoData   = { event_id: promo.event_id, discount_amount: discountAmt }
    }

    total_amount -= discountAmt

    // 4. Áp dụng điểm thành viên nếu có
    const MAX_REDEEM = 500000
    let actualRedeem = 0
    let customer     = null

    if (customer_id) {
      customer = await prisma.customer.findUnique({
        where: { customer_id },
        include: { membership: true },
      })
      if (!customer) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' })

      if (redeem_points > 0) {
        actualRedeem = Math.min(redeem_points, customer.total_points, MAX_REDEEM, total_amount)
        total_amount -= actualRedeem
      }
    }

    // 5. Tạo đơn trong transaction
    const order = await prisma.$transaction(async (tx) => {
      // Tạo order
      const newOrder = await tx.order.create({
        data: {
          order_type,
          table_id:       table_id || null,
          employee_id:    req.user.employee_id,
          customer_id:    customer_id || null,
          customer_name:  customer_name || customer?.name || null,
          customer_phone: customer_phone || customer?.phone || null,
          total_amount,
          notes:          notes || null,
          status:         'Pending',
          order_items: {
            create: orderItems,
          },
        },
        include: {
          order_items: { include: { dish: true } },
          table:       true,
          customer:    true,
        },
      })

      // Gắn promotion vào đơn
      if (promoData) {
        await tx.orderEvent.create({
          data: {
            order_id:        newOrder.order_id,
            event_id:        promoData.event_id,
            discount_amount: promoData.discount_amount,
          },
        })
      }

      // Trừ điểm đã dùng ngay khi tạo đơn
      if (actualRedeem > 0 && customer) {
        await tx.customer.update({
          where: { customer_id: customer.customer_id },
          data:  { total_points: { decrement: actualRedeem } },
        })
      }

      // Cập nhật trạng thái bàn → Occupied
      if (table_id) {
        await tx.table.update({
          where: { table_id },
          data:  { status: 'Occupied' },
        })
      }

      return newOrder
    })

    res.status(201).json({
      ...order,
      discount:      discountAmt,
      redeem_points: actualRedeem,
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/orders/:id/status ──────────────────────────
// Cập nhật trạng thái đơn: Pending → Serving → Completed | Cancelled
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  const validStatuses = ['Pending', 'Serving', 'Completed', 'Cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Trạng thái không hợp lệ. Chọn: ${validStatuses.join(', ')}` })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { order_id: req.params.id },
      include: {
        customer: { include: { membership: true } },
        order_items: true,
      },
    })
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn.' })

    // Staff chỉ cập nhật đơn của mình
    if (req.user.role !== 'Manager' && order.employee_id !== req.user.employee_id) {
      return res.status(403).json({ error: 'Không có quyền.' })
    }

    // Không cho hủy nếu tất cả món đã phục vụ
    if (status === 'Cancelled') {
      const allServed = order.order_items.every(i => i.is_served)
      if (allServed && req.user.role !== 'Manager') {
        return res.status(400).json({ error: 'Tất cả món đã phục vụ, không thể hủy. Liên hệ quản lý.' })
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { order_id: req.params.id },
        data:  { status },
      })

      // Khi hoàn thành (Completed) → tích điểm cho thành viên
      if (status === 'Completed' && order.customer_id && order.customer?.membership) {
        const pointRate  = order.customer.membership.point_rate
        const earned     = calcEarnPoints(pointRate, parseFloat(order.total_amount))
        const newTotal   = parseFloat(order.customer.total_spent) + parseFloat(order.total_amount)

        // Tích điểm + cập nhật tổng chi tiêu
        await tx.customer.update({
          where: { customer_id: order.customer_id },
          data: {
            total_points: { increment: earned },
            total_spent:  { increment: parseFloat(order.total_amount) },
          },
        })

        // Cập nhật tier membership nếu cần
        const newMembership = await getAppropriateMembership(newTotal)
        if (newMembership && newMembership.membership_id !== order.customer.membership_id) {
          await tx.customer.update({
            where: { customer_id: order.customer_id },
            data:  { membership_id: newMembership.membership_id },
          })
        }

        // Trả bàn về Available nếu dine-in
        if (order.table_id) {
          await tx.table.update({
            where: { table_id: order.table_id },
            data:  { status: 'Available' },
          })
        }

        return { ...updated, earned_points: earned }
      }

      // Khi hủy → trả bàn về Available
      if (status === 'Cancelled' && order.table_id) {
        await tx.table.update({
          where: { table_id: order.table_id },
          data:  { status: 'Available' },
        })
      }

      return updated
    })

    res.json(updatedOrder)
  } catch (err) {
    console.error('Update status error:', err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

// ── PATCH /api/orders/:id/items/:itemId/serve ─────────────
// Đánh dấu món đã phục vụ
// Body: { quantity_served? } — nếu không có thì serve toàn bộ
router.patch('/:id/items/:itemId/serve', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { order_id: req.params.id },
    })
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn.' })
    if (req.user.role !== 'Manager' && order.employee_id !== req.user.employee_id) {
      return res.status(403).json({ error: 'Không có quyền.' })
    }
    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Đơn đã kết thúc.' })
    }

    const item = await prisma.orderItem.findUnique({
      where: { order_item_id: req.params.itemId },
    })
    if (!item) return res.status(404).json({ error: 'Không tìm thấy món.' })
    if (item.is_served) return res.status(400).json({ error: 'Món đã được đánh dấu phục vụ rồi.' })

    const { quantity_served } = req.body

    // Phục vụ một phần → tách thành 2 dòng
    if (quantity_served && parseInt(quantity_served) < item.quantity) {
      const servedQty    = parseInt(quantity_served)
      const remainingQty = item.quantity - servedQty

      await prisma.$transaction([
        // Cập nhật dòng hiện tại: đã phục vụ servedQty
        prisma.orderItem.update({
          where: { order_item_id: item.order_item_id },
          data: {
            quantity: servedQty,
            subtotal: item.unit_price * servedQty,
            is_served: true,
          },
        }),
        // Tạo dòng mới cho phần còn lại chưa phục vụ
        prisma.orderItem.create({
          data: {
            order_id:   item.order_id,
            dish_id:    item.dish_id,
            quantity:   remainingQty,
            unit_price: item.unit_price,
            subtotal:   item.unit_price * remainingQty,
            is_served:  false,
          },
        }),
      ])
    } else {
      // Phục vụ toàn bộ
      await prisma.orderItem.update({
        where: { order_item_id: req.params.itemId },
        data:  { is_served: true },
      })
    }

    // Tự động chuyển đơn sang Serving nếu đang Pending
    if (order.status === 'Pending') {
      await prisma.order.update({
        where: { order_id: req.params.id },
        data:  { status: 'Serving' },
      })
    }

    // Lấy lại đơn đầy đủ để trả về
    const updated = await prisma.order.findUnique({
      where: { order_id: req.params.id },
      include: { order_items: { include: { dish: true } } },
    })
    res.json(updated)
  } catch (err) {
    console.error('Serve item error:', err)
    res.status(500).json({ error: 'Lỗi server.' })
  }
})

module.exports = router