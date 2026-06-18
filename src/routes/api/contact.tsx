import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const { name, email, message } = body

          if (!name || !email || !message) {
            return Response.json(
              { detail: 'Name, email, and message are required.' },
              { status: 400 }
            )
          }

          const token = process.env.GOOGLE_SCRIPT_TOKEN || ''
          if (!token) {
            console.error('GOOGLE_SCRIPT_TOKEN is missing in environment variables.')
            return Response.json(
              { detail: 'Server configuration error.' },
              { status: 500 }
            )
          }

          const targetUrl = `https://script.google.com/macros/s/${token}/exec`
          const payload = JSON.stringify({
            name,
            email,
            message,
            date: new Date().toLocaleDateString('en-IN'),
          })
          const postHeaders = { 'Content-Type': 'application/json' }

          // Step 1: POST with redirect:manual — Google Apps Script returns a 302
          // redirect. Following it automatically changes POST→GET and drops the body.
          const first = await fetch(targetUrl, {
            method: 'POST',
            headers: postHeaders,
            body: payload,
            redirect: 'manual',
          })

          // Step 2: Re-POST to the redirected Location URL with the original body
          if (first.status === 302 || first.status === 301) {
            const location = first.headers.get('location')
            if (location) {
              await fetch(location, {
                method: 'POST',
                headers: postHeaders,
                body: payload,
                redirect: 'follow',
              })
            }
          }

          return Response.json({ success: true }, { status: 200 })
        } catch (err: any) {
          console.error('Contact Form API Error:', err)
          return Response.json(
            { detail: err.message || 'Failed to submit contact form.' },
            { status: 500 }
          )
        }
      },
    },
  },
})
