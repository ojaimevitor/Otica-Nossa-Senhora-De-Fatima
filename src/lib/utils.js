import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function createPageUrl(pageName, params = {}) {
  let url = '/' + pageName
  const queryParams = new URLSearchParams(params).toString()
  if (queryParams) url += '?' + queryParams
  return url
}

export function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}
