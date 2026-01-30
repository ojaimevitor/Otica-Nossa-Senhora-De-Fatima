/**
 * API Adapter - Camada de abstração para dados
 * Atualmente usando LocalStorage. Substitua por chamadas à API real.
 */

// Chaves do localStorage
const STORAGE_KEYS = {
  PRODUCTS: 'otica_products',
  ORDERS: 'otica_orders',
  FAVORITES: 'otica_favorites',
  APPOINTMENTS: 'otica_appointments',
  COUPONS: 'otica_coupons',
  USERS: 'otica_users',
  ANALYTICS: 'otica_analytics',
  CART: 'cart',
  USER: 'current_user',
}

// Helpers
const getStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const generateId = () => Math.random().toString(36).substr(2, 9)

// API Adapter
export const api = {
  // === PRODUCTS ===
  products: {
    async list(sort = '-created_date', limit = 500) {
      let products = getStorage(STORAGE_KEYS.PRODUCTS, [])
      if (sort.startsWith('-')) {
        const field = sort.slice(1)
        products.sort((a, b) => new Date(b[field]) - new Date(a[field]))
      }
      return products.slice(0, limit)
    },
    async filter(query, sort, limit) {
      let products = await this.list(sort, limit)
      return products.filter(p => {
        return Object.entries(query).every(([key, value]) => p[key] === value)
      })
    },
    async create(data) {
      const products = getStorage(STORAGE_KEYS.PRODUCTS, [])
      const newProduct = { id: generateId(), created_date: new Date().toISOString(), ...data }
      products.push(newProduct)
      setStorage(STORAGE_KEYS.PRODUCTS, products)
      return newProduct
    },
    async update(id, data) {
      const products = getStorage(STORAGE_KEYS.PRODUCTS, [])
      const index = products.findIndex(p => p.id === id)
      if (index !== -1) {
        products[index] = { ...products[index], ...data, updated_date: new Date().toISOString() }
        setStorage(STORAGE_KEYS.PRODUCTS, products)
        return products[index]
      }
      return null
    },
    async delete(id) {
      let products = getStorage(STORAGE_KEYS.PRODUCTS, [])
      products = products.filter(p => p.id !== id)
      setStorage(STORAGE_KEYS.PRODUCTS, products)
    }
  },

  // === ORDERS ===
  orders: {
    async list(sort = '-created_date', limit = 200) {
      let orders = getStorage(STORAGE_KEYS.ORDERS, [])
      if (sort.startsWith('-')) {
        const field = sort.slice(1)
        orders.sort((a, b) => new Date(b[field]) - new Date(a[field]))
      }
      return orders.slice(0, limit)
    },
    async filter(query, sort, limit) {
      let orders = await this.list(sort, limit)
      return orders.filter(o => {
        return Object.entries(query).every(([key, value]) => o[key] === value)
      })
    },
    async create(data) {
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      const newOrder = { id: generateId(), created_date: new Date().toISOString(), ...data }
      orders.push(newOrder)
      setStorage(STORAGE_KEYS.ORDERS, orders)
      return newOrder
    },
    async update(id, data) {
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      const index = orders.findIndex(o => o.id === id)
      if (index !== -1) {
        orders[index] = { ...orders[index], ...data }
        setStorage(STORAGE_KEYS.ORDERS, orders)
        return orders[index]
      }
      return null
    }
  },

  // === FAVORITES ===
  favorites: {
    async filter(query) {
      let favorites = getStorage(STORAGE_KEYS.FAVORITES, [])
      return favorites.filter(f => {
        return Object.entries(query).every(([key, value]) => f[key] === value)
      })
    },
    async create(data) {
      const favorites = getStorage(STORAGE_KEYS.FAVORITES, [])
      const newFav = { id: generateId(), created_date: new Date().toISOString(), ...data }
      favorites.push(newFav)
      setStorage(STORAGE_KEYS.FAVORITES, favorites)
      return newFav
    },
    async delete(id) {
      let favorites = getStorage(STORAGE_KEYS.FAVORITES, [])
      favorites = favorites.filter(f => f.id !== id)
      setStorage(STORAGE_KEYS.FAVORITES, favorites)
    }
  },

  // === APPOINTMENTS ===
  appointments: {
    async list(sort = '-appointment_date', limit = 100) {
      let appointments = getStorage(STORAGE_KEYS.APPOINTMENTS, [])
      return appointments.slice(0, limit)
    },
    async create(data) {
      const appointments = getStorage(STORAGE_KEYS.APPOINTMENTS, [])
      const newApt = { id: generateId(), created_date: new Date().toISOString(), ...data }
      appointments.push(newApt)
      setStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
      return newApt
    },
    async update(id, data) {
      const appointments = getStorage(STORAGE_KEYS.APPOINTMENTS, [])
      const index = appointments.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...data }
        setStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
        return appointments[index]
      }
      return null
    }
  },

  // === COUPONS ===
  coupons: {
    async list(sort, limit = 100) {
      return getStorage(STORAGE_KEYS.COUPONS, []).slice(0, limit)
    },
    async filter(query) {
      let coupons = getStorage(STORAGE_KEYS.COUPONS, [])
      return coupons.filter(c => {
        return Object.entries(query).every(([key, value]) => c[key] === value)
      })
    },
    async create(data) {
      const coupons = getStorage(STORAGE_KEYS.COUPONS, [])
      const newCoupon = { id: generateId(), created_date: new Date().toISOString(), ...data }
      coupons.push(newCoupon)
      setStorage(STORAGE_KEYS.COUPONS, coupons)
      return newCoupon
    },
    async update(id, data) {
      const coupons = getStorage(STORAGE_KEYS.COUPONS, [])
      const index = coupons.findIndex(c => c.id === id)
      if (index !== -1) {
        coupons[index] = { ...coupons[index], ...data }
        setStorage(STORAGE_KEYS.COUPONS, coupons)
        return coupons[index]
      }
      return null
    },
    async delete(id) {
      let coupons = getStorage(STORAGE_KEYS.COUPONS, [])
      coupons = coupons.filter(c => c.id !== id)
      setStorage(STORAGE_KEYS.COUPONS, coupons)
    }
  },

  // === USERS ===
  users: {
    async list(sort, limit = 200) {
      return getStorage(STORAGE_KEYS.USERS, []).slice(0, limit)
    }
  },

  // === ANALYTICS ===
  analytics: {
    async create(data) {
      const events = getStorage(STORAGE_KEYS.ANALYTICS, [])
      events.push({ id: generateId(), created_date: new Date().toISOString(), ...data })
      setStorage(STORAGE_KEYS.ANALYTICS, events)
    },
    async list(sort, limit = 500) {
      return getStorage(STORAGE_KEYS.ANALYTICS, []).slice(0, limit)
    }
  },

  // === AUTH ===
  auth: {
    async me() {
      const user = getStorage(STORAGE_KEYS.USER, null)
      if (!user) {
        // Demo user
        return {
          id: 'demo_user',
          email: 'demo@oticafatima.com',
          full_name: 'Usuário Demo',
          role: 'admin' // Para testar admin
        }
      }
      return user
    },
    async updateMe(data) {
      const user = await this.me()
      const updated = { ...user, ...data }
      setStorage(STORAGE_KEYS.USER, updated)
      return updated
    },
    async logout() {
      localStorage.removeItem(STORAGE_KEYS.USER)
      window.location.reload()
    },
    redirectToLogin() {
      // Em produção, redirecionar para página de login
      alert('Redirecionando para login... (em produção)')
    },
    async isAuthenticated() {
      return true // Demo sempre autenticado
    }
  }
}

// Compatibilidade com código Base44
export const base44 = {
  entities: {
    Product: api.products,
    Order: api.orders,
    Favorite: api.favorites,
    Appointment: api.appointments,
    Coupon: api.coupons,
    User: api.users,
    AnalyticsEvent: api.analytics,
  },
  auth: api.auth,
  analytics: {
    track: (data) => api.analytics.create(data)
  }
}

export default api
