import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { addToCart } from '../lib/cart-store'
import productsData from '../lib/exclusiveProducts.json'


// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/exclusive-collection')({
  component: ExclusiveCollection,
})

interface Product {
  id: string
  name: string
  kicker: string
  price: string
  description: string
  fabric: string
  weaving: string
  image: string
}

function ExclusiveCollection() {
  const pageRef = useRef<HTMLDivElement>(null)
  const products: Product[] = productsData

  // Setup Lenis smooth scrolling for this page
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
    })

    lenis.on('scroll', () => ScrollTrigger.update())

    let rafId: number
    const frame = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      lenis.destroy()
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Staggered entrance animations
  useGSAP(() => {
    const tl = gsap.timeline()
    
    // Header reveals
    tl.fromTo('.back-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
      .fromTo('.header-kicker', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo('.header-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .fromTo('.header-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')

    // Staggered product card entry
    gsap.utils.toArray('.product-card').forEach((card: any) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
  }, { scope: pageRef })

  // 3D tilt mouse movement handler
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    cardId: string
  ) => {
    const el = document.getElementById(`img-wrap-${cardId}`)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateY = (x / (rect.width / 2)) * 6 // Max 6 degrees horizontal tilt
    const rotateX = -(y / (rect.height / 2)) * 6 // Max 6 degrees vertical tilt
    
    gsap.to(el, {
      rotateY,
      rotateX,
      scale: 1.025,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handleMouseLeave = (cardId: string) => {
    const el = document.getElementById(`img-wrap-${cardId}`)
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
      ref={pageRef}
      className="min-h-screen bg-[#1F1A16] text-[#E5D5B8] py-28 px-6 md:px-12 flex flex-col items-center select-none overflow-x-hidden"
    >
      {/* Back to Home Button */}
      <div className="w-full max-w-[90vw] md:max-w-[60vw] mb-12 flex justify-start">
        <Link
          to="/"
          className="back-btn group inline-flex items-center gap-3 py-2 px-4 rounded-full border border-[#B08B40]/30 bg-[#1F1A16] text-xs font-semibold uppercase tracking-wider text-[#E5D5B8] hover:text-[#1F1A16] hover:bg-[#B08B40] hover:border-[#B08B40] transition-all duration-300"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
          Return to Story
        </Link>
      </div>

      {/* Header Section */}
      <header className="w-full max-w-[90vw] md:max-w-[60vw] text-center mb-20 flex flex-col items-center">
        <span className="header-kicker font-serif italic text-xs md:text-sm tracking-[0.25em] uppercase text-[#B08B40] mb-4">
          — Curated Masterpieces
        </span>
        <h1 className="header-title font-serif text-3xl md:text-5xl lg:text-6xl text-[#E5D5B8] leading-tight font-light mb-6 tracking-wide">
          THE EXCLUSIVE SELECTION
        </h1>
        <p className="header-desc font-sans text-sm md:text-base text-[#D5CFC1] max-w-xl leading-relaxed">
          A private lookbook of our rarest, limited-edition handwoven collections. 
          Each piece represents weeks of master-weaver dedication.
        </p>
      </header>

      {/* Main Grid: Limited to 60vw on desktop, displays 2 products in a row */}
      <main className="w-full max-w-[90vw] md:max-w-[60vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-20 md:gap-x-16 md:gap-y-28 items-start">
          {products.map((product) => (
            <article key={product.id} className="product-card w-full flex flex-col">
              
              {/* Transparent centering wrapper */}
              <div className="w-full flex justify-center mb-6">
                {/* Product Image Box with 5:4 aspect ratio and 3D tilt */}
                <div
                  onMouseMove={(e) => handleMouseMove(e, product.id)}
                  onMouseLeave={() => handleMouseLeave(product.id)}
                  className="relative w-full aspect-[5/4] lg:aspect-[3/2] lg:max-w-[90%] rounded-2xl overflow-hidden border border-[#B08B40]/15 bg-[#171311] cursor-pointer group"
                >
                  <div
                    id={`img-wrap-${product.id}`}
                    className="w-full h-full"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105"
                    />
                    
                    {/* Subtle Elegant Gold Vignette Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                  </div>
                </div>
              </div>

              {/* Product Info Block */}
              <div className="flex flex-col text-left">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-serif italic text-[10px] md:text-xs lg:text-[13px] tracking-wider text-[#B08B40] uppercase">
                    {product.kicker}
                  </span>
                  <span className="font-serif text-sm md:text-base lg:text-lg text-[#E5D5B8] font-medium">
                    {product.price}
                  </span>
                </div>
                
                <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-[#E5D5B8] font-normal tracking-wide mb-3">
                  {product.name}
                </h3>
                
                <p className="font-sans text-xs md:text-sm lg:text-base text-[#D5CFC1] leading-relaxed mb-4 min-h-[48px]">
                  {product.description}
                </p>

                {/* Fabric Specifications Section */}
                <div className="flex gap-x-6 border-t border-[#B08B40]/10 pt-3 mb-6 text-[10px] lg:text-[12px] tracking-wider uppercase text-[#E5D5B8]/80 font-sans">
                  <div>
                    <span className="text-[#B08B40]/70 font-semibold block mb-0.5 text-[9px] lg:text-[11px]">Fabric</span>
                    {product.fabric}
                  </div>
                  <div>
                    <span className="text-[#B08B40]/70 font-semibold block mb-0.5 text-[9px] lg:text-[11px]">Weaving</span>
                    {product.weaving}
                  </div>
                </div>

                {/* Add to Cart & Shop Now Buttons */}
                <div className="flex gap-4">
                  <Link
                    to="/checkout"
                    search={{ productId: product.id }}
                    className="flex-1 py-2.5 px-4 bg-[#B08B40] hover:bg-[#c59e4f] text-[#1F1A16] font-semibold text-[10px] md:text-xs lg:text-sm tracking-widest uppercase rounded-lg transition-colors duration-300 text-center no-underline flex items-center justify-center cursor-pointer"
                  >
                    Buy Now
                  </Link>
                  <button
                    onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, isExclusive: true })}
                    className="flex-1 py-2.5 px-4 border border-[#B08B40]/40 hover:border-[#B08B40] hover:bg-[#B08B40]/10 text-[#E5D5B8] font-semibold text-[10px] md:text-xs lg:text-sm tracking-widest uppercase rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>

              </div>

            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
