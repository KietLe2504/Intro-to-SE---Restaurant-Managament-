const express = require('express')
const cors    = require('cors')
const path = require('path')
const { startExpireJob } = require('./jobs/expireReservations')
require('dotenv').config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// Routes
app.use('/api/auth',        require('./routes/auth'))
app.use('/api/employees',   require('./routes/employees'))
app.use('/api/tables',      require('./routes/tables'))
app.use('/api/dishes',      require('./routes/dishes'))
app.use('/api/orders',      require('./routes/orders'))
app.use('/api/customers',   require('./routes/customers'))
app.use('/api/memberships', require('./routes/memberships'))
app.use('/api/promotions',  require('./routes/promotions'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
startExpireJob()