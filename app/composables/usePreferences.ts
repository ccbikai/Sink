import { ref } from 'vue'
import { initDB, savePreferences, getPreferences } from '~/utils/indexeddb'
import type { UserPreferences } from '~/utils/indexeddb'

export function usePreferences() {
  const isLoading = ref(true)
  const preferences = ref<UserPreferences>({})
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Initialize preferences
  async function init() {
    if (initialized.value) return
    try {
      isLoading.value = true
      error.value = null

      await initDB()
      const stored = await getPreferences<UserPreferences>('userPreferences')
      preferences.value = stored || {}
      initialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load preferences'
      console.error('Error initializing preferences:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Save preferences
  async function updatePreferences(newPrefs: Partial<UserPreferences>) {
    try {
      error.value = null
      // Merge new preferences with existing ones
      const updated = { ...preferences.value, ...newPrefs }
      await savePreferences('userPreferences', updated)
      preferences.value = updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save preferences'
      console.error('Error saving preferences:', err)
    }
  }

  // Update link sorting preferences
  async function updateLinkSorting(field: string, direction: 'asc' | 'desc') {
    await updatePreferences({
      linkSorting: { field, direction }
    })
  }

  // Initialize immediately
  if (process.client) {
    init()
  }

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    updateLinkSorting,
    init
  }
}
