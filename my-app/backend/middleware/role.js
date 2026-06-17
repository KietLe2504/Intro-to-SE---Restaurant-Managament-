// Chỉ cho phép Manager
function requireManager(req, res, next) {
    if (req.user?.role !== 'Manager') {
      return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này.' })
    }
    next()
  }
  
  // Cho phép cả Staff và Manager
  function requireStaff(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập.' })
    }
    next()
  }
  
  module.exports = { requireManager, requireStaff }