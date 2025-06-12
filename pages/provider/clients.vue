<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/provider/dashboard" 
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </NuxtLink>
            <h1 class="text-xl font-semibold text-gray-900">
              My Clients
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="showAddClientModal = true"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Client
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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

      <!-- Loading State -->
      <div v-if="isLoading" class="px-4 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                <div class="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="clients.length === 0" class="px-4 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M34 40h10v-4a8 8 0 00-10.41-7.64m0 0A8 8 0 018 32v4h10m12 4v-8a8 8 0 00-8-8H20a8 8 0 00-8 8v8m8-12a4 4 0 110-8 4 4 0 010 8zm8-4a4 4 0 110-8 4 4 0 010 8z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No clients</h3>
            <p class="mt-1 text-sm text-gray-500">
              Get started by adding your first client.
            </p>
            <div class="mt-6">
              <button
                @click="showAddClientModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add your first client
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Clients List -->
      <div v-else class="px-4 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="client in clients" :key="client.id">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ client.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="flex items-center">
                        <p class="text-sm font-medium text-gray-900">
                          {{ client.name }}
                        </p>
                        <span 
                          v-if="!client.isActive"
                          class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          Inactive
                        </span>
                      </div>
                      <div class="mt-1 flex items-center text-sm text-gray-500">
                        <div v-if="client.email" class="flex items-center">
                          <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <span>{{ client.email }}</span>
                        </div>
                        <div v-if="client.phone" :class="{ 'ml-4': client.email }" class="flex items-center">
                          <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          <span>{{ client.phone }}</span>
                        </div>
                      </div>
                      <div v-if="client.notes" class="mt-1">
                        <p class="text-sm text-gray-600">{{ client.notes }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <p class="text-sm text-gray-500">
                      Added {{ formatDate(client.createdAt) }}
                    </p>
                    <div class="flex space-x-1">
                      <button
                        @click="editClient(client)"
                        class="text-gray-400 hover:text-gray-600"
                        title="Edit client"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        @click="toggleClientStatus(client)"
                        :class="client.isActive ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'"
                        :title="client.isActive ? 'Deactivate client' : 'Activate client'"
                      >
                        <svg v-if="client.isActive" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <!-- Add Client Modal -->
    <ProviderAddClientModal 
      :is-open="showAddClientModal"
      @close="showAddClientModal = false"
      @created="handleClientCreated"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const clients = ref([])
const isLoading = ref(true)
const error = ref('')
const showAddClientModal = ref(false)

// Load clients
onMounted(async () => {
  await loadClients()
})

async function loadClients() {
  try {
    isLoading.value = true
    error.value = ''
    
    const response = await $fetch('/api/provider/clients')
    clients.value = response.clients
    
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      await navigateTo('/provider/login')
    } else {
      error.value = 'Failed to load clients'
      console.error('Clients load error:', err)
    }
  } finally {
    isLoading.value = false
  }
}

function handleClientCreated(newClient) {
  // Add the new client to the list
  clients.value.unshift(newClient)
  showAddClientModal.value = false
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function editClient(client) {
  // TODO: Implement edit client functionality
  console.log('Edit client:', client.id)
}

async function toggleClientStatus(client) {
  try {
    // TODO: Implement client status toggle API call
    client.isActive = !client.isActive
    console.log('Toggle client status:', client.id, client.isActive)
  } catch (err) {
    console.error('Failed to toggle client status:', err)
    // Revert the change
    client.isActive = !client.isActive
  }
}
</script>