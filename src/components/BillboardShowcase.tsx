import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function BillboardShowcase({ stage }: { stage: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const billboardImgContainerRef = useRef<HTMLDivElement>(null)
  const billboardTextRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (stage !== 'main') return

    // Recalculate ScrollTrigger start/end offsets after main page mounts
    ScrollTrigger.refresh()

    const mm = gsap.matchMedia()

    // ─── Desktop Screens (min-width: 768px) ───
    mm.add('(min-width: 768px)', () => {
      // 1) Smooth horizontal sliding: starts at the left corner (-106% translation) and slides to the right corner (0%)
      gsap.fromTo(
        billboardImgContainerRef.current,
        { x: '-106%', opacity: 0.9, scale: 0.98 },
        {
          x: '0%',
          opacity: 1,
          scale: 1,
          ease: 'none', // Set ease to none so scrub handles deceleration natively without micro-stutter
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            end: 'top center', // Slide finishes when the box reaches the middle of the screen
            scrub: 1.6, // Lazy catch-up duration (1.5 - 1.7s)
          },
        }
      )

      // 2) ScrollTrigger for staggered text reveals once the sliding starts/docks
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center', // Triggers text once the card box reaches the middle of the screen
          toggleActions: 'play none none reverse',
        },
      })

      // Take a pause of 0.2s before revealing the text elements
      tl.to({}, { duration: 0.2 })
        .to(
          billboardTextRef.current,
          {
            opacity: 1,
            duration: 0.2,
          }
        )

      // Smooth typewriter + fade-in character-level animation for the title
      tl.fromTo(
        '.title-char',
        { opacity: 0, x: -6, filter: 'blur(3px)' },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          stagger: 0.025,
          duration: 0.35,
          ease: 'power2.out',
        },
        '-=0.1'
      )

      // Clean fade-up block animation for sublabel, paragraph description, and buttons
      tl.fromTo(
        '.billboard-fade-item',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.65,
          ease: 'power2.out',
        },
        '-=0.25'
      )
    })

    // ─── Mobile Screens (max-width: 767px) ───
    mm.add('(max-width: 767px)', () => {
      // On mobile: reset the image to its natural position immediately (no animation)
      gsap.set(billboardImgContainerRef.current, { x: 0, y: 0, opacity: 1 })

      // 2) Staggered text timeline for mobile
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
          toggleActions: 'play none none reverse',
        },
      })

      // Take a pause of 0.2s before revealing the text elements
      tl.to({}, { duration: 0.2 })
        .to(
          billboardTextRef.current,
          {
            opacity: 1,
            duration: 0.2,
          }
        )
        .fromTo(
          '.title-char',
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.015,
            duration: 0.3,
            ease: 'power2.out',
          }
        )
        .fromTo(
          '.billboard-fade-item',
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.1'
        )
    })

    return () => mm.revert()
  }, { scope: containerRef, dependencies: [stage] })

  // Helper to wrap characters for typewriter animations
  const renderChars = (text: string, className: string) => {
    return text.split("").map((char, idx) => (
      <span key={idx} className={`${className} inline-block`}>
        {char === " " ? "\u00A0" : char}
      </span>
    ))
  }

  return (
    <section
      ref={containerRef}
      className="relative w-[96vw] max-w-[96vw] lg:w-[92vw] lg:max-w-[92vw] mx-auto pb-40 overflow-hidden"
    >
      <style>{`
        /* Mobile: force single line and adjust size */
        @media (max-width: 767px) {
          .billboard-title {
            font-size: 5.5vw !important;
            white-space: nowrap !important;
          }
        }
        /* Tablet: force single line and adjust size */
        @media (min-width: 768px) and (max-width: 1024px), (min-aspect-ratio: 15/17.5) and (max-aspect-ratio: 1.1) {
          .billboard-title {
            font-size: 2.9vw !important;
            white-space: nowrap !important;
            line-height: 1.25 !important;
            margin-bottom: 0.75rem !important;
          }
          .billboard-desc {
            font-size: 0.75rem !important;
            line-height: 1.5 !important;
            margin-bottom: 1.25rem !important;
            max-width: 320px !important;
          }
          .billboard-btn {
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
            padding-top: 0.625rem !important;
            padding-bottom: 0.625rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>

      {/* Luxury Billboard Box Card Wrapper */}
      <div className="w-full bg-[#1F1A16] rounded-[2.5rem] border border-[#B08B40]/25 p-6 md:p-10 lg:p-12 flex flex-col md:flex-row md:items-stretch justify-between gap-10 md:gap-12 lg:gap-16 md:h-[42vw] lg:h-[38vw] min-h-[480px] md:min-h-[380px] lg:min-h-0 overflow-hidden">

        {/* Left Column: Text Content */}
        <div
          ref={billboardTextRef}
          className="w-full md:w-[55%] lg:w-[58%] flex flex-col justify-center items-start text-left z-10 pl-2 md:pl-4"
          style={{ opacity: 0 }}
        >
          {/* Sub-kicker label */}
          <span className="billboard-fade-item text-[#B08B40] font-sans text-xs tracking-[0.3em] uppercase font-semibold mb-4 block">
            — Curated Selection
          </span>

          {/* Animated Header (Typewriter) */}
          <h2 className="billboard-title font-serif text-[1.85rem] sm:text-3xl md:text-5xl font-light tracking-wide text-[#E5D5B8] leading-[1.15] mb-6 uppercase whitespace-nowrap">
            {renderChars("BEST FROM OUR COLLECTION", "title-char")}
          </h2>

          {/* Paragraph Description */}
          <p className="billboard-desc billboard-fade-item font-sans text-sm md:text-base text-[#D5CFC1] font-light tracking-wide leading-relaxed mb-8 max-w-md">
            Discover hand-selected masterpieces celebrating India's finest weaving traditions. From opulent bridal drapes to quiet everyday luxury, each piece is a testament to enduring artistry.
          </p>

          {/* Action Buttons */}
          <div className="billboard-fade-item flex flex-col xl:flex-row gap-3 lg:gap-4 w-full">
            <Link
              to="/products"
              hash="bridal"
              className="billboard-btn w-full xl:w-auto px-5 py-2.5 sm:px-8 sm:py-3.5 bg-[#E5D5B8] rounded-full font-serif font-bold tracking-widest text-xs sm:text-sm uppercase transition-all duration-300 shadow-md hover:-translate-y-0.5 text-center"
              style={{ color: '#1F1A16' }}
            >
              Shop now
            </Link>
            <Link
              to="/exclusive-collection"
              className="billboard-btn w-full xl:w-auto px-5 py-2.5 sm:px-8 sm:py-3.5 border border-[#E5D5B8]/40 rounded-full font-serif font-bold tracking-widest text-xs sm:text-sm uppercase transition-all duration-300 hover:-translate-y-0.5 text-center"
              style={{ color: '#E5D5B8' }}
            >
              Explore our Best Collection
            </Link>
          </div>
        </div>

        {/* Right Column: Sliding Image Container */}
        <div className="w-full md:w-[45%] lg:w-[42%] relative flex justify-end items-center h-[350px] md:h-full">
          <div
            ref={billboardImgContainerRef}
            className="h-full md:h-[85%] w-auto aspect-square overflow-hidden rounded-2xl border border-[#B08B40]/25 bg-[#1F1A16]"
            style={{ transform: 'translateX(-106%)' }}
            data-mobile-reset
          >
            <img
              src="/images/billboard.jpg"
              alt="Best from our collection"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  )
}
