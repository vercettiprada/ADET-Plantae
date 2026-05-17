/**
 * Plantae API Service
 * Connects PlantaeMobile to the Django REST backend.
 *
 * Replaces the static data/plant.js with real API calls.
 * Drop this file into PlantaeMobile/services/apiService.js
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ──────────────────────────────────────────────────────────────────
// Change this to your local machine IP when testing on a physical device.
// Use 10.0.2.2 for Android emulator, localhost for iOS simulator.
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const TOKEN_URL    = 'http://127.0.0.1:8000/api/token';

// ─── Token Management ────────────────────────────────────────────────────────

/**
 * Login and store JWT tokens in AsyncStorage.
 * Checklist §5: Token generation (/api/token/)
 */
export async function login(username, password) {
  const response = await fetch(TOKEN_URL + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.detail || 'Login failed. Check your credentials.');
  }

  const data = await response.json();
  await AsyncStorage.setItem('access_token', data.access);
  await AsyncStorage.setItem('refresh_token', data.refresh);
  return data;
}

/**
 * Refresh the access token using the stored refresh token.
 */
export async function refreshAccessToken() {
  const refresh = await AsyncStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token found. Please log in again.');

  const response = await fetch(TOKEN_URL + '/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) throw new Error('Session expired. Please log in again.');

  const data = await response.json();
  await AsyncStorage.setItem('access_token', data.access);
  return data.access;
}

/**
 * Logout — clear stored tokens.
 */
export async function logout() {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
}

// ─── Base Fetch with Auth ─────────────────────────────────────────────────────

/**
 * Authenticated fetch wrapper.
 * Attaches Bearer token and auto-refreshes on 401.
 * Checklist §5: Bearer Token in every protected request
 */
async function authFetch(url, options = {}) {
  let token = await AsyncStorage.getItem('access_token');

  const makeRequest = async (accessToken) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });
  };

  let response = await makeRequest(token);

  // Auto-refresh on 401 Unauthorized
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      response = await makeRequest(token);
    } catch {
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
}

/**
 * Handle API response — parse JSON or throw error.
 * Checklist §6: Clear error messages returned
 */
async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.detail ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// ─── Plants API ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/plants/?page=1&limit=10
 * Checklist §4: Pagination (?page=1&limit=10)
 */
export async function getPlants({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);

  const response = await authFetch(`${API_BASE_URL}/plants/?${params}`);
  return handleResponse(response);
}

/**
 * GET /api/v1/plants/{id}/
 * Checklist §10: GET endpoint works
 */
export async function getPlant(id) {
  const response = await authFetch(`${API_BASE_URL}/plants/${id}/`);
  return handleResponse(response);
}

/**
 * POST /api/v1/plants/
 * Checklist §10: POST endpoint works
 * Body: { name, species, imageUrl, secretfact, light, water }
 */
export async function createPlant(plantData) {
  const response = await authFetch(`${API_BASE_URL}/plants/`, {
    method: 'POST',
    body: JSON.stringify(plantData),
  });
  return handleResponse(response);
}

/**
 * PUT /api/v1/plants/{id}/
 * Checklist §10: PUT/PATCH endpoint works (full update)
 */
export async function updatePlant(id, plantData) {
  const response = await authFetch(`${API_BASE_URL}/plants/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(plantData),
  });
  return handleResponse(response);
}

/**
 * PATCH /api/v1/plants/{id}/
 * Checklist §10: PUT/PATCH endpoint works (partial update)
 */
export async function patchPlant(id, partialData) {
  const response = await authFetch(`${API_BASE_URL}/plants/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(partialData),
  });
  return handleResponse(response);
}

/**
 * DELETE /api/v1/plants/{id}/
 * Checklist §10: DELETE endpoint works
 */
export async function deletePlant(id) {
  const response = await authFetch(`${API_BASE_URL}/plants/${id}/`, {
    method: 'DELETE',
  });
  if (response.status === 204) return { message: 'Plant deleted successfully.' };
  return handleResponse(response);
}

/**
 * GET /api/v1/plants/summary/  (no auth required)
 * Public lightweight list — used for the home screen garden.
 */
export async function getPublicPlants() {
  const response = await fetch(`${API_BASE_URL}/plants/summary/`);
  return handleResponse(response);
}
