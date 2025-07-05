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
              Create Worksheet
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
        </div>

        <!-- Success State -->
        <div v-if="showSuccess" class="px-6 py-4">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Worksheet Created Successfully!</h3>
            <p class="mt-2 text-sm text-gray-600">
              "{{ createdWorksheet?.title }}" has been created and is ready to assign to clients.
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
            <!-- Title Field -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">
                Worksheet Title *
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.title }"
                placeholder="Weekly Check-in Form"
                :disabled="isLoading"
              />
              <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
            </div>

            <!-- Description Field -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Brief description of this worksheet..."
                :disabled="isLoading"
              ></textarea>
            </div>

            <!-- Worksheet Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Worksheet Type *
              </label>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="type-pdf"
                    v-model="form.type"
                    type="radio"
                    value="pdf"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    :disabled="isLoading"
                  />
                  <label for="type-pdf" class="ml-3 block text-sm text-gray-700">
                    PDF Upload
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    id="type-google-forms"
                    v-model="form.type"
                    type="radio"
                    value="google_forms"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    :disabled="isLoading"
                  />
                  <label for="type-google-forms" class="ml-3 block text-sm text-gray-700">
                    Google Forms URL
                  </label>
                </div>
              </div>
            </div>

            <!-- PDF Upload -->
            <div v-if="form.type === 'pdf'">
              <label for="pdf-upload" class="block text-sm font-medium text-gray-700">
                Upload PDF *
              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="pdf-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a PDF</span>
                      <input
                        id="pdf-upload"
                        type="file"
                        class="sr-only"
                        accept=".pdf"
                        @change="handlePdfUpload"
                        :disabled="isLoading"
                      />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
              </div>
              <p v-if="form.pdfFile" class="mt-2 text-sm text-gray-600">
                Selected: {{ form.pdfFile.name }}
              </p>
              <p v-if="errors.pdf" class="mt-1 text-sm text-red-600">{{ errors.pdf }}</p>
            </div>

            <!-- Google Forms URL -->
            <div v-if="form.type === 'google_forms'">
              <label for="google-forms-url" class="block text-sm font-medium text-gray-700">
                Google Forms URL *
              </label>
              <input
                id="google-forms-url"
                v-model="form.googleFormsUrl"
                type="url"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.googleFormsUrl }"
                placeholder="https://forms.gle/..."
                :disabled="isLoading"
              />
              <p class="mt-1 text-xs text-gray-500">
                Copy the shareable link from your Google Form
              </p>
              <p v-if="errors.googleFormsUrl" class="mt-1 text-sm text-red-600">{{ errors.googleFormsUrl }}</p>
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
                Creating...
              </span>
              <span v-else>Create Worksheet</span>
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
  }
})

const emit = defineEmits(['close', 'created'])

const form = ref({
  title: '',
  description: '',
  type: 'pdf',
  pdfFile: null,
  googleFormsUrl: ''
})

const errors = ref({})
const error = ref('')
const isLoading = ref(false)
const showSuccess = ref(false)
const createdWorksheet = ref(null)

const isFormValid = computed(() => {
  const hasTitle = form.value.title.trim()
  const hasType = form.value.type
  const hasPdfFile = form.value.type === 'pdf' ? form.value.pdfFile : true
  const hasGoogleFormsUrl = form.value.type === 'google_forms' ? form.value.googleFormsUrl.trim() : true
  
  return hasTitle && hasType && hasPdfFile && hasGoogleFormsUrl && !Object.keys(errors.value).length
})

function handlePdfUpload(event) {
  const file = event.target.files[0]
  if (file) {
    if (file.type !== 'application/pdf') {
      errors.value.pdf = 'Please select a PDF file'
      return
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      errors.value.pdf = 'PDF file must be less than 10MB'
      return
    }
    form.value.pdfFile = file
    if (errors.value.pdf) delete errors.value.pdf
  }
}

function validateForm() {
  errors.value = {}

  // Validate title
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
  }

  // Validate based on type
  if (form.value.type === 'pdf') {
    if (!form.value.pdfFile) {
      errors.value.pdf = 'Please select a PDF file'
    }
  } else if (form.value.type === 'google_forms') {
    if (!form.value.googleFormsUrl.trim()) {
      errors.value.googleFormsUrl = 'Google Forms URL is required'
    } else if (!isValidUrl(form.value.googleFormsUrl)) {
      errors.value.googleFormsUrl = 'Please enter a valid URL'
    }
  }

  return Object.keys(errors.value).length === 0
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

async function submitForm() {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('title', form.value.title.trim())
    formData.append('description', form.value.description.trim())
    formData.append('type', form.value.type)
    
    if (form.value.type === 'pdf' && form.value.pdfFile) {
      formData.append('pdfFile', form.value.pdfFile)
    } else if (form.value.type === 'google_forms') {
      formData.append('googleFormsUrl', form.value.googleFormsUrl.trim())
    }

    const response = await $fetch('/api/provider/worksheets', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      createdWorksheet.value = response.worksheet
      showSuccess.value = true
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to create worksheet'
  } finally {
    isLoading.value = false
  }
}

function close() {
  // If we just created a worksheet, emit the created event
  if (showSuccess.value && createdWorksheet.value) {
    emit('created', createdWorksheet.value)
  }

  // Reset form
  form.value = {
    title: '',
    description: '',
    type: 'pdf',
    pdfFile: null,
    googleFormsUrl: ''
  }
  errors.value = {}
  error.value = ''
  isLoading.value = false
  showSuccess.value = false
  createdWorksheet.value = null
  
  emit('close')
}

// Watch for form changes to clear errors
watch(() => form.value.title, () => {
  if (errors.value.title) delete errors.value.title
})

watch(() => form.value.type, () => {
  // Clear errors when switching types
  if (errors.value.pdf) delete errors.value.pdf
  if (errors.value.googleFormsUrl) delete errors.value.googleFormsUrl
})

watch(() => form.value.googleFormsUrl, () => {
  if (errors.value.googleFormsUrl) delete errors.value.googleFormsUrl
})
</script>