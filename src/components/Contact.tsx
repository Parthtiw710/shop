import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const SCRIPT_URL = `https://script.google.com/macros/s/${import.meta.env.VITE_GOOGLE_SCRIPT_TOKEN}/exec`

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return

    setStatus('submitting')

    try {
      // text/plain is a CORS "simple request" — no preflight OPTIONS triggered.
      // redirect:'follow' is essential — Apps Script redirects to script.googleusercontent.com
      // Body is JSON string — Apps Script reads via JSON.parse(e.postData.contents)
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name, email, message }),
        redirect: 'follow',
      })

      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error('Contact form error:', err)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="w-full bg-[#FCFAF2] text-[#211F1D] py-28 px-6 md:px-12 flex flex-col items-center select-none border-t border-[#E6DFD5]/40">
      <div className="w-full max-w-xl text-center flex flex-col items-center">

        {/* Kicker */}
        <span className="font-serif italic text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.25em] uppercase text-[#B08B40] mb-6 whitespace-nowrap">
          — Connect With Us
        </span>

        {/* Title */}
        <h2 className="font-serif text-4xl md:text-5xl text-[#6E5525] leading-tight font-light mb-4 tracking-wide uppercase">
          Inquire
        </h2>

        <p className="font-sans text-sm text-stone-500 leading-relaxed max-w-md mb-12">
          For custom handloom commissions, bridal consultations, or styling queries, reach out using the form below.
        </p>

        {status === 'success' ? (
          <div className="w-full bg-[#F5EDD8]/50 border border-[#B08B40]/30 rounded-2xl p-8 text-center">
            <span className="font-serif italic text-lg text-[#6B4F1A] font-semibold block mb-2">
              Message Sent
            </span>
            <p className="font-sans text-sm text-stone-600 leading-relaxed">
              Thank you for reaching out. A LakshKriti curator will contact you via email shortly.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 font-serif text-xs tracking-widest uppercase font-semibold text-[#B08B40] hover:text-[#96722D] transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 text-left">

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="font-sans text-xs tracking-widest uppercase font-bold text-stone-600">
                Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === 'submitting'}
                className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-xl px-4 py-3.5 text-sm font-sans focus:outline-none focus:border-[#B08B40] transition-colors disabled:opacity-50"
                placeholder="e.g. Arundhati Devi"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="font-sans text-xs tracking-widest uppercase font-bold text-stone-600">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'submitting'}
                className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-xl px-4 py-3.5 text-sm font-sans focus:outline-none focus:border-[#B08B40] transition-colors disabled:opacity-50"
                placeholder="e.g. arundhati@example.com"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="font-sans text-xs tracking-widest uppercase font-bold text-stone-600">
                Your Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === 'submitting'}
                className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-xl px-4 py-3.5 text-sm font-sans focus:outline-none focus:border-[#B08B40] transition-colors resize-none disabled:opacity-50"
                placeholder="Describe your design customisation details or question..."
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-600 font-sans leading-relaxed">
                Could not connect. Please check your connection and try again.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full mt-2 py-4 bg-[#B08B40] hover:bg-[#96722D] text-[#FDFBF7] font-semibold text-xs tracking-[0.2em] uppercase rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Inquiry...
                </>
              ) : (
                'Submit Inquiry'
              )}
            </button>

          </form>
        )}

      </div>
    </section>
  )
}
