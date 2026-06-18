import { createFileRoute } from '@tanstack/react-router'
import crypto from 'crypto'

export const Route = createFileRoute('/api/checkout/verify-payment')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }

          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

          if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return new Response(
              JSON.stringify({ error: 'Missing required Razorpay payment fields' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const secret = 
            import.meta.env.RAZORPAY_KEY_SECRET || 
            (globalThis as any).RAZORPAY_KEY_SECRET || 
            (globalThis as any).process?.env?.RAZORPAY_KEY_SECRET || 
            ''

          if (!secret) {
            throw new Error('Razorpay API Key Secret is missing from environment variables')
          }

          const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

          const isValid = expectedSignature === razorpay_signature

          if (isValid) {
            return new Response(
              JSON.stringify({ success: true, message: 'Payment verified successfully' }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          } else {
            return new Response(
              JSON.stringify({ success: false, error: 'Invalid signature verification failed' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }
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
