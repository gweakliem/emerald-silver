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
              Add New Client
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
            <h3 class="mt-4 text-lg font-medium text-gray-900">Client Added Successfully!</h3>
            <p class="mt-2 text-sm text-gray-600">
              {{ createdClient?.name }} has been added to your client list.
            </p>
          </div>

          <!-- Invitation Status -->
          <div v-if="invitationResults.length > 0" class="mt-6 space-y-3">
            <h4 class="text-sm font-medium text-gray-900">Invitation Status:</h4>
            <div v-for="result in invitationResults" :key="result.type" class="flex items-center space-x-2">
              <div class="flex-shrink-0">
                <svg v-if="result.success" class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <svg v-else class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <span class="text-sm text-gray-700">
                {{ result.type === 'email' ? 'Email' : 'SMS' }} invitation 
                {{ result.success ? 'sent successfully' : 'failed to send' }}
              </span>
            </div>
          </div>

          <div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-blue-800">Next Steps</h4>
                <p class="mt-1 text-sm text-blue-700">
                  Your client will receive an invitation with a link to access their portal. They can login using OTP authentication.
                </p>
              </div>
            </div>
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
            <!-- Name Field -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.name }"
                placeholder="John Smith"
                :disabled="isLoading"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.email }"
                placeholder="john.smith@example.com"
                :disabled="isLoading"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <!-- Phone Field -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.phone }"
                placeholder="+1 (555) 123-4567"
                :disabled="isLoading"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            </div>

            <!-- Notes Field -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Any additional notes about this client..."
                :disabled="isLoading"
              ></textarea>
            </div>

            <!-- Contact Method Requirement -->
            <div class="rounded-md bg-yellow-50 p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700">
                    <strong>Note:</strong> At least one contact method (email or phone) is required to send the client an invitation.
                  </p>
                </div>
              </div>
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
                Adding Client...
              </span>
              <span v-else>Add Client</span>
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
  name: '',
  email: '',
  phone: '',
  notes: ''
})

const errors = ref({})
const error = ref('')
const isLoading = ref(false)
const showSuccess = ref(false)
const createdClient = ref(null)
const invitationResults = ref([])

const isFormValid = computed(() => {
  return form.value.name.trim() && 
         (form.value.email.trim() || form.value.phone.trim()) && 
         !Object.keys(errors.value).length
})

function validateForm() {
  errors.value = {}

  // Validate name
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required'
  }

  // Validate that at least one contact method is provided
  if (!form.value.email.trim() && !form.value.phone.trim()) {
    errors.value.email = 'At least one contact method is required'
    errors.value.phone = 'At least one contact method is required'
  }

  // Validate email format if provided
  if (form.value.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  // Validate phone format if provided
  if (form.value.phone.trim() && !/^\+?[\d\s\-\(\)]{10,}$/.test(form.value.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Please enter a valid phone number'
  }

  return Object.keys(errors.value).length === 0
}

async function submitForm() {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/provider/clients', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        email: form.value.email.trim() || null,
        phone: form.value.phone.trim() || null,
        notes: form.value.notes.trim() || null
      }
    })

    if (response.success) {
      createdClient.value = response.client
      invitationResults.value = response.invitations || []
      showSuccess.value = true
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to add client'
  } finally {
    isLoading.value = false
  }
}

function close() {
  // If we just created a client, emit the created event
  if (showSuccess.value && createdClient.value) {
    emit('created', createdClient.value)
  }

  // Reset form
  form.value = {
    name: '',
    email: '',
    phone: '',
    notes: ''
  }
  errors.value = {}
  error.value = ''
  isLoading.value = false
  showSuccess.value = false
  createdClient.value = null
  invitationResults.value = []
  
  emit('close')
}

// Watch for form changes to clear errors
watch(() => form.value.name, () => {
  if (errors.value.name) delete errors.value.name
})

watch(() => form.value.email, () => {
  if (errors.value.email) delete errors.value.email
})

watch(() => form.value.phone, () => {
  if (errors.value.phone) delete errors.value.phone
})
</script>