import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#1F1A16' }}>
        <h1>404 — Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/" style={{ color: '#B08B40', textDecoration: 'underline' }}>Go Home</a>
      </div>
    ),
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
