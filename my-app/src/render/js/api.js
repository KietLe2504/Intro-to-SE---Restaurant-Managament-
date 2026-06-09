/* ============================================================
   api.js — Frontend API helper
   Tất cả fetch calls đến backend đều đi qua đây
   ============================================================ */

   const BASE_URL = 'http://localhost:3000/api'

   // ── Token management ──────────────────────────────────────
   
   export function getToken() {
     return sessionStorage.getItem('ros_token')
   }
   
   export function setToken(token) {
     sessionStorage.setItem('ros_token', token)
   }
   
   export function removeToken() {
     sessionStorage.removeItem('ros_token')
   }
   
   // ── Base fetch wrapper ────────────────────────────────────
   export async function apiUploadDishImage(id, file) {
    const token = getToken()
    const form  = new FormData()
    form.append('image', file)
    const res = await fetch(`${BASE_URL}/dishes/${id}/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Lỗi upload')
    return data
  }
  
   async function request(method, path, body = null) {
     const headers = { 'Content-Type': 'application/json' }
     const token   = getToken()
     if (token) headers['Authorization'] = `Bearer ${token}`
   
     const options = { method, headers }
     if (body) options.body = JSON.stringify(body)
   
     const res = await fetch(`${BASE_URL}${path}`, options)
   
     // Token hết hạn → về login
     if (res.status === 401) {
       removeToken()
       sessionStorage.removeItem('ros_session')
       window.location.replace('../pages/login.html')
       return null
     }
   
     const data = await res.json()
   
     if (!res.ok) {
       throw new Error(data.error || 'Lỗi server')
     }
   
     return data
   }
   
   export const api = {
     get:    (path)        => request('GET',    path),
     post:   (path, body)  => request('POST',   path, body),
     patch:  (path, body)  => request('PATCH',  path, body),
     delete: (path, body) => request('DELETE', path, body),
   }
   
   // ── Auth ──────────────────────────────────────────────────
   
   export async function apiLogin(username, password) {
     const data = await api.post('/auth/login', { username, password })
     if (data?.token) {
       setToken(data.token)
       sessionStorage.setItem('ros_session', JSON.stringify(data.user))
     }
     return data
   }
   
   export async function apiRegisterManager(name, username, password, phone) {
     return api.post('/auth/register', { name, username, password, phone })
   }
   
   export async function apiCreateStaff(name, username, password, phone) {
     return api.post('/auth/create-staff', { name, username, password, phone })
   }
   
   // ── Dishes (Menu) ─────────────────────────────────────────
   
   export async function apiGetDishes(params = {}) {
     const q = new URLSearchParams(params).toString()
     return api.get(`/dishes${q ? '?' + q : ''}`)
   }
   
   export async function apiCreateDish(data) {
     return api.post('/dishes', data)
   }
   
   export async function apiUpdateDish(id, data) {
     return api.patch(`/dishes/${id}`, data)
   }
   
   export async function apiDeleteDish(id) {
     return api.delete(`/dishes/${id}`)
   }
   
   // ── Tables ────────────────────────────────────────────────
   
   export async function apiGetTables() {
     return api.get('/tables')
   }
   
   export async function apiCreateTable(data) {
     return api.post('/tables', data)
   }
   
   export async function apiUpdateTable(id, data) {
     return api.patch(`/tables/${id}`, data)
   }
   
   export async function apiDeleteTable(id) {
     return api.delete(`/tables/${id}`)
   }
   
   // ── Orders ────────────────────────────────────────────────
   
   export async function apiGetOrders(params = {}) {
     const q = new URLSearchParams(params).toString()
     return api.get(`/orders${q ? '?' + q : ''}`)
   }
   
   export async function apiGetOrder(id) {
     return api.get(`/orders/${id}`)
   }
   
   export async function apiCreateOrder(data) {
     return api.post('/orders', data)
   }
   
   export async function apiUpdateOrderStatus(id, status) {
     return api.patch(`/orders/${id}/status`, { status })
   }
   
   export async function apiServeItem(orderId, itemId, quantity_served = null) {
     const body = quantity_served ? { quantity_served } : {}
     return api.patch(`/orders/${orderId}/items/${itemId}/serve`, body)
   }
   
   // ── Customers (Membership) ────────────────────────────────
   
   export async function apiGetCustomers(params = {}) {
     const q = new URLSearchParams(params).toString()
     return api.get(`/customers${q ? '?' + q : ''}`)
   }
   
   export async function apiGetCustomerByPhone(phone) {
     return api.get(`/customers/phone/${encodeURIComponent(phone)}`)
   }
   
   export async function apiGetCustomer(id) {
     return api.get(`/customers/${id}`)
   }
   
   export async function apiCreateCustomer(data) {
     return api.post('/customers', data)
   }
   
   export async function apiUpdateCustomerPoints(id, delta) {
     return api.patch(`/customers/${id}/points`, { delta })
   }
   
   // ── Employees ─────────────────────────────────────────────
   
   export async function apiGetEmployees() {
     return api.get('/employees')
   }
   
   export async function apiUpdateEmployee(id, data) {
     return api.patch(`/employees/${id}`, data)
   }
   
   export async function apiDeleteEmployee(id) {
     return api.delete(`/employees/${id}`)
   }
   
   // ── Promotions ────────────────────────────────────────────
   
   export async function apiGetPromotions(params = {}) {
     const q = new URLSearchParams(params).toString()
     return api.get(`/promotions${q ? '?' + q : ''}`)
   }
   
   export async function apiGetPromotionByCode(code) {
     return api.get(`/promotions/code/${code}`)
   }
   
   export async function apiCreatePromotion(data) {
     return api.post('/promotions', data)
   }
   
   export async function apiUpdatePromotion(id, data) {
     return api.patch(`/promotions/${id}`, data)
   }
   
   export async function apiDeletePromotion(id) {
     return api.delete(`/promotions/${id}`)
   }
   
   // ── Memberships (tiers) ───────────────────────────────────
   
   export async function apiGetMemberships() {
     return api.get('/memberships')
   }
   
   export async function apiCreateMembership(data) {
     return api.post('/memberships', data)
   }
   
   export async function apiUpdateMembership(id, data) {
     return api.patch(`/memberships/${id}`, data)
   }
   
   export async function apiDeleteMembership(id) {
     return api.delete(`/memberships/${id}`)
   }

   export async function apiReserveTable(id, data) {
    return api.post(`/tables/${id}/reserve`, data)
  }
  
  export async function apiCancelReserveTable(id, action = 'cancel') {
    return api.delete(`/tables/${id}/reserve`, { action })
  }