export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth for login pages, API routes, and home page
  const publicPages = ['/admin/login', '/admin/verify', '/', '/therapist']
  const isPublicPage = publicPages.some(page => to.path === page || to.path.startsWith(page + '/'))
  
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
})