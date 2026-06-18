import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout/create-order')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { amount: number; currency?: string }
          const amount = body.amount
          const currency = body.currency || 'INR'

          const keyId = 
            import.meta.env.VITE_RAZORPAY_KEY_ID || 
            (globalThis as any).VITE_RAZORPAY_KEY_ID || 
            (globalThis as any).process?.env?.VITE_RAZORPAY_KEY_ID || 
            ''
          const keySecret = 
            import.meta.env.RAZORPAY_KEY_SECRET || 
            (globalThis as any).RAZORPAY_KEY_SECRET || 
            (globalThis as any).process?.env?.RAZORPAY_KEY_SECRET || 
            ''

          if (!keyId || !keySecret) {
            throw new Error('Razorpay API keys are missing from environment variables (.env)')
          }

          // Authorization header using base64 encoding of key_id:key_secret
          const authHeader = 'Basic ' + btoa(`${keyId}:${keySecret}`)

          const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount, // in paise
              currency,
              receipt: `receipt_${Date.now()}`,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error((data as any)?.error?.description || 'Failed to create Razorpay order')
          }

          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },
    },
  },
})
