import { Store } from '@tanstack/store'

export interface CartItem {
  id: string
  name: string
  price: string
  image: string
  quantity: number
  isExclusive?: boolean
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export const cartStore = new Store<CartState>({
  items: [],
  isOpen: false,
})

// ── Actions ──────────────────────────────────────────────────────────────────

export function addToCart(product: Omit<CartItem, 'quantity'>) {
  cartStore.setState((state) => {
    const existing = state.items.find((i) => i.id === product.id)
    if (existing) {
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        isOpen: true,
      }
    }
    return {
      ...state,
      items: [...state.items, { ...product, quantity: 1 }],
      isOpen: true,
    }
  })
}

export function removeFromCart(id: string) {
  cartStore.setState((state) => ({
    ...state,
    items: state.items.filter((i) => i.id !== id),
  }))
}

export function updateQuantity(id: string, quantity: number) {
  if (quantity < 1) { removeFromCart(id); return }
  cartStore.setState((state) => ({
    ...state,
    items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
  }))
}

export function openCart() {
  console.log('[cartStore] openCart called')
  cartStore.setState((state) => {
    console.log('[cartStore] setting isOpen to true')
    return { ...state, isOpen: true }
  })
}

export function closeCart() {
  cartStore.setState((state) => ({ ...state, isOpen: false }))
}

export function clearCart() {
  cartStore.setState((state) => ({ ...state, items: [], isOpen: false }))
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ''))
    return sum + price * item.quantity
  }, 0)
}

// ── Persistence ──────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('lakshkriti_cart_items')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        cartStore.setState((state) => ({
          ...state,
          items: parsed,
        }))
      }
    }
  } catch (err) {
    console.error('Error loading cart from localStorage:', err)
  }

  cartStore.subscribe(() => {
    try {
      localStorage.setItem(
        'lakshkriti_cart_items',
        JSON.stringify(cartStore.state.items)
      )
    } catch (err) {
      console.error('Error saving cart to localStorage:', err)
    }
  })
}

