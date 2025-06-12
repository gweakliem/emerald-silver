<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Provider Login
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email or phone number to receive a verification code
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="sendOTP" class="space-y-6">
          <div>
            <label for="identifier" class="block text-sm font-medium leading-6 text-gray-900">
              Email or Phone Number
            </label>
            <div class="mt-2">
              <input
                id="identifier"
                v-model="identifier"
                type="text"
                required
                placeholder="provider@example.com or +1234567890"
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">{{ error }}</div>
          </div>

          <div v-if="success" class="rounded-md bg-green-50 p-4">
            <div class="text-sm text-green-700">{{ success }}</div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading || !identifier.trim()"
              class="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
              <span v-else>Send Verification Code</span>
            </button>
          </div>
        </form>

        <!-- Footer Links -->
        <div class="mt-6">
          <div class="text-center">
            <NuxtLink
              to="/"
              class="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to home
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const identifier = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

async function sendOTP() {
  if (!identifier.value.trim()) return
  
  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch('/api/provider/send-otp', {
      method: 'POST',
      body: { identifier: identifier.value.trim() }
    })

    if (response.success) {
      success.value = response.message
      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        navigateTo({
          path: '/provider/verify',
          query: { identifier: identifier.value.trim(), type: response.type }
        })
      }, 2000)
    }
  } catch (err) {
    error.value = err.data?.message || 'Failed to send verification code'
  } finally {
    isLoading.value = false
  }
}
</script>