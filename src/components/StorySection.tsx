import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // 1) Pin the story container for a scroll depth of 1.5 x screen height
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinRef.current,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 1,
      },
    })

    // Slide 1 to Slide 2 transition
    tl.to('.story-slide-1-img', { opacity: 0, duration: 1 })
      .to('.story-slide-1-text', { opacity: 0, y: -30, duration: 1 }, '<')
      .fromTo('.story-slide-2-img', { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.5')
      .fromTo('.story-slide-2-text', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '<')

    // Slide 2 to Slide 3 transition
    tl.to('.story-slide-2-img', { opacity: 0, duration: 1 })
      .to('.story-slide-2-text', { opacity: 0, y: -30, duration: 1 }, '<')
      .fromTo('.story-slide-3-img', { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.5')
      .fromTo('.story-slide-3-text', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '<')
  }, { scope: containerRef })

  return (
    <div id="story" ref={containerRef} className="w-full bg-[#FCFAF2] text-[#211F1D] overflow-hidden">
      
      {/* Immersive Scroll Story Pin Block (100vh height) */}
      <div ref={pinRef} className="relative w-full h-screen overflow-hidden bg-[#1F1A16]">
        
        {/* Layer 1: Sliding Background Images */}
        <div className="absolute inset-0 w-full h-full">
          <div className="story-slide-1-img absolute inset-0 w-full h-full z-10">
            <img
              src="/images/about1.png"
              alt="Raw Spun Yarn"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="story-slide-2-img absolute inset-0 w-full h-full z-20" style={{ opacity: 0 }}>
            <img
              src="/images/about2.png"
              alt="The Pit Loom"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="story-slide-3-img absolute inset-0 w-full h-full z-30" style={{ opacity: 0 }}>
            <img
              src="/images/about3.png"
              alt="The Heirloom Drape"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/95 z-40 pointer-events-none" />
        </div>

        {/* Layer 2: Text Narrative Content Overlay */}
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6 md:px-12">
          <div className="w-full max-w-4xl text-center relative min-h-[300px] flex items-center justify-center">
            
            {/* Narrative Step 1 */}
            <div className="story-slide-1-text absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif italic text-sm tracking-[0.3em] uppercase text-[#B08B40] mb-4">
                01 / The Origin
              </span>
              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#FDFBF7] tracking-wide uppercase max-w-2xl leading-snug">
                Raw Spun Yarn
              </h3>
              <p className="font-sans text-sm md:text-base text-stone-300 leading-relaxed max-w-xs sm:max-w-lg mt-6">
                It begins with heritage yarn. Harvested by hand in local cooperatives, hand-spun to capture natural, quiet luster.
              </p>
            </div>

            {/* Narrative Step 2 */}
            <div className="story-slide-2-text absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: 0, transform: 'translateY(30px)' }}>
              <span className="font-serif italic text-sm tracking-[0.3em] uppercase text-[#B08B40] mb-4">
                02 / The Craft
              </span>
              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#FDFBF7] tracking-wide uppercase max-w-2xl leading-snug">
                The Pit Loom
              </h3>
              <p className="font-sans text-sm md:text-base text-stone-300 leading-relaxed max-w-xs sm:max-w-lg mt-6">
                Warp meets weft. Over 4,000 threads set up on traditional wooden pit looms, guided solely by generational memory.
              </p>
            </div>

            {/* Narrative Step 3 */}
            <div className="story-slide-3-text absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: 0, transform: 'translateY(30px)' }}>
              <span className="font-serif italic text-sm tracking-[0.3em] uppercase text-[#B08B40] mb-4">
                03 / The Legacy
              </span>
              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#FDFBF7] tracking-wide uppercase max-w-2xl leading-snug">
                The Heirloom Drape
              </h3>
              <p className="font-sans text-sm md:text-base text-stone-300 leading-relaxed max-w-xs sm:max-w-lg mt-6">
                A living masterpiece. Heirloom textiles designed to be passed down through generations as a quiet statement of luxury.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* About Section - Smooth scroll target */}
      <section id="about" className="w-full bg-[#FDFBF7] text-[#1F1A16] py-28 px-6 md:px-12 flex flex-col items-center select-none border-t border-[#E6DFD5]/40">
        <div className="w-full max-w-3xl text-center flex flex-col items-center">
          {/* Kicker */}
          <span className="font-serif italic text-sm md:text-base tracking-[0.25em] uppercase text-[#B08B40] mb-6">
            — Our Story
          </span>

          {/* Title */}
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#6E5525] leading-tight font-light mb-10 tracking-wide uppercase">
            Handwoven Heritage
          </h2>

          {/* Brand Philosophy */}
          <p className="font-sans text-base md:text-lg text-stone-600 leading-relaxed max-w-2xl mb-14">
            Born from the rich weaving traditions of India, <span className="font-semibold text-[#6E5525]">LakshKriti</span> brings together master weavers and contemporary minimalist design. Each garment is meticulously handcrafted, preserving generations of heirloom artistry in pure, quiet luxury.
          </p>

          {/* Pillars Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 text-left border-t border-stone-200/60 pt-12">
            <div>
              <span className="font-serif text-sm md:text-base tracking-widest uppercase text-[#B08B40] font-semibold block mb-3">
                01 / Loom Craft
              </span>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Supporting family-run artisan looms to preserve authentic heritage weaving.
              </p>
            </div>
            <div>
              <span className="font-serif text-sm md:text-base tracking-widest uppercase text-[#B08B40] font-semibold block mb-3">
                02 / Pure Material
              </span>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Crafted in handspun silk, raw cotton, and premium threads.
              </p>
            </div>
            <div>
              <span className="font-serif text-sm md:text-base tracking-widest uppercase text-[#B08B40] font-semibold block mb-3">
                03 / Quiet Luxury
              </span>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Timeless aesthetic and precise details tailored for the modern connoisseur.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
