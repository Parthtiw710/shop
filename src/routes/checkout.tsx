import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES } from './products'
import type { ProductItem } from './products'
import { useSelector } from '@tanstack/react-store'
import { cartStore, clearCart, updateQuantity, removeFromCart } from '../lib/cart-store'
import type { CartItem } from '../lib/cart-store'
import exclusiveProducts from '../lib/exclusiveProducts.json'
import { Shield, ShoppingBag, MapPin, Phone, Mail, User, CreditCard, CheckCircle, Loader2, Plus, Minus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/checkout')({
  validateSearch: (search: Record<string, unknown>): { productId?: string } => {
    return {
      productId: (search.productId as string) || undefined,
    }
  },
  component: CheckoutPage,
})

// Helper to dynamically load script
function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function CheckoutPage() {
  const { productId } = Route.useSearch()

  // We read cart items reactively
  const globalCartItems = useSelector(cartStore, (s) => s.items)

  // Local state for direct buy flow
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null)
  const [isExclusive, setIsExclusive] = useState(false)
  const [wasExclusive, setWasExclusive] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string
    orderId: string
  } | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Compute checkoutItems reactively
  const checkoutItems = productId
    ? (directBuyItem ? [directBuyItem] : [])
    : globalCartItems.map((item) => {
      const isItemExclusive = item.isExclusive || exclusiveProducts.some((ex) => ex.id === item.id)
      return {
        ...item,
        isExclusive: isItemExclusive
      }
    })

  // Populate directBuyItem from productId (direct buy)
  useEffect(() => {
    if (productId) {
      let foundProduct: ProductItem | null = null
      let isExclusiveProduct = false

      // Check standard collections first
      for (const cat of CATEGORIES) {
        const item = cat.items.find((i) => i.id === productId)
        if (item) {
          foundProduct = item
          break
        }
      }

      // If not found, check exclusive collection
      if (!foundProduct) {
        const exItem = exclusiveProducts.find((i) => i.id === productId)
        if (exItem) {
          foundProduct = {
            id: exItem.id,
            name: exItem.name,
            price: exItem.price,
            image: exItem.image,
            description: exItem.description,
            fabric: exItem.fabric,
            weaving: exItem.weaving,
          }
          isExclusiveProduct = true
        }
      }

      if (foundProduct) {
        setDirectBuyItem({
          id: foundProduct.id,
          name: foundProduct.name,
          price: foundProduct.price,
          image: foundProduct.image,
          quantity: 1,
          isExclusive: isExclusiveProduct
        })
      } else if (CATEGORIES.length > 0 && CATEGORIES[0].items.length > 0) {
        // Fallback to first product
        const fallback = CATEGORIES[0].items[0]
        setDirectBuyItem({
          id: fallback.id,
          name: fallback.name,
          price: fallback.price,
          image: fallback.image,
          quantity: 1,
          isExclusive: false
        })
      }
    } else {
      setDirectBuyItem(null)
    }
  }, [productId])

  // Update page theme dynamically whenever checkoutItems changes
  useEffect(() => {
    const allExclusive = checkoutItems.length > 0 && checkoutItems.every((item) => item.isExclusive)
    setIsExclusive(allExclusive)
    if (allExclusive) {
      setWasExclusive(true)
    }
  }, [checkoutItems])

  const displayExclusiveTheme = paymentSuccess ? wasExclusive : isExclusive

  // Update body background and HTML theme attributes to avoid space leaks
  useEffect(() => {
    const themeColor = displayExclusiveTheme ? '#1F1A16' : '#FDFBF7'
    document.body.style.backgroundColor = themeColor
    document.documentElement.style.backgroundColor = themeColor

    if (displayExclusiveTheme) {
      document.body.classList.add('exclusive-theme')
    } else {
      document.body.classList.remove('exclusive-theme')
    }

    return () => {
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
      document.body.classList.remove('exclusive-theme')
    }
  }, [displayExclusiveTheme])

  // Adjust quantity
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (productId) {
      if (newQty < 1) {
        setDirectBuyItem(null)
      } else if (directBuyItem && directBuyItem.id === itemId) {
        setDirectBuyItem({ ...directBuyItem, quantity: newQty })
      }
    } else {
      updateQuantity(itemId, newQty)
    }
  }

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    if (productId) {
      setDirectBuyItem(null)
    } else {
      removeFromCart(itemId)
    }
  }

  // Auth & Profile Retrieval
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setName(data.full_name || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setAddress(data.shipping_address || '')
      }
    } catch (err) {
      console.error('Error fetching profile for checkout:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate pricing
  const totalRawPrice = checkoutItems.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10)
    return sum + (priceNum || 0) * item.quantity
  }, 0)
  const tax = Math.round(totalRawPrice * 0.05) // 5% GST
  const shipping = 0 // Free shipping
  const total = totalRawPrice + tax + shipping

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'Full name is required'
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Valid email is required'
    if (!phone.trim() || phone.length < 10) errors.phone = 'Valid 10-digit mobile number is required'
    if (!address.trim()) errors.address = 'Shipping address is required'
    if (!city.trim()) errors.city = 'City is required'
    if (!state.trim()) errors.state = 'State is required'
    if (!pincode.trim() || pincode.length !== 6) errors.pincode = 'Valid 6-digit Pincode is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Checkout
  const handlePayment = async () => {
    if (!validateForm()) return

    setPaying(true)

    // Load Razorpay SDK
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!res) {
      alert('Failed to load Razorpay SDK. Please check your internet connection.')
      setPaying(false)
      return
    }

    try {
      // Create Razorpay Order
      const createOrderResponse = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total * 100, // Amount in paise (e.g. ₹1050 = 105000 paise)
          currency: 'INR',
        }),
      })

      const orderData = await createOrderResponse.json()

      if (!createOrderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order on server')
      }

      const rzpKeyId =
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        (window as any).VITE_RAZORPAY_KEY_ID ||
        'rzp_test_T2yNWEGVzvfJzt'

      // Initialize Razorpay Options
      const options = {
        key: rzpKeyId, // White-labeled with test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LakshKriti',
        description: checkoutItems.length === 1
          ? `Handloom Purchase: ${checkoutItems[0].name}`
          : `Handloom Purchase: ${checkoutItems.length} items`,
        image: '/images/img1.jpg',
        order_id: orderData.id,
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#B08B40', // Branded gold color
        },
        handler: async (response: any) => {
          // Verify Payment
          try {
            setPaying(true)
            const verifyResponse = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.success) {
              setPaymentDetails({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              })
              clearCart()
              setPaymentSuccess(true)
            } else {
              alert(verifyData.error || 'Payment verification failed.')
            }
          } catch (err) {
            console.error('Error verifying payment:', err)
            alert('An error occurred during payment verification.')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error.message || 'Something went wrong during checkout initialization.')
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-[70vh] flex items-center justify-center transition-colors duration-700 ease-in-out ${displayExclusiveTheme ? 'bg-[#1F1A16]' : 'bg-[#FDFBF7]'
        }`}>
        <div className="w-10 h-10 border-2 border-[#B08B40] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (paymentSuccess && paymentDetails) {
    return (
      <div className={`min-h-[80vh] flex items-center justify-center py-20 px-6 font-sans transition-colors duration-700 ease-in-out ${displayExclusiveTheme ? 'bg-[#1F1A16]' : 'bg-[#FDFBF7]'
        }`}>
        <div className={`w-full max-w-lg border rounded-2xl p-8 md:p-12 text-center shadow-md relative overflow-hidden transition-all duration-500 ${displayExclusiveTheme ? 'bg-[#171311] border-[#B08B40]/25 text-[#E5D5B8]' : 'bg-white border-[#E6DFD5]/40 text-[#1F1A16]'
          }`}>
          <div className="absolute top-0 left-0 w-full h-[4px] bg-emerald-500"></div>
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6 stroke-[1.2]" />

          <span className="font-serif italic text-xs tracking-[0.25em] uppercase text-[#B08B40] mb-2 block">
            — Order Confirmed
          </span>
          <h1 className={`font-serif text-3xl font-light tracking-wide uppercase mb-4 ${displayExclusiveTheme ? 'text-[#E5D5B8]' : 'text-stone-850'
            }`}>
            Thank You for Your Order
          </h1>
          <p className={`text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto ${displayExclusiveTheme ? 'text-[#D5CFC1]' : 'text-stone-550'
            }`}>
            Your transaction was successfully processed. A handwoven treasure is now prepared in your honor.
          </p>

          <div className={`border rounded-xl p-5 mb-8 text-left text-xs space-y-3 font-medium transition-colors duration-500 ${displayExclusiveTheme ? 'bg-[#2C241F] border-[#B08B40]/20 text-[#D5CFC1]' : 'bg-[#FDFBF7] border-[#E6DFD5]/60 text-stone-600'
            }`}>
            <div className={`flex justify-between border-b pb-2 mb-1 ${displayExclusiveTheme ? 'border-[#B08B40]/15' : 'border-stone-200'}`}>
              <span className={`uppercase tracking-widest font-bold ${displayExclusiveTheme ? 'text-stone-500' : 'text-stone-400'}`}>Items Ordered</span>
              <span className={`font-semibold ${displayExclusiveTheme ? 'text-[#E5D5B8]' : 'text-stone-800'}`}>
                {checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            {checkoutItems.map((item) => (
              <div key={item.id} className="flex justify-between items-baseline gap-4 py-0.5">
                <span className={displayExclusiveTheme ? 'text-[#D5CFC1]' : 'text-stone-600'}>
                  {item.name} <span className="text-stone-400 font-normal">x{item.quantity}</span>
                </span>
                <span className={`font-serif ${displayExclusiveTheme ? 'text-[#E5D5B8]' : 'text-stone-850'}`}>{item.price}</span>
              </div>
            ))}
            <div className={`flex justify-between border-t pt-2.5 mt-2.5 ${displayExclusiveTheme ? 'border-[#B08B40]/15' : 'border-stone-200'}`}>
              <span className={`uppercase tracking-widest font-bold ${displayExclusiveTheme ? 'text-stone-500' : 'text-stone-400'}`}>Amount Paid</span>
              <span className={`font-bold ${displayExclusiveTheme ? 'text-[#E5D5B8]' : 'text-stone-850'}`}>₹ {total}</span>
            </div>
            <div className="flex justify-between">
              <span className={`uppercase tracking-widest font-bold ${displayExclusiveTheme ? 'text-stone-500' : 'text-stone-400'}`}>Payment ID</span>
              <span className={`font-mono ${displayExclusiveTheme ? 'text-[#E5D5B8]' : 'text-stone-880'}`}>{paymentDetails.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className={`uppercase tracking-widest font-bold ${displayExclusiveTheme ? 'text-stone-500' : 'text-stone-400'}`}>Order ID</span>
              <span className={`font-mono ${displayExclusiveTheme ? 'text-[#E5D5B8]' : 'text-stone-880'}`}>{paymentDetails.orderId}</span>
            </div>
          </div>

          <Link
            to="/products"
            className="inline-flex w-full items-center justify-center py-4 bg-[#B08B40] hover:bg-[#96722D] text-white font-semibold text-sm tracking-widest uppercase rounded-xl transition-all duration-300 no-underline shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-16 px-6 md:px-12 font-sans select-none transition-colors duration-700 ease-in-out ${displayExclusiveTheme ? 'bg-[#1F1A16] text-[#E5D5B8]' : 'bg-[#FDFBF7] text-[#1F1A16]'
      }`}>
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <span className="font-serif italic text-xs md:text-sm tracking-[0.25em] uppercase text-[#B08B40] mb-3 block">
            — Secure checkout
          </span>
          <h1 className={`font-serif text-3xl md:text-5xl font-light tracking-wide uppercase ${isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'
            }`}>
            Completing Your Purchase
          </h1>
        </div>

        {!session && (
          <div className={`mb-10 p-4 border rounded-xl flex items-center justify-between text-xs md:text-sm transition-colors duration-500 ${isExclusive ? 'bg-[#2C241F]/50 border-[#B08B40]/30 text-[#D5CFC1]' : 'bg-amber-50/50 border-[#B08B40]/20 text-stone-600'
            }`}>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B08B40]" />
              Checking out as a guest. Want to use your saved shipping address?
            </span>
            <Link
              to="/login"
              className="text-[#B08B40] hover:text-[#96722D] font-bold uppercase tracking-wider no-underline"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Shipping Form */}
          <div className={`lg:col-span-7 border rounded-2xl p-6 md:p-10 shadow-sm space-y-8 relative transition-all duration-500 ${isExclusive ? 'bg-[#171311] border-[#B08B40]/25' : 'bg-white border-[#E6DFD5]/40'
            }`}>
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B08B40]"></div>

            <h2 className={`font-serif text-xl md:text-2xl font-normal tracking-wide flex items-center gap-2 ${isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'
              }`}>
              <MapPin className="w-5 h-5 text-[#B08B40] stroke-[1.5]" />
              Shipping Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 ${isExclusive ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-4 ${isExclusive
                    ? 'bg-[#2C241F] text-[#E5D5B8] border-stone-800 placeholder-stone-600 focus:ring-[#B08B40]/20'
                    : 'bg-white text-stone-850 border-stone-200 placeholder-stone-400 focus:ring-[#B08B40]/30'
                    } ${formErrors.name ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
                {formErrors.name && <span className="text-[10px] text-rose-500 font-bold">{formErrors.name}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 ${isExclusive ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-4 ${isExclusive
                    ? 'bg-[#2C241F] text-[#E5D5B8] border-stone-800 placeholder-stone-600 focus:ring-[#B08B40]/20'
                    : 'bg-white text-stone-850 border-stone-200 placeholder-stone-400 focus:ring-[#B08B40]/30'
                    } ${formErrors.email ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
                {formErrors.email && <span className="text-[10px] text-rose-500 font-bold">{formErrors.email}</span>}
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 ${isExclusive ? 'text-stone-550' : 'text-stone-400'
                  }`}>
                  <Phone className="w-3.5 h-3.5" /> Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-4 ${isExclusive
                    ? 'bg-[#2C241F] text-[#E5D5B8] border-stone-800 placeholder-stone-600 focus:ring-[#B08B40]/20'
                    : 'bg-white text-stone-850 border-stone-200 placeholder-stone-400 focus:ring-[#B08B40]/30'
                    } ${formErrors.phone ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
                {formErrors.phone && <span className="text-[10px] text-rose-500 font-bold">{formErrors.phone}</span>}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className={`text-[10px] uppercase tracking-widest font-bold ${isExclusive ? 'text-stone-550' : 'text-stone-400'
                  }`}>
                  Street Address
                </label>
                <textarea
                  rows={3}
                  placeholder="Apartment, suite, unit, building, street, etc."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border transition-all duration-200 text-sm resize-none focus:outline-none focus:ring-4 ${isExclusive
                    ? 'bg-[#2C241F] text-[#E5D5B8] border-stone-800 placeholder-stone-600 focus:ring-[#B08B40]/20'
                    : 'bg-white text-stone-850 border-stone-200 placeholder-stone-400 focus:ring-[#B08B40]/30'
                    } ${formErrors.address ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
                {formErrors.address && <span className="text-[10px] text-rose-500 font-bold">{formErrors.address}</span>}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] uppercase tracking-widest font-bold ${isExclusive ? 'text-stone-550' : 'text-stone-400'
                  }`}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-4 ${isExclusive
                    ? 'bg-[#2C241F] text-[#E5D5B8] border-stone-800 placeholder-stone-600 focus:ring-[#B08B40]/20'
                    : 'bg-white text-stone-850 border-stone-200 placeholder-stone-400 focus:ring-[#B08B40]/30'
                    } ${formErrors.city ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
                {formErrors.city && <span className="text-[10px] text-rose-500 font-bold">{formErrors.city}</span>}
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] uppercase tracking-widest font-bold ${isExclusive ? 'text-stone-550' : 'text-stone-400'
                  }`}>
                  State
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-4 ${isExclusive
                    ? 'bg-[#2C241F] text-[#E5D5B8] border-stone-800 placeholder-stone-600 focus:ring-[#B08B40]/20'
                    : 'bg-white text-stone-850 border-stone-200 placeholder-stone-400 focus:ring-[#B08B40]/30'
                    } ${formErrors.state ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
                {formErrors.state && <span className="text-[10px] text-rose-500 font-bold">{formErrors.state}</span>}
              </div>

              {/* Pincode */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className={`text-[10px] uppercase tracking-widest font-bold ${isExclusive ? 'text-stone-550' : 'text-stone-400'
                  }`}>
                  Postal Code (Pincode)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit PIN"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className={`w-full py-3.5 px-4 rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-4 ${isExclusive
                    ? 'bg-[#2C241F] text-[#E5D5B8] border-stone-800 placeholder-stone-600 focus:ring-[#B08B40]/20'
                    : 'bg-white text-stone-850 border-stone-200 placeholder-stone-400 focus:ring-[#B08B40]/30'
                    } ${formErrors.pincode ? 'border-rose-400 focus:ring-rose-200' : ''}`}
                />
                {formErrors.pincode && <span className="text-[10px] text-rose-500 font-bold">{formErrors.pincode}</span>}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className={`lg:col-span-5 border rounded-2xl p-6 md:p-8 shadow-sm space-y-8 relative transition-all duration-500 ${isExclusive ? 'bg-[#171311] border-[#B08B40]/25' : 'bg-white border-[#E6DFD5]/40'
            }`}>
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B08B40]"></div>

            <h2 className={`font-serif text-xl md:text-2xl font-normal tracking-wide flex items-center gap-2 ${isExclusive ? 'text-[#E5D5B8]' : 'text-[#1F1A16]'
              }`}>
              <ShoppingBag className="w-5 h-5 text-[#B08B40] stroke-[1.5]" />
              Order Summary
            </h2>

            {checkoutItems.length > 0 ? (
              <div className="space-y-6">
                {/* Product Detail List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {checkoutItems.map((item) => {
                    const isItemExclusive = item.isExclusive || exclusiveProducts.some((ex) => ex.id === item.id)
                    return (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-4 rounded-xl border transition-all duration-350 ${isItemExclusive
                          ? 'bg-[#251F1B] border-[#B08B40]/30 shadow-[0_4px_20px_rgba(176,139,64,0.08)]'
                          : isExclusive
                            ? 'bg-[#171311]/50 border-stone-850/60'
                            : 'bg-stone-55/70 border-stone-200/50'
                          }`}
                      >
                        <div className={`w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border ${isItemExclusive ? 'border-[#B08B40]/30 bg-[#251F1B]' : 'border-stone-200/50 bg-stone-100'
                          }`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left space-y-1 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-serif font-semibold text-sm leading-snug ${isItemExclusive ? 'text-[#E5D5B8]' : isExclusive ? 'text-[#E5D5B8]' : 'text-stone-850'
                              }`}>
                              {item.name}
                            </h3>
                            {isItemExclusive && (
                              <span className="bg-[#B08B40]/15 text-[#B08B40] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[#B08B40]/30 flex-shrink-0">
                                Exclusive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs mt-2.5">
                            {/* Quantity Controls */}
                            <div className={`flex items-center border rounded-lg overflow-hidden ${isItemExclusive
                              ? 'border-[#B08B40]/30 bg-[#171311]'
                              : isExclusive
                                ? 'border-stone-850 bg-[#171311]/60'
                                : 'border-stone-200 bg-[#FDFBF7]'
                              }`}>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className={`p-1.5 hover:bg-stone-50/10 transition-colors duration-200 ${isItemExclusive
                                  ? 'text-[#E5D5B8] hover:bg-[#B08B40]/10'
                                  : isExclusive
                                    ? 'text-[#E5D5B8]/80 hover:bg-white/5'
                                    : 'text-stone-600 hover:bg-stone-100'
                                  }`}
                              >
                                <Minus className="w-3 h-3 stroke-[2]" />
                              </button>
                              <span className={`px-2 text-xs font-bold font-sans ${isItemExclusive ? 'text-[#E5D5B8]' : isExclusive ? 'text-[#E5D5B8]' : 'text-stone-800'
                                }`}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className={`p-1.5 hover:bg-stone-50/10 transition-colors duration-200 ${isItemExclusive
                                  ? 'text-[#E5D5B8] hover:bg-[#B08B40]/10'
                                  : isExclusive
                                    ? 'text-[#E5D5B8]/80 hover:bg-white/5'
                                    : 'text-stone-600 hover:bg-stone-100'
                                  }`}
                              >
                                <Plus className="w-3 h-3 stroke-[2]" />
                              </button>
                            </div>

                            {/* Trash Icon */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className={`p-1.5 rounded-lg transition-colors duration-200 ${isItemExclusive
                                ? 'text-stone-500 hover:text-rose-400 hover:bg-rose-950/20'
                                : isExclusive
                                  ? 'text-stone-500 hover:text-rose-400 hover:bg-rose-950/20'
                                  : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100'
                                }`}
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Price Calculation */}
                <div className={`space-y-3.5 text-sm ${isExclusive ? 'text-[#D5CFC1]' : 'text-stone-600'}`}>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className={`font-semibold ${isExclusive ? 'text-[#E5D5B8]' : 'text-stone-850'}`}>₹ {totalRawPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5% GST)</span>
                    <span className={`font-semibold ${isExclusive ? 'text-[#E5D5B8]' : 'text-stone-850'}`}>₹ {tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-xs">Free</span>
                  </div>
                  <div className={`flex justify-between border-t pt-4 text-base font-bold ${isExclusive ? 'border-[#B08B40]/15 text-[#E5D5B8]' : 'border-stone-150 text-stone-850'
                    }`}>
                    <span>Total Amount</span>
                    <span className="text-[#B08B40]">₹ {total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full py-4.5 bg-[#B08B40] hover:bg-[#96722D] text-white font-semibold text-sm md:text-base tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay Securely ₹ {total.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-stone-400 leading-relaxed max-w-xs mx-auto">
                  Payments are encrypted and secured by Razorpay. By checking out, you agree to our heritage Terms of Craft.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <ShoppingBag className={`w-12 h-12 mx-auto stroke-[1.2] ${isExclusive ? 'text-stone-700' : 'text-stone-300'}`} />
                <div className="space-y-1">
                  <p className={`font-serif text-sm ${isExclusive ? 'text-[#E5D5B8]' : 'text-stone-800'}`}>Your checkout is empty</p>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                    Add heritage or exclusive products to your bag to proceed.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex py-2.5 px-6 bg-[#B08B40] hover:bg-[#96722D] text-white font-semibold text-xs tracking-widest uppercase rounded-xl transition-all duration-300 no-underline shadow-sm cursor-pointer"
                >
                  Explore Collection
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
