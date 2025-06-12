<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Enter Verification Code
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        We sent a 6-digit code to your {{ type === 'email' ? 'email' : 'phone' }}
      </p>
      <p class="text-center text-sm text-gray-500 mt-1">
        {{ maskedIdentifier }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="verifyOTP" class="space-y-6">
          <div>
            <label for="code" class="block text-sm font-medium leading-6 text-gray-900">
              Verification Code
            </label>
            <div class="mt-2">
              <input
                id="code"
                v-model="code"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                required
                placeholder="000000"
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 text-center text-lg tracking-widest"
                :disabled="isLoading"
                @input="formatCode"
              />
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">{{ error }}</div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading || code.length !== 6"
              class="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
              <span v-else>Verify Code</span>
            </button>
          </div>

          <div class="text-center">
            <button
              type="button"
              @click="resendCode"
              :disabled="isResending || countdown > 0"
              class="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="isResending">Resending...</span>
              <span v-else-if="countdown > 0">Resend code in {{ countdown }}s</span>
              <span v-else>Resend code</span>
            </button>
          </div>

          <div class="text-center">
            <NuxtLink
              to="/provider/login"
              class="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Back to login
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const route = useRoute()
const identifier = route.query.identifier
const type = route.query.type

if (!identifier || !type) {
  await navigateTo('/provider/login')
}

const code = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const error = ref('')
const countdown = ref(0)

const maskedIdentifier = computed(() => {
  if (!identifier) return ''
  
  if (type === 'email') {
    const [local, domain] = identifier.split('@')
    return `${local.slice(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`
  } else {
    // Phone number
    const cleaned = identifier.replace(/\D/g, '')
    return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`
  }
})

function formatCode(event) {
  // Only allow numbers
  const value = event.target.value.replace(/\D/g, '')
  code.value = value.slice(0, 6)
}

async function verifyOTP() {
  if (code.value.length !== 6) return
  
  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/provider/verify-otp', {
      method: 'POST',
      body: { 
        identifier: identifier,
        code: code.value 
      }
    })

    if (response.success) {
      await navigateTo('/provider/dashboard')
    }
  } catch (err) {
    error.value = err.data?.message || 'Invalid verification code'
    code.value = ''
  } finally {
    isLoading.value = false
  }
}

async function resendCode() {
  isResending.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/provider/send-otp', {
      method: 'POST',
      body: { identifier: identifier }
    })

    if (response.success) {
      // Start 60 second countdown
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to resend code'
  } finally {
    isResending.value = false
  }
}

// Auto-submit when 6 digits are entered
watch(code, (newCode) => {
  if (newCode.length === 6 && !isLoading.value) {
    verifyOTP()
  }
})
</script>