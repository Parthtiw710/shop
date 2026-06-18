import { useSelector } from '@tanstack/react-store'
import { cartStore, closeCart, removeFromCart, updateQuantity, cartTotal } from '../lib/cart-store'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'

export default function CartDrawer() {
  const items = useSelector(cartStore, (s) => s.items)
  const isOpen = useSelector(cartStore, (s) => s.isOpen)
  const total = cartTotal(items)
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  console.log('[CartDrawer] render - isOpen:', isOpen, 'itemCount:', itemCount)

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-[420px] bg-[#FDFBF7] shadow-2xl flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6DFD5]/60">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#B08B40]" />
            <h2 className="font-serif text-lg uppercase tracking-[0.2em] text-[#1F1A16]">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="bg-[#B08B40] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors duration-200 cursor-pointer"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-14 h-14 text-stone-200" />
              <p className="font-serif text-lg text-stone-400 uppercase tracking-wider">
                Your cart is empty
              </p>
              <p className="text-sm text-stone-400">
                Add items from our collections to get started.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`flex gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ${
                  item.isExclusive
                    ? 'bg-[#1F1A16] border border-[#B08B40]/30 text-[#E5D5B8]'
                    : 'bg-white border border-[#E6DFD5]/40 text-[#1F1A16]'
                }`}
              >
                {/* Product image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 border border-[#B08B40]/10">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-serif text-sm font-medium uppercase tracking-wide leading-tight line-clamp-2 ${
                      item.isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'
                    }`}>
                      {item.name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className={`flex-shrink-0 p-1 transition-colors duration-200 cursor-pointer ${
                        item.isExclusive ? 'text-stone-400 hover:text-rose-400' : 'text-stone-300 hover:text-rose-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className={`flex items-center gap-2 rounded-full px-1 py-0.5 ${
                      item.isExclusive ? 'bg-stone-800' : 'bg-stone-100'
                    }`}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${
                          item.isExclusive ? 'hover:bg-stone-700' : 'hover:bg-white'
                        }`}
                      >
                        <Minus className={`w-3 h-3 ${item.isExclusive ? 'text-stone-300' : 'text-stone-600'}`} />
                      </button>
                      <span className={`text-sm font-bold min-w-[16px] text-center ${
                        item.isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'
                      }`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${
                          item.isExclusive ? 'hover:bg-stone-700' : 'hover:bg-white'
                        }`}
                      >
                        <Plus className={`w-3 h-3 ${item.isExclusive ? 'text-stone-300' : 'text-stone-600'}`} />
                      </button>
                    </div>

                    {/* Line price */}
                    <span className="font-serif text-sm font-semibold text-[#B08B40]">
                      ₹ {(parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#E6DFD5]/60 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-widest text-stone-500 font-semibold">
                Total
              </span>
              <span className="font-serif text-2xl font-semibold text-[#1F1A16]">
                ₹ {total.toLocaleString('en-IN')}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="w-full py-4 bg-[#B08B40] hover:bg-[#96722D] text-white font-semibold text-sm tracking-widest uppercase rounded-xl transition-colors duration-300 cursor-pointer shadow-sm text-center no-underline flex items-center justify-center"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/cart"
              onClick={closeCart}
              className="w-full py-3 text-center border border-[#B08B40] hover:bg-[#B08B40] hover:text-[#FDFBF7] text-[#B08B40] font-semibold text-xs tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer no-underline"
            >
              View Shopping Bag
            </Link>
            <button
              onClick={closeCart}
              className="w-full py-3 border border-stone-200 hover:border-[#B08B40] text-stone-600 hover:text-[#B08B40] font-semibold text-xs tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
