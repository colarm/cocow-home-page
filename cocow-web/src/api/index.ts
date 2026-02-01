import type { Website, Category } from '../types'

const API_BASE = '/api/v1'

/**
 * Fetch all categories from the API
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Fetch websites, optionally filtered by category
 */
export async function fetchWebsites(categoryId?: string): Promise<Website[]> {
  const params = new URLSearchParams()
  if (categoryId && categoryId !== 'all') {
    params.append('category', categoryId)
  }

  const url = `${API_BASE}/websites${params.toString() ? `?${params}` : ''}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch websites: ${response.statusText}`)
  }
  return response.json()
}
