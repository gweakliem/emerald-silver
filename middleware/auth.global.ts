export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth for login pages, API routes, and home page
  const publicPages = ['/admin/login', '/admin/verify', '/provider/login', '/provider/verify', '/client/login', '/client/verify', '/']
  const isPublicPage = publicPages.some(page => to.path === page)
  
  if (isPublicPage || to.path.startsWith('/api/')) {
    return
  }

  // Check if route requires admin authentication
  if (to.path.startsWith('/admin')) {
    try {
      const response = await $fetch('/api/auth/me')
      
      if (!response?.user || response.user.role !== 'admin') {
        return navigateTo('/admin/login')
      }
    } catch {
      return navigateTo('/admin/login')
    }
  }

  // Check if route requires provider authentication
  if (to.path.startsWith('/provider')) {
    try {
      const response = await $fetch('/api/auth/me')
      
      if (!response?.user || response.user.role !== 'provider') {
        return navigateTo('/provider/login')
      }
    } catch {
      return navigateTo('/provider/login')
    }
  }

  // Check if route requires client authentication
  if (to.path.startsWith('/client')) {
    try {
      const response = await $fetch('/api/auth/me')
      
      if (!response?.user || response.user.role !== 'client') {
        return navigateTo('/client/login')
      }
    } catch {
      return navigateTo('/client/login')
    }
  }
})