<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              Provider Dashboard
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {{ user?.name?.charAt(0) || 'P' }}
                </span>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">{{ user?.name || 'Provider' }}</p>
                <p class="text-xs text-gray-500">{{ user?.email }}</p>
              </div>
            </div>
            
            <button
              @click="logout"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Welcome Section -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">
              Welcome back, {{ user?.name || 'Provider' }}!
            </h2>
            <p class="text-sm text-gray-600">
              Manage your clients and worksheets from this dashboard.
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="px-4 sm:px-0 mb-6">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="px-4 sm:px-0">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Total Clients -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      My Clients
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      <span v-if="isLoading" class="animate-pulse bg-gray-200 rounded h-6 w-8 inline-block"></span>
                      <span v-else>{{ stats.totalClients }}</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Worksheets -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Active Worksheets
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      <span v-if="isLoading" class="animate-pulse bg-gray-200 rounded h-6 w-8 inline-block"></span>
                      <span v-else>{{ stats.activeWorksheets }}</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Reviews -->
          <NuxtLink 
            to="/provider/reviews"
            class="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Pending Reviews
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      <span v-if="isLoading" class="animate-pulse bg-gray-200 rounded h-6 w-8 inline-block"></span>
                      <span v-else>{{ stats.pendingReviews }}</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 px-4 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <button 
                @click="showAddClientModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Client
              </button>
              
              <button 
                @click="showCreateWorksheetModal = true"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Create Worksheet
              </button>
              
              <NuxtLink 
                to="/provider/worksheets"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                View Worksheets
              </NuxtLink>
              
              <NuxtLink 
                to="/provider/reviews"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                Review Worksheets
              </NuxtLink>
              
              <NuxtLink 
                to="/provider/clients"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                View Clients
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Client Modal -->
    <ProviderAddClientModal 
      :is-open="showAddClientModal"
      @close="showAddClientModal = false"
      @created="handleClientCreated"
    />

    <!-- Create Worksheet Modal -->
    <ProviderCreateWorksheetModal 
      :is-open="showCreateWorksheetModal"
      @close="showCreateWorksheetModal = false"
      @created="handleWorksheetCreated"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const user = ref(null)
const stats = ref({
  totalClients: 0,
  activeWorksheets: 0,
  pendingReviews: 0,
  recentActivity: 0
})
const isLoading = ref(true)
const error = ref('')
const showAddClientModal = ref(false)
const showCreateWorksheetModal = ref(false)

// Load user data and stats
onMounted(async () => {
  try {
    const [userResponse, statsResponse] = await Promise.all([
      $fetch('/api/auth/me'),
      $fetch('/api/provider/stats')
    ])
    
    user.value = userResponse.user
    stats.value = statsResponse.stats
    
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      await navigateTo('/provider/login')
    } else {
      error.value = 'Failed to load dashboard data'
      console.error('Dashboard error:', err)
    }
  } finally {
    isLoading.value = false
  }
})

async function logout() {
  try {
    await $fetch('/api/provider/logout', { method: 'POST' })
    await navigateTo('/provider/login')
  } catch (error) {
    console.error('Logout failed:', error)
    // Force redirect even if API call fails
    await navigateTo('/provider/login')
  }
}

function handleClientCreated(client) {
  // Refresh stats to reflect the new client
  stats.value.totalClients += 1
  showAddClientModal.value = false
}

function handleWorksheetCreated(worksheet) {
  // Refresh stats to reflect the new worksheet
  stats.value.activeWorksheets += 1
  showCreateWorksheetModal.value = false
}
</script>