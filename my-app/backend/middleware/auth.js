const jwt = require('jsonwebtoken')

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ error: 'Không có token xác thực.' })
  }

  const token = authHeader.split(' ')[1] // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Token không hợp lệ.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { employee_id, username, role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token hết hạn hoặc không hợp lệ.' })
  }
}