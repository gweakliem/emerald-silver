<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="close"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
        <!-- Header -->
        <div class="bg-white px-6 pt-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              Assign Worksheet
            </h3>
            <button
              @click="close"
              class="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div v-if="client" class="mt-2">
            <p class="text-sm text-gray-600">
              Assign a worksheet to <strong>{{ client.name }}</strong>
            </p>
          </div>
        </div>

        <!-- Success State -->
        <div v-if="showSuccess" class="px-6 py-4">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Worksheet Assigned Successfully!</h3>
            <p class="mt-2 text-sm text-gray-600">
              "{{ assignedWorksheet?.template?.title }}" has been assigned to {{ client?.name }}.
            </p>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="close"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="submitForm" class="px-6 py-4">
          <div class="space-y-4">
            <!-- Worksheet Selection -->
            <div>
              <label for="worksheet" class="block text-sm font-medium text-gray-700">
                Select Worksheet *
              </label>
              <select
                id="worksheet"
                v-model="form.templateId"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.templateId }"
                :disabled="isLoading || isLoadingTemplates"
              >
                <option value="">Select a worksheet...</option>
                <option 
                  v-for="template in worksheetTemplates" 
                  :key="template.id" 
                  :value="template.id"
                >
                  {{ template.title }} ({{ template.type }})
                </option>
              </select>
              <p v-if="errors.templateId" class="mt-1 text-sm text-red-600">{{ errors.templateId }}</p>
              <p v-if="isLoadingTemplates" class="mt-1 text-sm text-gray-500">Loading worksheets...</p>
            </div>

            <!-- Due Date -->
            <div>
              <label for="due-date" class="block text-sm font-medium text-gray-700">
                Due Date (Optional)
              </label>
              <input
                id="due-date"
                v-model="form.dueDate"
                type="datetime-local"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :disabled="isLoading"
              />
              <p class="mt-1 text-xs text-gray-500">
                Set a due date for this worksheet assignment
              </p>
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Add any notes about this assignment..."
                :disabled="isLoading"
              ></textarea>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="close"
              :disabled="isLoading"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Assigning...
              </span>
              <span v-else>Assign Worksheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  client: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'assigned'])

const form = ref({
  templateId: '',
  dueDate: '',
  notes: ''
})

const errors = ref({})
const error = ref('')
const isLoading = ref(false)
const showSuccess = ref(false)
const assignedWorksheet = ref(null)

const worksheetTemplates = ref([])
const isLoadingTemplates = ref(false)

const isFormValid = computed(() => {
  return form.value.templateId && !Object.keys(errors.value).length
})

// Load worksheet templates when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await loadWorksheetTemplates()
  }
})

async function loadWorksheetTemplates() {
  try {
    isLoadingTemplates.value = true
    const response = await $fetch('/api/provider/worksheet-templates')
    worksheetTemplates.value = response.templates
  } catch (err) {
    console.error('Failed to load worksheet templates:', err)
    error.value = 'Failed to load available worksheets'
  } finally {
    isLoadingTemplates.value = false
  }
}

function validateForm() {
  errors.value = {}

  if (!form.value.templateId) {
    errors.value.templateId = 'Please select a worksheet'
  }

  return Object.keys(errors.value).length === 0
}

async function submitForm() {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''

  try {
    const payload = {
      templateId: form.value.templateId,
      clientId: props.client.id,
      dueDate: form.value.dueDate || null,
      notes: form.value.notes || null
    }

    const response = await $fetch('/api/provider/worksheet-assignments', {
      method: 'POST',
      body: payload
    })

    if (response.success) {
      assignedWorksheet.value = response.worksheet
      showSuccess.value = true
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to assign worksheet'
  } finally {
    isLoading.value = false
  }
}

function close() {
  // If we just assigned a worksheet, emit the assigned event
  if (showSuccess.value && assignedWorksheet.value) {
    emit('assigned', assignedWorksheet.value)
  }

  // Reset form
  form.value = {
    templateId: '',
    dueDate: '',
    notes: ''
  }
  errors.value = {}
  error.value = ''
  isLoading.value = false
  showSuccess.value = false
  assignedWorksheet.value = null
  
  emit('close')
}

// Watch for form changes to clear errors
watch(() => form.value.templateId, () => {
  if (errors.value.templateId) delete errors.value.templateId
})
</script>