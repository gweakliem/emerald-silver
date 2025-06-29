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
                      <span>Due: {{ formatDate(worksheet.dueDate) }}</span>
                      <span class="mx-2">•</span>
                      <span :class="getStatusColor(worksheet.status)">
                        {{ getStatusText(worksheet.status) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-shrink-0">
                    <button
                      v-if="worksheet.status === 'pending'"
                      @click="startWorksheet(worksheet.id)"
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start
                    </button>
                    <button
                      v-else-if="worksheet.status === 'in_progress'"
                      @click="continueWorksheet(worksheet.id)"
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Continue
                    </button>
                    <span
                      v-else
                      class="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-gray-500"
                    >
                      Completed
                    </span>
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

// Mock data for now - will be replaced with real API call
onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    worksheets.value = [
      {
        id: '1',
        title: 'Initial Assessment',
        description: 'Complete your initial assessment questionnaire',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'pending'
      },
      {
        id: '2',
        title: 'Weekly Check-in',
        description: 'Complete your weekly progress check-in',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'in_progress'
      }
    ]
    isLoading.value = false
  }, 1000)
})

function formatDate(date) {
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
    default:
      return 'Unknown'
  }
}

function startWorksheet(worksheetId) {
  navigateTo(`/client/worksheet/${worksheetId}`)
}

function continueWorksheet(worksheetId) {
  navigateTo(`/client/worksheet/${worksheetId}`)
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