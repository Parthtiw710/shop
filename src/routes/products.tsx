import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { addToCart } from '../lib/cart-store'


// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

export interface ProductItem {
  id: string
  name: string
  price: string
  image: string
  description: string
  fabric: string
  weaving: string
}

export interface Category {
  id: string
  title: string
  items: ProductItem[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'bridal',
    title: 'Bridal Collection',
    items: [
      {
        id: 'bridal-1',
        name: 'Bridal Lehnga 1',
        price: '₹ 4000',
        image: '/images/bridal_collect1.png',
        description: 'An exquisite hand-embroidered heritage bridal lehnga in crimson silk.',
        fabric: 'Katan Silk & Velvet',
        weaving: 'Zardozi Embroidery'
      },
      {
        id: 'bridal-2',
        name: 'Bridal Lehnga 2',
        price: '₹ 4300',
        image: '/images/bridal_collect2.png',
        description: 'Classic gold zari brocade bridal drapery crafted by master weavers.',
        fabric: 'Pure Silk Brocade',
        weaving: 'Banarasi Karwa'
      },
      {
        id: 'bridal-3',
        name: 'Bridal Lehnga 3',
        price: '₹ 3700',
        image: '/images/bridal_collect3.png',
        description: 'Delicate handloom raw silk bridal ensemble with hand-stitched borders.',
        fabric: 'Raw Silk & Organza',
        weaving: 'Kashmiri Tilla Work'
      },
      {
        id: 'bridal-4',
        name: 'Bridal Lehnga 4',
        price: '₹ 4500',
        image: '/images/bridal_collect4.jpg',
        description: 'Heavy Banarasi silk couture bridal wear with intricate floral motifs.',
        fabric: 'Satin Silk Brocade',
        weaving: 'Kadwa Handloom'
      }
    ]
  },
  {
    id: 'everyday',
    title: 'Everyday Collection',
    items: [
      {
        id: 'everyday-1',
        name: 'Everyday Elegance 1',
        price: '₹ 1000',
        image: '/images/everyday_collect1.jpg',
        description: 'Lightweight linen cotton blend saree for effortless daily style.',
        fabric: 'Linen Cotton Blend',
        weaving: 'Plain Handloom Weave'
      },
      {
        id: 'everyday-2',
        name: 'Everyday Elegance 2',
        price: '₹ 1100',
        image: '/images/everyday_collect2.jpg',
        description: 'Soft pastel handwoven daily drape featuring minimalist borders.',
        fabric: 'Fine Mercerized Cotton',
        weaving: 'Jamdani Motif Borders'
      },
      {
        id: 'everyday-3',
        name: 'Everyday Elegance 3',
        price: '₹ 900',
        image: '/images/everyday_collect3.jpg',
        description: 'Breathable organic cotton weave providing all-day comfort.',
        fabric: 'Organic Mulmul Cotton',
        weaving: 'Traditional Handloom'
      }
    ]
  },
  {
    id: 'festival',
    title: 'Festival Collection',
    items: [
      {
        id: 'festival-1',
        name: 'Festival Saree 1',
        price: '₹ 2200',
        image: '/images/festive_collect1.png',
        description: 'Vibrant crimson silk-cotton saree with striking gold accents.',
        fabric: 'Chanderi Silk Cotton',
        weaving: 'Zari Weaving'
      },
      {
        id: 'festival-2',
        name: 'Festival Saree 2',
        price: '₹ 1800',
        image: '/images/festival_collect2.png',
        description: 'Gorgeous handloom tissue saree featuring a metallic gold sheen.',
        fabric: 'Tissue Silk Blend',
        weaving: 'Handloom Kora'
      },
      {
        id: 'festival-3',
        name: 'Festival Saree 3',
        price: '₹ 2000',
        image: '/images/festival_collect3.jpeg',
        description: 'Elegant festive wear displaying handcrafted borders.',
        fabric: 'Heritage Silk',
        weaving: 'Traditional Border Weave'
      }
    ]
  },
  {
    id: 'handloom',
    title: 'Handicraft Collection',
    items: [
      {
        id: 'handloom-1',
        name: 'Handicraft 1',
        price: '₹ 1800',
        image: '/images/handloom_collecct1.png',
        description: 'Charming indigo hand-block printed cotton handicraft saree.',
        fabric: 'Kalamkari Handblock Cotton',
        weaving: 'Dabu Handprint Weaving'
      },
      {
        id: 'handloom-2',
        name: 'Handicraft 2',
        price: '₹ 1400',
        image: '/images/handloom_collect2.png',
        description: 'Organic handspun khadi cotton saree with fringe detailing.',
        fabric: 'Handspun Organic Khadi',
        weaving: 'Traditional Pit Loom'
      },
      {
        id: 'handloom-3',
        name: 'Handicraft 3',
        price: '₹ 2200',
        image: '/images/handloom_collect3.png',
        description: 'Stunning tie-and-dye bandhani handicraft saree in heritage silk.',
        fabric: 'Gaji Silk Blend',
        weaving: 'Bandhej Knot Tie-Dye'
      }
    ]
  }
]

function ProductsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Initialize Lenis scroll engine and support hash scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
    })

    lenisRef.current = lenis
    lenis.on('scroll', () => ScrollTrigger.update())

    let rafId: number
    const frame = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    // Handle hash scroll on initial load
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash)
        if (target) {
          lenis.scrollTo(hash, { offset: -100, duration: 1.6 })
        }
      }, 300)
    }

    return () => {
      lenis.destroy()
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash && lenisRef.current) {
        lenisRef.current.scrollTo(hash, { offset: -100, duration: 1.6 })
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Staggered section fade-in entrance
  useGSAP(() => {
    const tl = gsap.timeline()
    tl.fromTo('.back-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
      .fromTo('.header-kicker', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo('.header-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')

    // Stagger entry of product rows
    gsap.utils.toArray('.category-section').forEach((section: any) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
  }, { scope: containerRef })

  // Refresh ScrollTrigger when expanding/collapsing categories
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [expandedCategories])

  const toggleExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }))
  }

  // 3D tilt mouse movement handler for product cards
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    itemId: string
  ) => {
    const el = document.getElementById(`img-wrap-${itemId}`)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateY = (x / (rect.width / 2)) * 6 // Max 6 degrees horizontal tilt
    const rotateX = -(y / (rect.height / 2)) * 6 // Max 6 degrees vertical tilt

    gsap.to(el, {
      rotateY,
      rotateX,
      scale: 1.03,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handleMouseLeave = (itemId: string) => {
    const el = document.getElementById(`img-wrap-${itemId}`)
    if (!el) return
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FDFBF7] text-[#1F1A16] py-12 sm:py-24 px-6 md:px-12 flex flex-col items-center select-none overflow-x-hidden"
    >
      {/* Go to Home Button (Only extra navigation button) */}
      <div className="w-full max-w-[90vw] mb-8 sm:mb-12 flex justify-start">
        <Link
          to="/"
          className="back-btn group inline-flex items-center gap-4 py-3.5 px-7 rounded-full border border-stone-300 bg-[#FDFBF7] text-sm font-semibold uppercase tracking-wider text-stone-700 hover:text-[#FDFBF7] hover:bg-[#B08B40] hover:border-[#B08B40] transition-all duration-300 cursor-pointer"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
          Go to Home
        </Link>
      </div>

      {/* Header Block */}
      <header className="w-full max-w-[90vw] text-center mb-12 sm:mb-20 flex flex-col items-center">
        <span className="header-kicker font-serif italic text-xs md:text-sm tracking-[0.25em] uppercase text-[#B08B40] mb-4">
          — Signature Collections
        </span>
        <h1 className="header-title font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-[#1F1A16] leading-tight font-light tracking-wide">
          THE ARTISAN CATALOGUE
        </h1>
      </header>

      {/* Main Categories Section: Constrained to 90vw width */}
      <main className="w-full max-w-[90vw] flex flex-col gap-20 sm:gap-36">
        {CATEGORIES.map((category) => {
          const isExpanded = !!expandedCategories[category.id]

          return (
            <section
              key={category.id}
              id={category.id}
              className="category-section w-full border-b border-stone-200/80 pb-12 sm:pb-24 flex flex-col"
            >
              {/* Category Header Row */}
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-baseline sm:justify-between mb-6 sm:mb-8">
                <h2 className="font-serif text-xl md:text-3xl text-[#1F1A16] font-normal tracking-wide">
                  {category.title}
                </h2>

                {/* Expand / Grid view toggle */}
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="hidden sm:block text-xs md:text-sm uppercase tracking-widest font-semibold text-[#B08B40] hover:text-[#96722D] border-b border-[#B08B40]/40 hover:border-[#96722D]/60 pb-1 transition-all duration-300 cursor-pointer"
                >
                  {isExpanded ? 'Collapse Category' : 'Expand Category'}
                </button>
              </div>

              {isExpanded ? (
                /* EXPANDED GRID VIEW: Matches the structural layout of the exclusive collection page (2 columns, max-w 60vw) */
                <div className="w-full max-w-[90vw] md:max-w-[60vw] mx-auto transition-all duration-500 ease-out">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-20 md:gap-x-16 md:gap-y-28 items-start">
                    {category.items.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        handleMouseMove={handleMouseMove}
                        handleMouseLeave={handleMouseLeave}
                        onAddToCart={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* MOBILE VIEW: Always show as a vertical list on mobile screens (hidden on sm and above) */}
                  <div className="block sm:hidden w-full max-w-[90vw] mx-auto">
                    <div className="grid grid-cols-1 gap-y-12 items-start">
                      {category.items.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          handleMouseMove={handleMouseMove}
                          handleMouseLeave={handleMouseLeave}
                          onAddToCart={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* DESKTOP/TABLET VIEW: Horizontal scroll view (hidden on mobile, visible on sm and above) */}
                  <div className="hidden sm:flex w-full overflow-x-auto scrollbar-none pb-4 -mx-2 px-2 gap-6 sm:gap-12 md:gap-16 scroll-smooth snap-x snap-mandatory sm:snap-none">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="w-[85%] sm:w-[38vw] md:w-[27.8vw] flex-shrink-0 snap-center sm:snap-align-none"
                      >
                        <ProductCard
                          item={item}
                          handleMouseMove={handleMouseMove}
                          handleMouseLeave={handleMouseLeave}
                          onAddToCart={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}

interface ProductCardProps {
  item: ProductItem
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>, itemId: string) => void
  handleMouseLeave: (itemId: string) => void
  onAddToCart: () => void
}

function ProductCard({ item, handleMouseMove, handleMouseLeave, onAddToCart }: ProductCardProps) {
  return (
    <article className="flex flex-col w-full bg-white sm:bg-[#FDFBF7] rounded-2xl sm:rounded-none border border-stone-200/70 sm:border-0 shadow-sm sm:shadow-none overflow-hidden sm:overflow-visible p-6 sm:p-0">
      {/* Transparent centering wrapper */}
      <div className="w-full flex justify-center mb-4 sm:mb-10">
        {/* Image Box with 5:4 aspect ratio, scaled to 90% width and centered */}
        <div
          onMouseMove={(e) => handleMouseMove(e, item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
          className="relative w-full sm:w-[90%] aspect-[5/4] rounded-xl overflow-hidden border border-[#B08B40]/15 bg-stone-100 cursor-pointer group"
        >
          <div
            id={`img-wrap-${item.id}`}
            className="w-full h-full"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Info Panel with horizontal padding to constrain width */}
      <div className="flex flex-col text-left px-0 sm:px-3 md:px-4">
        <div className="flex items-baseline justify-between gap-4 sm:gap-8 mb-2.5">
          <h3 className="font-serif text-base sm:text-xl md:text-2xl text-[#1F1A16] font-medium tracking-wide uppercase leading-snug">
            {item.name}
          </h3>
          <span className="font-serif text-sm sm:text-lg md:text-xl text-[#B08B40] font-semibold flex-shrink-0">
            {item.price}
          </span>
        </div>

        <p className="font-sans text-sm text-stone-600 leading-relaxed mb-6 sm:mb-10 min-h-[40px] line-clamp-2">
          {item.description}
        </p>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-x-4 sm:flex sm:gap-x-6 border-t border-stone-200/50 pt-4 mb-10 text-xs tracking-wider uppercase text-stone-400 font-sans">
          <div>
            <span className="text-[#B08B40]/70 font-bold block mb-1">Fabric</span>
            <span className="text-stone-700 font-medium normal-case text-sm">{item.fabric}</span>
          </div>
          <div>
            <span className="text-[#B08B40]/70 font-bold block mb-1">Weave</span>
            <span className="text-stone-700 font-medium normal-case text-sm">{item.weaving}</span>
          </div>
        </div>

        {/* Action buttons - stretch within the padded wrapper (Increased sizes and changed to brand gold theme) */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            to="/checkout"
            search={{ productId: item.id }}
            className="w-full sm:flex-1 py-2.5 px-4 sm:py-3.5 sm:px-6 bg-[#B08B40] hover:bg-[#96722D] text-[#FDFBF7] font-semibold text-xs sm:text-sm tracking-widest uppercase rounded transition-colors duration-300 cursor-pointer shadow-sm text-center no-underline flex items-center justify-center"
          >
            Shop Now
          </Link>
          <button
            onClick={onAddToCart}
            className="w-full sm:flex-1 py-2.5 px-4 sm:py-3.5 sm:px-6 border border-[#B08B40] hover:bg-[#B08B40] hover:text-[#FDFBF7] text-[#B08B40] font-semibold text-xs sm:text-sm tracking-widest uppercase rounded transition-all duration-300 cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}