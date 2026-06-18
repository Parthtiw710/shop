import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/address/autocomplete')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url)
          const query = url.searchParams.get('query') || ''

          if (!query || query.length < 3) {
            return Response.json([], { status: 200 })
          }

          // Nominatim OpenStreetMap API (Requires User-Agent)
          const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`

          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'LakshKriti-ECommerce-App/1.0',
            },
          })

          if (!response.ok) {
            throw new Error(`Nominatim API returned status ${response.status}`)
          }

          const data = await response.json()

          // Map to a clean, simplified response
          const results = data.map((item: any) => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
          }))

          return Response.json(results, {
            status: 200,
            headers: {
              // Cache results for 1 hour to prevent excessive external requests
              'Cache-Control': 'public, max-age=3600',
            },
          })
        } catch (err: any) {
          console.error('Autocomplete Error:', err)
          return Response.json(
            { detail: err.message || 'Failed to autocomplete address' },
            { status: 500 }
          )
        }
      },
    },
  },
})
