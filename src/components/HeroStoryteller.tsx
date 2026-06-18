import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from '@studio-freight/lenis'
import BillboardShowcase from './BillboardShowcase'

gsap.registerPlugin(ScrollTrigger)

type Stage = 'text' | 'video' | 'main'

export default function HeroStoryteller() {
  const containerRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLHeadingElement>(null)
  const logoSubRef = useRef<HTMLSpanElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // Asymmetric image refs for 3D tilt interactions
  const img1Ref = useRef<HTMLDivElement>(null)
  const img2Ref = useRef<HTMLDivElement>(null)
  const img3Ref = useRef<HTMLDivElement>(null)

  const [stage, setStage] = useState<Stage>('text')
  const [headerDone, setHeaderDone] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('lakshkriti_intro_shown') === 'true') {
      setStage('main')
      setHeaderDone(true)
    }
  }, [])

  // 3D tilt interaction handler mapping cursor relative coordinates
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Map coordinates to maximum rotation of 12 degrees on hover
    const rotateY = (x / (rect.width / 2)) * 12
    const rotateX = -(y / (rect.height / 2)) * 12

    gsap.to(el, {
      rotateY,
      rotateX,
      rotation: 0, // straighten the flat rotation on hover
      scale: 1.04,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handleMouseLeave = (
    ref: React.RefObject<HTMLDivElement | null>,
    defaultRotation: number
  ) => {
    const el = ref.current
    if (!el) return

    // Smoothly return to default flat rotation and scale
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      rotation: defaultRotation,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  /* ─── Lenis smooth scroll (only once main page is live) ─── */
  useEffect(() => {
    document.body.style.overflow = stage === 'main' ? 'auto' : 'hidden'

    if (stage !== 'main') return

    const lenis = new Lenis({
      duration: 1.4, // Slightly longer, more luxurious ease
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1, // Elevates response to scroll wheel interactions
      touchMultiplier: 1.4, // Fluid touch response
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
      document.body.style.overflow = 'auto'
    }
  }, [stage])

  /* ─── Main intro timeline ─── */
  useGSAP(() => {
    const isIntroShown = typeof window !== 'undefined' && sessionStorage.getItem('lakshkriti_intro_shown') === 'true'
    if (isIntroShown) {
      // If we skipped the intro, just play a clean, quick fade/slide-up entrance of the main page elements
      const tl = gsap.timeline()
      tl.fromTo(
        mainRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )

      tl.fromTo(
        '.tagline-line',
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, stagger: 0.08, duration: 0.6, ease: 'power3.out' },
        '-=0.6'
      )

      tl.fromTo(
        '.fade-up-item',
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => setHeaderDone(true),
        },
        '-=0.5'
      )
      return
    }

    const tl = gsap.timeline()

    // Set initial layout states (stationary, 20% opacity)
    gsap.set([logoRef.current, logoSubRef.current], { opacity: 0.2 })

    // ① Symmetrical fade-in entrance (sped up to 0.96s)
    tl.to([logoRef.current, logoSubRef.current], {
      opacity: 1,
      duration: 0.96,
      ease: 'power2.inOut',
    })

    // ② Keep the text fully shown for exactly 0.56s before video/exit starts
    tl.add(() => {
      setStage('video')
      if (videoRef.current) {
        videoRef.current.playbackRate = 1.25 // Play at 1.25x speed
        videoRef.current.play().catch(() => { })
      }
    }, '+=0.56')

    // ③ Symmetrical fade-out exit (0.96s) - matches entrance exactly
    tl.to([logoRef.current, logoSubRef.current], {
      opacity: 0,
      duration: 0.96,
      ease: 'power2.inOut',
    }, '<')

    // ③ After 3.2 seconds of video (4s at 1.25x speed), transition to main page
    tl.add(() => { }, '+=3.2')

    tl.to(introRef.current, {
      opacity: 0,
      duration: 0.72,
      ease: 'power2.inOut',
      onComplete: () => {
        setStage('main')
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lakshkriti_intro_shown', 'true')
        }
      },
    })

    tl.fromTo(
      mainRef.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' },
      '-=0.4'
    )

    tl.fromTo(
      '.tagline-line',
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' },
      '-=0.8'
    )

    tl.fromTo(
      '.fade-up-item',
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => setHeaderDone(true),
      },
      '-=0.6'
    )
  }, { scope: containerRef })

  /* ─── Scroll-triggered image reveals (only after main is shown & header is fully loaded) ─── */
  useGSAP(() => {
    if (stage !== 'main' || !headerDone) return

    const imgs = ['.grid-img-1', '.grid-img-2', '.grid-img-3']
    imgs.forEach((sel, i) => {
      gsap.fromTo(
        sel,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sel,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    // Force ScrollTrigger to refresh bounds since layout elements are now visible
    ScrollTrigger.refresh()
  }, [stage, headerDone])

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div ref={containerRef} className="relative w-full bg-[#FCFAF2] min-h-screen text-[#211F1D]">

      {/* ══════════════════════════════════════════════════════════
          INTRO OVERLAY  (black screen: text → video → fade out)
         ══════════════════════════════════════════════════════════ */}
      {stage !== 'main' && (
        <div
          ref={introRef}
          suppressHydrationWarning
          className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center"
          style={{ display: typeof window !== 'undefined' && sessionStorage.getItem('lakshkriti_intro_shown') === 'true' ? 'none' : 'flex' }}
        >
          {/* Full-frame video (hidden until text phase ends) */}
          <video
            ref={videoRef}
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${stage === 'video' ? 'opacity-90' : 'opacity-0'}`}
          >

            <source src="/public/video.mp4" type="video/mp4" />
          </video>

          {/* Dark vignette so text stays readable over video */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />

          {/* Brand text — stationary fade-reveal */}
          <div className="relative z-10 text-center select-none flex flex-col items-center justify-center">
            <h2
              ref={logoRef}
              className="font-script text-7xl md:text-[11rem] lg:text-[12.5rem] text-[#E8D5A8] drop-shadow-2xl leading-none"
              style={{ opacity: 0.2 }}
            >
              LakshKriti
            </h2>
            <span
              ref={logoSubRef}
              className="font-sans text-sm md:text-base tracking-[0.5em] uppercase text-stone-300 mt-6 block font-semibold"
              style={{ opacity: 0.2 }}
            >
              Handwoven Heritage
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MAIN PAGE  (revealed after intro)
         ══════════════════════════════════════════════════════════ */}
      <div
        ref={mainRef}
        className={`w-full transition-none ${stage !== 'main' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {/* ── Hero Header ── */}
        <section className="relative pt-40 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-end">

            {/* Left Column: Asymmetrical Typography */}
            <div className="md:col-span-7 flex flex-col items-start text-left">
              <span className="fade-up-item text-[#B08B40] font-sans text-xs tracking-[0.3em] uppercase font-bold mb-6 block">
                Crafted for the Modern Connoisseur.
              </span>

              <h1 className="font-serif text-5xl md:text-7xl font-light tracking-wide text-[#211F1D] leading-[1.15] w-full">
                <div className="overflow-hidden mb-1">
                  <span className="tagline-line inline-block">Every thread,</span>
                </div>
                <div className="overflow-hidden mb-2 pl-12 md:pl-20">
                  <span className="tagline-line inline-block italic text-[#B08B40]">
                    a hand.
                  </span>
                </div>
                <div className="overflow-hidden">
                  <span className="tagline-line font-script text-6xl md:text-7xl text-[#6D1A24] inline-block normal-case tracking-normal pt-2">
                    Every hand, a story.
                  </span>
                </div>
              </h1>
            </div>

            {/* Right Column: Minimalist Editorial copy & CTA */}
            <div className="md:col-span-5 flex flex-col items-start text-left md:pl-8 pb-3">
              <p className="fade-up-item font-sans text-sm md:text-base text-stone-500 leading-relaxed mb-8 max-w-sm">
                An elegant canvas of organic handlooms, finest Banarasi silks, and gold zari embroidery,
                meticulously brought to life by master weavers.
              </p>

              <div className="fade-up-item flex items-center gap-8">
                <Link
                  to="/products"
                  className="group relative inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-semibold text-[#6D1A24] hover:text-[#58151D] transition-all duration-300"
                >
                  <span className="relative">
                    Explore Collection
                    <span className="absolute bottom-[-4px] left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-300" />
                    <span className="absolute bottom-[-4px] left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </span>
                  <span className="text-[#6D1A24] group-hover:text-[#58151D] transform group-hover:translate-x-1.5 transition-transform duration-300">
                    →
                  </span>
                </Link>

                <div className="flex flex-col text-left border-l border-stone-200 pl-4">
                  <span className="font-serif text-base text-[#211F1D] italic leading-none">LakshKriti</span>
                  <span className="text-[8px] tracking-widest uppercase text-stone-400 font-sans mt-1">Est. 2026</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Asymmetric Staggered Image Grid ── */}
        <section className={`relative max-w-6xl mx-auto px-6 md:px-12 pb-40 transition-all duration-1000 ease-out ${headerDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Three distinct, slightly more opaque luxury background labels */}
          <div className="absolute inset-0 pointer-events-none select-none z-[-1] overflow-hidden">
            <span className="font-serif italic text-[#DCD5BF] text-[8rem] md:text-[11rem] font-light leading-none opacity-90 absolute left-8 top-16 select-none">
              Loom
            </span>
            <span className="font-serif italic text-[#DCD5BF] text-[8rem] md:text-[11rem] font-light leading-none opacity-90 absolute right-12 top-[32rem] select-none">
              Kriti
            </span>
            <span className="font-serif italic text-[#DCD5BF] text-[9rem] md:text-[12rem] font-light leading-none opacity-90 absolute left-[15%] bottom-[14rem] select-none">
              Heritage
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-x-16 md:gap-y-36 items-start">

            {/* ① Sage Green Organza — Portrait (Left Column) */}
            <div className="grid-img-1 md:col-span-5 flex flex-col items-center">
              <div className="parallax-inner-1 w-full flex flex-col">
                <div
                  ref={img1Ref}
                  onMouseMove={(e) => handleMouseMove(e, img1Ref)}
                  onMouseLeave={() => handleMouseLeave(img1Ref, -3)}
                  className="relative aspect-[1158/1567] w-full rounded-2xl overflow-hidden border border-stone-200/60 shadow-[0_12px_28px_rgba(0,0,0,0.05)] bg-stone-50 group select-none cursor-pointer"
                  style={{ transform: 'rotate(-3deg)' }}
                >
                  <img
                    src="/images/img1.jpg"
                    alt="Everyday Elegance"
                    className="w-full h-full object-cover transition-all duration-700 ease-out grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between w-full text-stone-700 border-t border-stone-200/60 pt-3">
                  <span className="font-serif italic text-sm text-[#B08B40] font-medium">01 / Everyday</span>
                  <span className="font-sans text-xs tracking-[0.12em] uppercase font-bold text-[#3D3A35]">
                    Everyday Elegance
                  </span>
                  <Link
                    to="/products"
                    hash="everyday"
                    className="group relative inline-flex items-center gap-1.5 text-xs tracking-[0.12em] font-semibold text-[#6D1A24] hover:text-[#58151D] uppercase transition-all duration-300"
                  >
                    <span className="relative pb-0.5">
                      Explore
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-300" />
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                    <span className="text-[#6D1A24] group-hover:text-[#58151D] transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ② Navy Handloom — Square (Right Column, Staggered Down) */}
            <div className="grid-img-2 md:col-span-6 md:col-start-7 md:mt-36 flex flex-col items-center">
              <div className="parallax-inner-2 w-full flex flex-col">
                <div
                  ref={img2Ref}
                  onMouseMove={(e) => handleMouseMove(e, img2Ref)}
                  onMouseLeave={() => handleMouseLeave(img2Ref, 3.5)}
                  className="relative aspect-square w-full rounded-2xl overflow-hidden border border-stone-200/60 shadow-[0_12px_28px_rgba(0,0,0,0.05)] bg-stone-50 group select-none cursor-pointer"
                  style={{ transform: 'rotate(3.5deg)' }}
                >
                  <img
                    src="/images/img2.jpg"
                    alt="Handloom & Craft"
                    className="w-full h-full object-cover transition-all duration-700 ease-out grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between w-full text-stone-700 border-t border-stone-200/60 pt-3">
                  <span className="font-serif italic text-sm text-[#B08B40] font-medium">02 / Handloom</span>
                  <span className="font-sans text-xs tracking-[0.12em] uppercase font-bold text-[#3D3A35]">
                    Handloom & Craft
                  </span>
                  <Link
                    to="/products"
                    hash="handloom"
                    className="group relative inline-flex items-center gap-1.5 text-xs tracking-[0.12em] font-semibold text-[#6D1A24] hover:text-[#58151D] uppercase transition-all duration-300"
                  >
                    <span className="relative pb-0.5">
                      Explore
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-300" />
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                    <span className="text-[#6D1A24] group-hover:text-[#58151D] transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ③ Red Banarasi — Landscape (Centered Bottom, Overlapping Stagger) */}
            <div className="grid-img-3 col-span-1 md:col-span-8 md:col-start-3 md:-mt-12 flex flex-col items-center">
              <div className="parallax-inner-3 w-full flex flex-col">
                <div
                  ref={img3Ref}
                  onMouseMove={(e) => handleMouseMove(e, img3Ref)}
                  onMouseLeave={() => handleMouseLeave(img3Ref, -1.5)}
                  className="relative aspect-[1152/832] w-full rounded-2xl overflow-hidden border border-[#C5A464]/25 shadow-[0_16px_36px_rgba(109,26,36,0.07)] bg-stone-50 group select-none cursor-pointer"
                  style={{ transform: 'rotate(-1.5deg)' }}
                >
                  <img
                    src="/images/img3.png"
                    alt="Festive Sarees"
                    className="w-full h-full object-cover transition-all duration-700 ease-out grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between w-full text-stone-700 border-t border-stone-200/60 pt-3">
                  <span className="font-serif italic text-sm text-[#B08B40] font-medium">03 / Festival</span>
                  <span className="font-sans text-xs tracking-[0.12em] uppercase font-bold text-[#3D3A35]">
                    Festive Sarees
                  </span>
                  <Link
                    to="/products"
                    hash="festival"
                    className="group relative inline-flex items-center gap-1.5 text-xs tracking-[0.12em] font-semibold text-[#6D1A24] hover:text-[#58151D] uppercase transition-all duration-300"
                  >
                    <span className="relative pb-0.5">
                      Explore
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-300" />
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#6D1A24] group-hover:bg-[#58151D] origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                    <span className="text-[#6D1A24] group-hover:text-[#58151D] transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        <BillboardShowcase stage={stage} />
      </div>
    </div>
  )
}
