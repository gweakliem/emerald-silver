<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/provider/dashboard"
              class="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Dashboard
            </NuxtLink>
            <h1 class="text-xl font-semibold text-gray-900">
              My Worksheets
            </h1>
          </div>
          
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Worksheet
          </button>
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
          <div class="p-6">
            <div class="animate-pulse space-y-4">
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                <div class="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Worksheets List -->
      <div v-else class="px-4 sm:px-0">
        <!-- Empty State -->
        <div v-if="worksheets.length === 0" class="text-center bg-white shadow rounded-lg py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No worksheets yet</h3>
          <p class="mt-2 text-sm text-gray-500">
            Get started by creating your first worksheet template.
          </p>
          <div class="mt-6">
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Your First Worksheet
            </button>
          </div>
        </div>

        <!-- Worksheets Grid -->
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="worksheet in worksheets"
            :key="worksheet.id"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div v-if="worksheet.type === 'pdf'" class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div v-else class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <span class="ml-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {{ worksheet.type === 'pdf' ? 'PDF' : 'Google Forms' }}
                  </span>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="viewWorksheet(worksheet)"
                    class="text-gray-400 hover:text-gray-600"
                    title="View"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button
                    @click="assignWorksheet(worksheet)"
                    class="text-gray-400 hover:text-blue-600"
                    title="Assign to Client"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </button>
                  <button
                    @click="deleteWorksheet(worksheet)"
                    class="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ worksheet.title }}
              </h3>
              
              <p v-if="worksheet.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
                {{ worksheet.description }}
              </p>
              
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Created {{ formatDate(worksheet.createdAt) }}</span>
                <a
                  v-if="worksheet.type === 'pdf' && worksheet.pdfUrl"
                  :href="worksheet.pdfUrl"
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View PDF
                </a>
                <a
                  v-else-if="worksheet.type === 'google_forms' && worksheet.googleFormsUrl"
                  :href="worksheet.googleFormsUrl"
                  target="_blank"
                  class="text-green-600 hover:text-green-800 font-medium"
                >
                  Open Form
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Worksheet Modal -->
    <ProviderCreateWorksheetModal 
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleWorksheetCreated"
    />

    <!-- Assign Worksheet Modal -->
    <ProviderAssignWorksheetModal 
      :is-open="showAssignModal"
      :worksheet="selectedWorksheet"
      @close="closeAssignModal"
      @assigned="handleWorksheetAssigned"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const worksheets = ref([])
const isLoading = ref(true)
const error = ref('')
const showCreateModal = ref(false)
const showAssignModal = ref(false)
const selectedWorksheet = ref(null)

// Load worksheets on mount
onMounted(async () => {
  await loadWorksheets()
})

async function loadWorksheets() {
  try {
    isLoading.value = true
    error.value = ''
    
    const response = await $fetch('/api/provider/worksheet-templates')
    
    if (response.success) {
      worksheets.value = response.templates
    }
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      await navigateTo('/provider/login')
    } else {
      error.value = 'Failed to load worksheets'
      console.error('Load worksheets error:', err)
    }
  } finally {
    isLoading.value = false
  }
}

function handleWorksheetCreated(worksheet) {
  // Add the new worksheet to the list
  worksheets.value.unshift(worksheet)
  showCreateModal.value = false
}

function viewWorksheet(worksheet) {
  if (worksheet.type === 'pdf' && worksheet.pdfUrl) {
    window.open(worksheet.pdfUrl, '_blank')
  } else if (worksheet.type === 'google_forms' && worksheet.googleFormsUrl) {
    window.open(worksheet.googleFormsUrl, '_blank')
  }
}

function assignWorksheet(worksheet) {
  selectedWorksheet.value = worksheet
  showAssignModal.value = true
}

function closeAssignModal() {
  showAssignModal.value = false
  selectedWorksheet.value = null
}

function handleWorksheetAssigned() {
  closeAssignModal()
}

async function deleteWorksheet(worksheet) {
  if (!confirm(`Are you sure you want to delete "${worksheet.title}"? This action cannot be undone.`)) {
    return
  }

  try {
    const response = await $fetch(`/api/provider/worksheet-templates/${worksheet.id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      // Remove the worksheet from the list
      worksheets.value = worksheets.value.filter(w => w.id !== worksheet.id)
    }
  } catch (err) {
    if (err.status === 409) {
      error.value = 'Cannot delete worksheet with active assignments'
    } else if (err.status === 404) {
      error.value = 'Worksheet not found'
    } else {
      error.value = 'Failed to delete worksheet'
    }
    console.error('Delete worksheet error:', err)
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>