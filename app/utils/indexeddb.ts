import { ref } from 'vue'

// Database configuration
const DB_NAME = 'sink'
const DB_VERSION = 1
const STORE_NAME = 'preferences'

// Type definitions
export interface UserPreferences {
  linkSorting?: {
    field: string
    direction: 'asc' | 'desc'
  }
  [key: string]: any // Allow for future preference additions
}

// Reactive state to track database status
export const dbStatus = ref<'initializing' | 'ready' | 'error'>('initializing')

// Initialize database connection
let db: IDBDatabase | null = null

export function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Error opening IndexedDB')
      dbStatus.value = 'error'
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      dbStatus.value = 'ready'
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// Save preferences
export function savePreferences(key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(value, key)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get preferences
export function getPreferences<T>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

// Delete preferences
export function deletePreferences(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(key)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
