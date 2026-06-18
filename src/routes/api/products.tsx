import { createFileRoute } from '@tanstack/react-router'
import { supabaseServer } from '../../lib/supabaseServer'

export const Route = createFileRoute('/api/products')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabaseServer
            .from('products')
            .select('*')

          if (error) throw error

          return Response.json(data || [], { status: 200 })
        } catch (err: any) {
          return Response.json(
            { detail: err.message || 'Failed to fetch products from database' },
            { status: 400 }
          )
        }
      },
    },
  },
})
