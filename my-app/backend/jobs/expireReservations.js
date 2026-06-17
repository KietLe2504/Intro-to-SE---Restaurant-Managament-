const cron   = require('node-cron')
const prisma = require('../prisma/client')

function startExpireJob() {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredTables = await prisma.table.findMany({
        where: {
          status:      'Reserved',
          reserved_at: { lte: new Date(Date.now() - 30 * 60 * 1000) },
        },
      })
      if (!expiredTables.length) return

      for (const t of expiredTables) {
        await prisma.table.update({
          where: { table_id: t.table_id },
          data: {
            status:          'Available',
            reserved_at:     null,
            reserved_name:   null,
            reserved_phone:  null,
            reserved_guests: null,
          },
        })
        console.log(`[Cron] Bàn ${t.table_number} hết hạn đặt chỗ → Available`)
      }
    } catch (err) {
      console.error('[Cron] Lỗi expire reservations:', err)
    }
  })
  console.log('[Cron] Expire reservations job started')
}

module.exports = { startExpireJob }