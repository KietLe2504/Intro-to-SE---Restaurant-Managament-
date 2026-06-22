/**
 * Seed script — thêm khuyến mãi mẫu và đơn hàng áp dụng khuyến mãi
 * Đồng thời tăng thêm order cho khách hàng để demo membership, phân phối đều nhân viên
 * Chạy: node seed-promotions.js
 */
const prisma = require('./prisma/client')

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomGuestName() {
  const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F']
  return names[Math.floor(Math.random() * names.length)]
}

function calcDiscount(promo, total) {
  if (total < parseFloat(promo.min_order)) return 0
  if (promo.type === 'percent') {
    return Math.round(total * parseFloat(promo.value) / 100)
  }
  return Math.min(parseFloat(promo.value), total)
}

async function main() {
  console.log('Bắt đầu seed khuyến mãi và đơn hàng demo...\n')

  // ── 1. Tạo các khuyến mãi mẫu ──
  const promoDefs = [
    {
      name: 'Giảm 10% cuối tuần', code: 'WEEKEND10', event_type: 'weekend',
      type: 'percent', value: 10, min_order: 100000,
      description: 'Áp dụng cho đơn từ 100,000đ vào cuối tuần',
    },
    {
      name: 'Giảm 50K đơn từ 300K', code: 'SAVE50K', event_type: 'general',
      type: 'fixed', value: 50000, min_order: 300000,
      description: 'Giảm trực tiếp 50,000đ cho đơn từ 300,000đ',
    },
    {
      name: 'Sinh nhật vàng -15%', code: 'BIRTHDAY15', event_type: 'birthday',
      type: 'percent', value: 15, min_order: 0,
      description: 'Ưu đãi sinh nhật khách hàng thân thiết',
    },
    {
      name: 'Khách thân thiết -20%', code: 'LOYAL20', event_type: 'loyalty',
      type: 'percent', value: 20, min_order: 500000,
      description: 'Dành cho khách hàng VIP, đơn từ 500,000đ',
    },
    {
      name: 'Mừng lễ giảm 100K', code: 'HOLIDAY100', event_type: 'holiday',
      type: 'fixed', value: 100000, min_order: 800000,
      description: 'Khuyến mãi dịp lễ, đơn từ 800,000đ',
    },
    {
      name: 'Khuyến mãi đã hết hạn', code: 'EXPIRED5', event_type: 'general',
      type: 'percent', value: 5, min_order: 0,
      description: 'Mã demo đã tắt để test trạng thái',
      is_active: false,
    },
  ]

  const promoRecords = []
  for (const p of promoDefs) {
    const existing = await prisma.eventPromotion.findUnique({ where: { code: p.code } })
    if (existing) {
      console.log(`Khuyến mãi "${p.code}" đã tồn tại, bỏ qua tạo mới`)
      promoRecords.push(existing)
      continue
    }
    const created = await prisma.eventPromotion.create({
      data: {
        name: p.name,
        code: p.code,
        event_type: p.event_type,
        type: p.type,
        value: p.value,
        min_order: p.min_order,
        description: p.description,
        is_active: p.is_active !== undefined ? p.is_active : true,
      },
    })
    console.log(`✓ Tạo khuyến mãi: ${p.name} (${p.code})`)
    promoRecords.push(created)
  }

  const activePromos = promoRecords.filter(p => p.is_active)

  // ── 2. Lấy dữ liệu cần thiết ──
  const employees  = await prisma.employee.findMany()
  const tables      = await prisma.table.findMany()
  const dishes       = await prisma.dish.findMany({ where: { is_available: true } })
  const memberships  = await prisma.membership.findMany({ orderBy: { min_spend: 'asc' } })
  const customers     = await prisma.customer.findMany()

  if (!employees.length) throw new Error('Chưa có employee nào trong DB!')
  if (!tables.length)    throw new Error('Chưa có table nào trong DB!')
  if (!dishes.length)    throw new Error('Chưa có dish nào trong DB!')

  let staffRoundRobin = 0
  const pickStaffRR = () => {
    const s = employees[staffRoundRobin % employees.length]
    staffRoundRobin++
    return s
  }
  const pickTable = () => tables[Math.floor(Math.random() * tables.length)]
  const pickDishes = (count) => {
    const shuffled = [...dishes].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
  const findMembership = (totalSpent) =>
    [...memberships].reverse().find(m => totalSpent >= parseFloat(m.min_spend)) || null

  const requestedNames = ['Công Anh', 'Thị My', 'Châu Giang', 'Linh Chi', 'Nghiêm Nghị', 'Nhất Trí']
  const requestedCustomers = customers.filter(c => requestedNames.includes(c.name))

  if (!requestedCustomers.length) {
    console.log('⚠ Không tìm thấy khách hàng yêu cầu trước đó — sẽ chỉ tạo đơn không gắn khách hàng cụ thể')
  }

  // ── 3. Tạo đơn hàng có áp dụng khuyến mãi ──
  async function createOrderWithPromo({ customer, promo, daysAgo, orderType = 'dine-in' }) {
    const staff = pickStaffRR()
    const items = pickDishes(randomBetween(3, 6))

    const orderItemsData = items.map(d => {
      const qty = randomBetween(1, 3)
      const unitPrice = parseFloat(d.price)
      return {
        dish_id: d.dish_id,
        quantity: qty,
        unit_price: unitPrice,
        subtotal: unitPrice * qty,
        is_served: true,
      }
    })

    const rawTotal = orderItemsData.reduce((s, i) => s + i.subtotal, 0)
    const discount = promo ? calcDiscount(promo, rawTotal) : 0
    const total_amount = Math.max(0, rawTotal - discount)

    const orderTime = new Date()
    orderTime.setDate(orderTime.getDate() - daysAgo)
    orderTime.setHours(randomBetween(10, 21), randomBetween(0, 59))

    const data = {
      order_type: orderType,
      employee_id: staff.employee_id,
      status: 'Completed',
      total_amount,
      order_time: orderTime,
      order_items: { create: orderItemsData },
    }

    if (orderType === 'dine-in') {
      data.table_id = pickTable().table_id
    } else {
      data.customer_name = randomGuestName()
      data.customer_phone = '09' + randomBetween(10000000, 99999999)
    }

    if (customer) {
      data.customer_id = customer.customer_id
      data.customer_name = customer.name
      data.customer_phone = customer.phone
    }

    const order = await prisma.order.create({ data })

    if (promo && discount > 0) {
      await prisma.orderEvent.create({
        data: {
          order_id: order.order_id,
          event_id: promo.event_id,
          discount_amount: discount,
        },
      })
    }

    return order
  }

  let promoOrdersCreated = 0

  // Mỗi khách hàng yêu cầu có vài đơn dùng khuyến mãi khác nhau, đồng thời tăng chi tiêu để demo lên hạng
  for (const customer of requestedCustomers) {
    const numPromoOrders = randomBetween(3, 6)
    for (let i = 0; i < numPromoOrders; i++) {
      const promo = activePromos[Math.floor(Math.random() * activePromos.length)]
      await createOrderWithPromo({
        customer,
        promo,
        daysAgo: randomBetween(0, 20),
      })
      promoOrdersCreated++
    }
  }

  // Một số đơn dùng khuyến mãi không gắn khách hàng cụ thể (khách lẻ/mang về)
  const looseGhostCustomers = customers.filter(c => !requestedNames.includes(c.name))
  const loosePromoCount = 20
  for (let i = 0; i < loosePromoCount; i++) {
    const promo = activePromos[Math.floor(Math.random() * activePromos.length)]
    const useGhost = looseGhostCustomers.length && Math.random() < 0.5
    const customer = useGhost
      ? looseGhostCustomers[Math.floor(Math.random() * looseGhostCustomers.length)]
      : null
    const isTakeAway = Math.random() < 0.3
    await createOrderWithPromo({
      customer,
      promo,
      daysAgo: randomBetween(0, 28),
      orderType: isTakeAway ? 'take-away' : 'dine-in',
    })
    promoOrdersCreated++
  }

  console.log(`\n✓ Đã tạo ${promoOrdersCreated} đơn hàng có áp dụng khuyến mãi`)

  // ── 4. Thêm thêm đơn KHÔNG khuyến mãi để tiếp tục tăng bậc cho khách hàng yêu cầu ──
  let extraOrdersCreated = 0
  for (const customer of requestedCustomers) {
    const numExtra = randomBetween(4, 10)
    for (let i = 0; i < numExtra; i++) {
      await createOrderWithPromo({
        customer,
        promo: null,
        daysAgo: randomBetween(0, 25),
      })
      extraOrdersCreated++
    }
  }
  console.log(`✓ Đã tạo thêm ${extraOrdersCreated} đơn thường để tăng hạng thành viên`)

  // ── 5. Tính lại total_spent + total_points + membership cho tất cả khách hàng ──
  console.log('\nĐang tính lại hạng thành viên và điểm tích lũy...')
  const allCustomers = await prisma.customer.findMany()
  const MAX_POINTS_PER_ORDER = 50000

  for (const c of allCustomers) {
    const completedOrders = await prisma.order.findMany({
      where: { customer_id: c.customer_id, status: 'Completed' },
      select: { total_amount: true },
    })

    const totalSpent = completedOrders.reduce((s, o) => s + parseFloat(o.total_amount), 0)
    const tier = findMembership(totalSpent)

    let totalPoints = 0
    if (tier) {
      const rate = parseFloat(tier.point_rate)
      for (const o of completedOrders) {
        const earned = Math.round(parseFloat(o.total_amount) * rate / 100)
        totalPoints += Math.min(earned, MAX_POINTS_PER_ORDER)
      }
    }

    await prisma.customer.update({
      where: { customer_id: c.customer_id },
      data: {
        total_spent: totalSpent,
        total_points: totalPoints,
        membership_id: tier?.membership_id || null,
      },
    })
  }
  console.log('✓ Đã cập nhật hạng và điểm tích lũy cho tất cả khách hàng')

  // ── 6. Tóm tắt phân phối đơn theo nhân viên ──
  console.log('\nPhân phối đơn theo nhân viên:')
  for (const e of employees) {
    const count = await prisma.order.count({ where: { employee_id: e.employee_id } })
    console.log(`  ${e.name} (${e.role}): ${count} đơn`)
  }

  console.log('\n🎉 Seed khuyến mãi + đơn hàng hoàn tất!')
}

main()
  .catch(err => {
    console.error('Lỗi seed:', err)
    process.exit(1)
  })
  .finally(() => process.exit(0))