import { useLocation, useSearch } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { cartStore } from '../lib/cart-store'
import exclusiveProducts from '../lib/exclusiveProducts.json'

export default function Footer() {
  const year = new Date().getFullYear()
  const location = useLocation()
  const cartItems = useSelector(cartStore, (s) => s.items)
  const search = useSearch({ strict: false }) as { productId?: string }

  const isExclusivePage = (() => {
    if (location.pathname === '/exclusive-collection') return true
    if (location.pathname === '/checkout') {
      if (search.productId) {
        return exclusiveProducts.some((ex) => ex.id === search.productId)
      }
      return cartItems.length > 0 && cartItems.every((item) => {
        return item.isExclusive || exclusiveProducts.some((ex) => ex.id === item.id)
      })
    }
    if (location.pathname === '/cart') {
      return cartItems.length > 0 && cartItems.every((item) => {
        return item.isExclusive || exclusiveProducts.some((ex) => ex.id === item.id)
      })
    }
    return false
  })()

  return (
    <footer
      className={`${isExclusivePage ? 'mt-0' : 'mt-20 border-t'} px-4 pb-14 pt-12 transition-all duration-300`}
      style={{
        backgroundColor: isExclusivePage ? '#1F1A16' : '#F5F2EB',
        borderColor: isExclusivePage ? 'rgba(176, 139, 64, 0.2)' : '#E6DFD5',
        color: isExclusivePage ? '#E5D5B8' : '#1F1A16',
        borderTopWidth: isExclusivePage ? '1px' : undefined,
        borderTopStyle: isExclusivePage ? 'solid' : undefined
      }}
    >
      <div className="page-wrap mx-auto max-w-6xl flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">

        {/* Left Side: Copyright Notice */}
        <p
          className="m-0 text-sm font-medium tracking-wide"
          style={{ color: isExclusivePage ? '#7C7267' : '#7C7267' }}
        >
          &copy; {year} LakshKriti. All rights reserved.
        </p>

        {/* Center: Premium Brand Tagline */}
        <p
          className="m-0 text-xs tracking-widest uppercase font-semibold px-4 py-1.5 rounded-full border transition-all duration-300"
          style={{
            borderColor: 'rgba(176, 139, 64, 0.2)', // 20% brand gold opacity
            color: '#B08B40',                       // Signature Heritage Gold
            backgroundColor: isExclusivePage ? '#171311' : '#FDFBF7' // Primary Cream Background
          }}
        >
          Handcrafted Elegance
        </p>

        {/* Right Side: Social Media Links (X, Instagram, Facebook) */}
        <div className="flex justify-center gap-4">

          {/* X / Twitter Link */}
          <a
            href="https://x.com/your_brand"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl p-2 transition-colors duration-300"
            style={{ color: isExclusivePage ? '#E5D5B8' : '#1F1A16' }}
          >
            <span className="sr-only">Follow us on X</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="22" height="22">
              <path
                fill="currentColor"
                d="M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z"
              />
            </svg>
          </a>

          {/* Instagram Link */}
          <a
            href="https://instagram.com/your_brand"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl p-2 transition-colors duration-300"
            style={{ color: isExclusivePage ? '#E5D5B8' : '#1F1A16' }}
          >
            <span className="sr-only">Follow us on Instagram</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          {/* Facebook Link */}
          <a
            href="https://facebook.com/your_brand"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl p-2 transition-colors duration-300"
            style={{ color: isExclusivePage ? '#E5D5B8' : '#1F1A16' }}
          >
            <span className="sr-only">Follow us on Facebook</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
            </svg>
          </a>

        </div>
      </div>
    </footer>
  )
}