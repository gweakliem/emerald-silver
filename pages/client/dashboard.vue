<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">Client Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">{{ user?.user?.name }}</span>
            <button
              @click="logout"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Your Worksheets</h2>
        
        <!-- Error Message -->
        <div v-if="error" class="mb-6">
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
        
        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-gray-500">Loading worksheets...</p>
        </div>

        <div v-else-if="worksheets.length === 0" class="text-center py-8">
          <div class="text-gray-400">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No worksheets assigned</h3>
          <p class="mt-1 text-sm text-gray-500">Your provider hasn't assigned any worksheets yet.</p>
        </div>

        <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="worksheet in worksheets" :key="worksheet.id">
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900">
                      {{ worksheet.title }}
                    </h3>
                    <p v-if="worksheet.description" class="text-sm text-gray-500 mt-1">
                      {{ worksheet.description }}
                    </p>
                    <div class="mt-2 flex items-center text-xs text-gray-500">
                      <span v-if="worksheet.dueDate">Due: {{ formatDate(worksheet.dueDate) }}</span>
                      <span v-else>No due date</span>
                      <span class="mx-2">•</span>
                      <span :class="getStatusColor(worksheet.status)">
                        {{ getStatusText(worksheet.status) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-shrink-0 flex space-x-2">
                    <button
                      v-if="worksheet.status === 'pending' || worksheet.status === 'overdue' || worksheet.status === 'in_progress'"
                      @click="completeWorksheet(worksheet)"
                      :disabled="isCompleting === worksheet.id"
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isCompleting === worksheet.id" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ isCompleting === worksheet.id ? 'Completing...' : 'Mark Complete' }}
                    </button>
                    <span
                      v-else-if="worksheet.status === 'completed'"
                      class="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-green-600"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Completed
                    </span>
                    
                    <!-- View/Open worksheet link -->
                    <button
                      v-if="worksheet.type === 'pdf' && worksheet.pdfUrl"
                      @click="openWorksheet(worksheet.pdfUrl)"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="View PDF"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button
                      v-else-if="worksheet.type === 'google_forms' && worksheet.googleFormsUrl"
                      @click="openWorksheet(worksheet.googleFormsUrl)"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Open Form"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No explicit middleware needed - auth.global.ts handles route protection

const { data: user, error: userError } = await useFetch('/api/auth/me')

if (!user.value?.user || user.value.user.role !== 'client') {
  throw createError({
    statusCode: 403,
    statusMessage: 'Access denied'
  })
}

const worksheets = ref([])
const isLoading = ref(true)
const error = ref('')
const isCompleting = ref(null) // Track which worksheet is being completed

// Load assigned worksheets
onMounted(async () => {
  await loadWorksheets()
})

async function loadWorksheets() {
  try {
    isLoading.value = true
    error.value = ''
    
    const response = await $fetch('/api/client/worksheets')
    
    if (response.success) {
      worksheets.value = response.worksheets
    }
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      await navigateTo('/client/login')
    } else {
      error.value = 'Failed to load worksheets'
      console.error('Load worksheets error:', err)
    }
  } finally {
    isLoading.value = false
  }
}

function formatDate(date) {
  if (!date) return 'No due date'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'text-yellow-600'
    case 'in_progress':
      return 'text-blue-600'
    case 'completed':
      return 'text-green-600'
    case 'overdue':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Not Started'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'overdue':
      return 'Overdue'
    default:
      return 'Unknown'
  }
}

async function completeWorksheet(worksheet) {
  try {
    isCompleting.value = worksheet.id
    
    const response = await $fetch(`/api/client/worksheets/${worksheet.id}/complete`, {
      method: 'POST'
    })
    
    if (response.success) {
      // Update the worksheet status in the local state
      const worksheetIndex = worksheets.value.findIndex(w => w.id === worksheet.id)
      if (worksheetIndex !== -1) {
        worksheets.value[worksheetIndex].status = 'completed'
        worksheets.value[worksheetIndex].completedAt = response.worksheet.completedAt
      }
      
      // Show success message (you could add a toast notification here)
      console.log('Worksheet completed successfully')
    }
  } catch (err) {
    console.error('Complete worksheet error:', err)
    error.value = err.data?.message || 'Failed to complete worksheet'
    
    // Clear error after 5 seconds
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    isCompleting.value = null
  }
}

function openWorksheet(url) {
  window.open(url, '_blank')
}

async function logout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/client/login')
  } catch (error) {
    console.error('Logout error:', error)
    await navigateTo('/client/login')
  }
}
</script>