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
              Worksheet Reviews
            </h1>
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

      <!-- Reviews List -->
      <div v-else class="px-4 sm:px-0">
        <!-- Empty State -->
        <div v-if="reviews.length === 0" class="text-center bg-white shadow rounded-lg py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No worksheets to review</h3>
          <p class="mt-2 text-sm text-gray-500">
            Completed worksheets will appear here for your review.
          </p>
        </div>

        <!-- Reviews List -->
        <div v-else class="space-y-6">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="bg-white shadow rounded-lg overflow-hidden"
          >
            <div class="p-6">
              <!-- Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ review.title }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    Client: <span class="font-medium">{{ review.clientName }}</span>
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                  <button
                    v-if="review.type === 'pdf' && review.pdfUrl"
                    @click="openWorksheet(review.pdfUrl)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="View PDF"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View PDF
                  </button>
                  <button
                    v-else-if="review.type === 'google_forms' && review.googleFormsUrl"
                    @click="openWorksheet(review.googleFormsUrl)"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Open Form"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    View Form
                  </button>
                </div>
              </div>

              <!-- Description -->
              <p v-if="review.description" class="text-sm text-gray-600 mb-4">
                {{ review.description }}
              </p>

              <!-- Completion Info -->
              <div class="flex items-center text-xs text-gray-500 mb-4">
                <span>Assigned: {{ formatDate(review.assignedAt) }}</span>
                <span class="mx-2">•</span>
                <span>Completed: {{ formatDate(review.completedAt) }}</span>
                <span v-if="review.dueDate" class="mx-2">•</span>
                <span v-if="review.dueDate">Due: {{ formatDate(review.dueDate) }}</span>
              </div>

              <!-- Existing Notes -->
              <div v-if="review.providerNotes" class="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 class="text-sm font-medium text-gray-900 mb-1">Previous Notes:</h4>
                <p class="text-sm text-gray-700">{{ review.providerNotes }}</p>
              </div>

              <!-- Review Form -->
              <div v-if="!isReviewing[review.id]" class="border-t pt-4">
                <div class="flex justify-end space-x-3">
                  <button
                    @click="startReview(review.id)"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Review
                  </button>
                </div>
              </div>

              <!-- Active Review Form -->
              <div v-else class="border-t pt-4">
                <div class="space-y-4">
                  <div>
                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes (Optional)
                    </label>
                    <textarea
                      v-model="reviewForms[review.id].notes"
                      rows="3"
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Add notes about this worksheet submission..."
                    ></textarea>
                  </div>

                  <div class="flex justify-end space-x-3">
                    <button
                      @click="cancelReview(review.id)"
                      :disabled="isSubmitting[review.id]"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      @click="submitReview(review.id, 'request_revision')"
                      :disabled="isSubmitting[review.id]"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                    >
                      <svg v-if="isSubmitting[review.id] === 'request_revision'" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Request Revision
                    </button>
                    <button
                      @click="submitReview(review.id, 'approve')"
                      :disabled="isSubmitting[review.id]"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <svg v-if="isSubmitting[review.id] === 'approve'" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const reviews = ref([])
const isLoading = ref(true)
const error = ref('')
const isReviewing = ref({})
const reviewForms = ref({})
const isSubmitting = ref({})

// Load reviews on mount
onMounted(async () => {
  await loadReviews()
})

async function loadReviews() {
  try {
    isLoading.value = true
    error.value = ''
    
    const response = await $fetch('/api/provider/worksheet-reviews')
    
    if (response.success) {
      reviews.value = response.reviews
    }
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      await navigateTo('/provider/login')
    } else {
      error.value = 'Failed to load worksheet reviews'
      console.error('Load reviews error:', err)
    }
  } finally {
    isLoading.value = false
  }
}

function startReview(reviewId) {
  isReviewing.value[reviewId] = true
  reviewForms.value[reviewId] = { notes: '' }
}

function cancelReview(reviewId) {
  isReviewing.value[reviewId] = false
  delete reviewForms.value[reviewId]
}

async function submitReview(reviewId, action) {
  try {
    isSubmitting.value[reviewId] = action
    
    const response = await $fetch(`/api/provider/worksheet-reviews/${reviewId}`, {
      method: 'POST',
      body: {
        notes: reviewForms.value[reviewId]?.notes || '',
        action
      }
    })
    
    if (response.success) {
      // Remove from reviews list since it's no longer pending
      reviews.value = reviews.value.filter(r => r.id !== reviewId)
      
      // Clean up form state
      isReviewing.value[reviewId] = false
      delete reviewForms.value[reviewId]
      
      console.log(`Worksheet ${action === 'approve' ? 'approved' : 'sent for revision'}`)
    }
  } catch (err) {
    console.error('Submit review error:', err)
    error.value = err.data?.message || 'Failed to submit review'
    
    // Clear error after 5 seconds
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    delete isSubmitting.value[reviewId]
  }
}

function openWorksheet(url) {
  window.open(url, '_blank')
}

function formatDate(dateString) {
  if (!dateString) return 'No date'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}
</script>