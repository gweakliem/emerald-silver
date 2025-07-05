<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/provider/clients" 
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </NuxtLink>
            <h1 class="text-xl font-semibold text-gray-900">
              {{ client?.name || 'Client Details' }} (ID: {{ clientId }})
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="showAssignWorksheetModal = true"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Assign Worksheet
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
            <p>Loading client data for ID: {{ clientId }}</p>
          </div>
        </div>
      </div>

      <!-- Client Details -->
      <div v-else-if="client" class="px-4 sm:px-0">
        <!-- Client Info Card -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <span class="text-xl font-medium text-white">
                    {{ client.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
              <div class="ml-6">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ client.name }}
                  <span 
                    v-if="!client.isActive"
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    Inactive
                  </span>
                </h3>
                <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <div v-if="client.email" class="flex items-center">
                    <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>{{ client.email }}</span>
                  </div>
                  <div v-if="client.phone" class="flex items-center">
                    <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>{{ client.phone }}</span>
                  </div>
                </div>
                <div v-if="client.notes" class="mt-2">
                  <p class="text-sm text-gray-600">{{ client.notes }}</p>
                </div>
                <div class="mt-2 text-xs text-gray-500">
                  Added {{ formatDate(client.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Assigned Worksheets -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900">
                Assigned Worksheets
              </h3>
              <button
                @click="showAssignWorksheetModal = true"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Assign Worksheet
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="worksheets.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No worksheets assigned</h3>
              <p class="mt-1 text-sm text-gray-500">
                This client doesn't have any worksheets assigned yet.
              </p>
              <div class="mt-6">
                <button
                  @click="showAssignWorksheetModal = true"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Assign first worksheet
                </button>
              </div>
            </div>

            <!-- Worksheets List -->
            <div v-else class="space-y-4">
              <div 
                v-for="worksheet in worksheets" 
                :key="worksheet.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">
                      {{ worksheet.template.title }}
                    </h4>
                    <p v-if="worksheet.template.description" class="mt-1 text-sm text-gray-600">
                      {{ worksheet.template.description }}
                    </p>
                    <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div class="flex items-center">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              :class="getStatusClass(worksheet.status)">
                          {{ worksheet.status }}
                        </span>
                      </div>
                      <div v-if="worksheet.dueDate" class="flex items-center">
                        <svg class="flex-shrink-0 mr-1 h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Due {{ formatDate(worksheet.dueDate) }}</span>
                      </div>
                      <div class="flex items-center">
                        <svg class="flex-shrink-0 mr-1 h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Assigned {{ formatDate(worksheet.assignedAt) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ worksheet.template.type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Assign Worksheet Modal -->
    <ProviderAssignWorksheetModal 
      :is-open="showAssignWorksheetModal"
      :client="client"
      @close="showAssignWorksheetModal = false"
      @assigned="handleWorksheetAssigned"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const route = useRoute()
const clientId = route.params.id


const client = ref(null)
const worksheets = ref([])
const isLoading = ref(true)
const error = ref('')
const showAssignWorksheetModal = ref(false)

// Load client data and worksheets
onMounted(async () => {
  await loadClientData()
})

async function loadClientData() {
  try {
    isLoading.value = true
    error.value = ''
    
    const [clientResponse, worksheetsResponse] = await Promise.all([
      $fetch(`/api/provider/clients/${clientId}`),
      $fetch(`/api/provider/clients/${clientId}/worksheets`)
    ])
    
    client.value = clientResponse.client
    worksheets.value = worksheetsResponse.worksheets
    
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      await navigateTo('/provider/login')
    } else if (err.status === 404) {
      error.value = 'Client not found'
    } else {
      error.value = 'Failed to load client data'
      console.error('Client load error:', err)
    }
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function handleWorksheetAssigned(worksheet) {
  // Add the new worksheet to the list
  worksheets.value.unshift(worksheet)
  showAssignWorksheetModal.value = false
}
</script>