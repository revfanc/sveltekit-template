import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  // Health check endpoint
  if (event.url.pathname === '/health') {
    return new Response('OK', { status: 200 })
  }

  return resolve(event)
}
