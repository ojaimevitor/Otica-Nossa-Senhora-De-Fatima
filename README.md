# Ótica Fátima - E-commerce Completo

Este é o projeto **COMPLETO** exportado 1:1 do app Base44.

## 🚀 Como Rodar

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## 📁 Estrutura do Projeto

```
src/
├── pages/           # Todas as páginas (17 páginas)
├── components/      # Componentes reutilizáveis
├── services/        # Camada de dados (API Adapter)
├── data/            # Dados mock
├── lib/             # Utilitários
└── Layout.jsx       # Layout principal
```

## 📋 Páginas Incluídas

### Loja
- Home
- Category
- Search
- Product
- Cart
- Checkout
- Profile
- Favorites
- Orders
- Exams
- Support

### Admin
- AdminDashboard
- AdminProducts
- AdminOrders
- AdminUsers
- AdminCoupons
- AdminAppointments

## 🔧 Funcionalidades

- ✅ Dark/Light mode
- ✅ Carrinho com limite de 10 itens por produto
- ✅ Redução de estoque no checkout
- ✅ Sistema de cupons de desconto
- ✅ Favoritos persistentes
- ✅ Busca com normalização de texto
- ✅ Agendamento de exames (quinzenal)
- ✅ Assistente guiado (sem diagnóstico médico)
- ✅ Dashboard administrativo com gráficos
- ✅ CRUD completo de Produtos, Pedidos, Cupons, Usuários, Agendamentos

## 🔌 Conectar Backend Real

Edite `src/services/apiAdapter.js` para substituir os dados mock por chamadas à sua API.

## 📦 Deploy

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`

### Vercel
1. Framework: Vite
2. Deploy automático

---
Exportado em: 30/01/2026, 10:59:33
