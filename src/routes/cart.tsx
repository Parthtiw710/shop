import { createFileRoute, Link } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { cartStore, removeFromCart, updateQuantity, cartTotal } from '../lib/cart-store'
import { useEffect, useState } from 'react'
import exclusiveProducts from '../lib/exclusiveProducts.json'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const items = useSelector(cartStore, (s) => s.items)
  const total = cartTotal(items)
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  // Annotate each item with isExclusive flag (mirrors checkout logic)
  const cartItems = items.map((item) => ({
    ...item,
    isExclusive: item.isExclusive || exclusiveProducts.some((ex) => ex.id === item.id),
  }))

  // Dark theme when ALL items are exclusive — same rule as checkout
  const [isExclusive, setIsExclusive] = useState(false)
  useEffect(() => {
    const allExclusive = cartItems.length > 0 && cartItems.every((item) => item.isExclusive)
    setIsExclusive(allExclusive)
  }, [items])

  // Sync body bg + class so Header/Footer also switch theme
  useEffect(() => {
    const themeColor = isExclusive ? '#1F1A16' : '#FDFBF7'
    document.body.style.backgroundColor = themeColor
    document.documentElement.style.backgroundColor = themeColor
    if (isExclusive) {
      document.body.classList.add('exclusive-theme')
    } else {
      document.body.classList.remove('exclusive-theme')
    }
    return () => {
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
      document.body.classList.remove('exclusive-theme')
    }
  }, [isExclusive])

  return (
    <div
      className="min-h-screen py-24 px-6 md:px-12 flex flex-col items-center select-none overflow-x-hidden transition-colors duration-700"
      style={{ backgroundColor: isExclusive ? '#1F1A16' : '#FDFBF7', color: isExclusive ? '#E5D5B8' : '#1F1A16' }}
    >
      {/* Breadcrumb / Navigation */}
      <div className="w-full max-w-6xl mb-12 flex justify-start">
        <Link
          to="/products"
          className={`group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold transition-colors duration-300 ${isExclusive ? 'text-[#B08B40] hover:text-[#E5D5B8]' : 'text-[#B08B40] hover:text-[#96722D]'}`}
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
          Back to Catalogue
        </Link>
      </div>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Column: Cart Items */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <h1 className={`font-serif text-3xl md:text-4xl font-light tracking-wide mb-2 uppercase ${isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'}`}>
            Shopping Cart ({itemCount})
          </h1>

          {items.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center flex flex-col items-center justify-center gap-6 shadow-sm transition-colors duration-700 ${isExclusive ? 'bg-[#171311] border-[#B08B40]/25' : 'bg-white border-[#E6DFD5]/40'}`}>
              <div className="w-16 h-16 rounded-full bg-[#B08B40]/10 flex items-center justify-center text-[#B08B40]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h2 className={`font-serif text-xl mb-2 uppercase tracking-wide ${isExclusive ? 'text-[#E5D5B8]' : 'text-stone-800'}`}>Your Cart is Empty</h2>
                <p className={`text-sm max-w-sm leading-relaxed ${isExclusive ? 'text-[#D5CFC1]' : 'text-stone-500'}`}>
                  Discover our curated heritage collections and find the perfect addition to your ensemble.
                </p>
              </div>
              <Link
                to="/products"
                className="py-3.5 px-8 bg-[#B08B40] hover:bg-[#96722D] text-[#FDFBF7] font-semibold text-xs tracking-widest uppercase rounded-lg transition-colors duration-300 no-underline shadow-sm"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-6 items-center shadow-sm relative group border transition-all duration-300 ${item.isExclusive
                      ? 'bg-[#1F1A16] border-[#B08B40]/30 text-[#E5D5B8]'
                      : 'bg-white border-[#E6DFD5]/40 text-[#1F1A16]'
                    }`}
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-[#B08B40]/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between w-full h-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          <h3 className={`font-serif text-lg md:text-xl font-medium tracking-wide uppercase ${item.isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'
                            }`}>
                            {item.name}
                          </h3>
                          {item.isExclusive && (
                            <span className="bg-[#B08B40]/15 text-[#B08B40] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[#B08B40]/30 flex-shrink-0">
                              Exclusive
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 uppercase tracking-wider ${item.isExclusive ? 'text-[#B08B40]' : 'text-stone-400'
                          }`}>{item.isExclusive ? 'LakshKriti Exclusive' : 'LakshKriti Signature'}</p>
                      </div>
                      <span className="font-serif text-lg md:text-xl text-[#B08B40] font-semibold self-center sm:self-start">
                        {item.price.includes('₹') ? item.price : `₹ ${item.price}`}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
                      {/* Qty Controls */}
                      <div className={`flex items-center gap-3 rounded-full px-2 py-1 border ${item.isExclusive ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-100'
                        }`}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${item.isExclusive ? 'hover:bg-stone-700' : 'hover:bg-white'
                            }`}
                        >
                          <Minus className={`w-3.5 h-3.5 ${item.isExclusive ? 'text-stone-300' : 'text-stone-600'}`} />
                        </button>
                        <span className={`text-sm font-bold min-w-[20px] text-center ${item.isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'
                          }`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${item.isExclusive ? 'hover:bg-stone-700' : 'hover:bg-white'
                            }`}
                        >
                          <Plus className={`w-3.5 h-3.5 ${item.isExclusive ? 'text-stone-300' : 'text-stone-600'}`} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={`flex items-center gap-1.5 transition-colors duration-200 text-xs font-semibold uppercase tracking-wider cursor-pointer py-1 ${item.isExclusive ? 'text-stone-400 hover:text-rose-400' : 'text-stone-400 hover:text-rose-600'
                          }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div
          className="w-full lg:w-1/3 flex flex-col gap-6"
        >
          <div
            className="rounded-2xl border p-6 md:p-8 shadow-sm flex flex-col gap-6 w-full transition-colors duration-700"
            style={{
              backgroundColor: isExclusive ? '#2A2420' : '#FFFFFF',
              borderColor: isExclusive ? 'rgba(176,139,64,0.3)' : 'rgba(230,223,213,0.4)',
            }}
          >
            <h2
              className="font-serif text-lg uppercase tracking-[0.2em] border-b pb-4 transition-colors duration-700"
              style={{ color: isExclusive ? '#E5D5B8' : '#1F1A16', borderColor: isExclusive ? 'rgba(176,139,64,0.3)' : 'rgba(230,223,213,0.4)' }}
            >
              Order Summary
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${isExclusive ? 'text-[#D5CFC1]' : 'text-stone-500'}`}>Subtotal ({itemCount} items)</span>
                <span className={`font-serif font-semibold ${isExclusive ? 'text-[#E5D5B8]' : 'text-stone-800'}`}>₹ {total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${isExclusive ? 'text-[#D5CFC1]' : 'text-stone-500'}`}>Shipping</span>
                <span className="text-emerald-600 font-semibold tracking-wider uppercase text-xs">Free Delivery</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${isExclusive ? 'text-[#D5CFC1]' : 'text-stone-500'}`}>GST / Taxes</span>
                <span className="text-stone-400 italic">Included</span>
              </div>
            </div>

            <div className="border-t border-[#E6DFD5]/40 pt-4 flex justify-between items-baseline">
              <span className={`font-serif text-lg font-medium uppercase ${isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'}`}>Total</span>
              <span className="font-serif text-2xl font-semibold text-[#B08B40]">
                ₹ {total.toLocaleString('en-IN')}
              </span>
            </div>

            {items.length > 0 && (
              <Link
                to="/checkout"
                className="w-full py-4 bg-[#B08B40] hover:bg-[#96722D] text-white font-semibold text-sm tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer shadow-sm flex items-center justify-center gap-2 group text-center no-underline"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            )}

            <div className={`flex flex-col gap-3.5 border-t border-[#E6DFD5]/20 pt-5 text-[11px] font-medium ${isExclusive ? 'text-[#D5CFC1]' : 'text-stone-500'}`}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#B08B40]" />
                <span>Secure Payments & SSL Encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#B08B40]" />
                <span>Dispatched within 24-48 Hours</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[#B08B40]" />
                <span>Easy Heritage Exchanges</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
