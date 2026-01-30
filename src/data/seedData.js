/**
 * Dados iniciais para popular o localStorage
 * Execute initSeedData() uma vez para criar dados de exemplo
 */

export const sampleProducts = [
  {
    id: 'prod_1',
    name: 'RB2140 Wayfarer Original',
    brand: 'Ray-Ban',
    category: 'oculos-sol',
    subcategory: 'unissex',
    sku: 'RB2140-901',
    price: 890,
    sale_price: 712,
    discount_percent: 20,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'],
    description: 'O icônico Wayfarer da Ray-Ban. Design atemporal que combina com qualquer estilo.',
    featured: true,
    new_arrival: false,
    best_seller: true,
    active: true,
    created_date: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: 'RB3025 Aviator Classic',
    brand: 'Ray-Ban',
    category: 'oculos-sol',
    subcategory: 'unissex',
    sku: 'RB3025-L0205',
    price: 950,
    sale_price: 665,
    discount_percent: 30,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'],
    description: 'O clássico Aviator. Criado originalmente para pilotos, tornou-se um ícone de estilo.',
    featured: true,
    new_arrival: false,
    best_seller: true,
    active: true,
    created_date: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: 'OO9208 Radar EV Path',
    brand: 'Oakley',
    category: 'oculos-sol',
    subcategory: 'masculino',
    sku: 'OO9208-01',
    price: 1290,
    sale_price: 903,
    discount_percent: 30,
    stock: 8,
    images: ['https://images.unsplash.com/photo-1577803645773-f96470509666?w=800'],
    description: 'Desempenho excepcional para esportes. Lentes Prizm para visão otimizada.',
    featured: true,
    new_arrival: true,
    best_seller: false,
    active: true,
    created_date: new Date().toISOString()
  },
  {
    id: 'prod_4',
    name: 'GU2824 Feminino',
    brand: 'Guess',
    category: 'oculos-grau',
    subcategory: 'feminino',
    sku: 'GU2824-001',
    price: 640,
    sale_price: 320,
    discount_percent: 50,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800'],
    description: 'Armação elegante para o dia a dia. Perfeita para quem busca sofisticação.',
    featured: false,
    new_arrival: true,
    best_seller: false,
    active: true,
    created_date: new Date().toISOString()
  },
  {
    id: 'prod_5',
    name: 'AN4263 Masculino',
    brand: 'Arnette',
    category: 'oculos-sol',
    subcategory: 'masculino',
    sku: 'AN4263-41-87',
    price: 480,
    sale_price: 336,
    discount_percent: 30,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800'],
    description: 'Estilo urbano e moderno. Ideal para quem gosta de se destacar.',
    featured: false,
    new_arrival: false,
    best_seller: true,
    active: true,
    created_date: new Date().toISOString()
  },
  {
    id: 'prod_6',
    name: 'Acuvue Oasys',
    brand: 'Acuvue',
    category: 'lentes-contato',
    subcategory: 'unissex',
    sku: 'ACUVUE-OASYS-6',
    price: 180,
    sale_price: 162,
    discount_percent: 10,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1585503418537-88331351ad99?w=800'],
    description: 'Lentes de contato para uso quinzenal. Conforto durante todo o dia.',
    featured: true,
    new_arrival: false,
    best_seller: true,
    active: true,
    created_date: new Date().toISOString()
  }
]

export const sampleCoupons = [
  {
    id: 'coupon_1',
    code: 'EXTRA5',
    description: '5% OFF em lentes de contato',
    discount_type: 'percent',
    discount_value: 5,
    min_purchase: 0,
    max_uses: 0,
    uses_count: 0,
    active: true,
    created_date: new Date().toISOString()
  },
  {
    id: 'coupon_2',
    code: 'BEMVINDO10',
    description: '10% OFF primeira compra',
    discount_type: 'percent',
    discount_value: 10,
    min_purchase: 100,
    max_uses: 100,
    uses_count: 15,
    active: true,
    created_date: new Date().toISOString()
  }
]

export function initSeedData() {
  // Só inicializa se não tiver dados
  if (!localStorage.getItem('otica_products')) {
    localStorage.setItem('otica_products', JSON.stringify(sampleProducts))
  }
  if (!localStorage.getItem('otica_coupons')) {
    localStorage.setItem('otica_coupons', JSON.stringify(sampleCoupons))
  }
  console.log('Dados de exemplo inicializados!')
}

// Auto-inicializar
initSeedData()
