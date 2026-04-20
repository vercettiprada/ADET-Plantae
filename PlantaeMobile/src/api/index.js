import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8';

const flattenDetails = (details) => {
  if (!details) {
    return [];
  }

  if (Array.isArray(details)) {
    return details.flatMap(flattenDetails);
  }

  if (typeof details === 'object') {
    return Object.entries(details).flatMap(([field, value]) => {
      const messages = flattenDetails(value);
      return messages.map((message) => `${field}: ${message}`);
    });
  }

  return [String(details)];
};

const normalizeError = (payload, fallbackMessage) => {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload.error === 'string') {
    return payload.error;
  }

  if (payload.error?.message) {
    const detailMessages = flattenDetails(payload.error.details);
    if (detailMessages.length > 0) {
      return detailMessages.join('\n');
    }
    return payload.error.message;
  }

  if (payload.detail) {
    return payload.detail;
  }

  return fallbackMessage;
};

const resolveHost = () => {
  const configuredHost =
    Constants.expoConfig?.extra?.apiHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    Constants.linkingUri;

  if (!configuredHost) {
    return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  }

  const sanitizedHost = configuredHost
    .replace(/^[a-z]+:\/\//i, '')
    .split('/')[0]
    .split(':')[0];

  if (sanitizedHost === 'localhost' && Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return sanitizedHost || (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');
};

const API_BASE = `http://${resolveHost()}:8000/api`;

const mapPlant = (plant) => ({
  id: String(plant.id),
  name: plant.name || 'Unknown Plant',
  species: plant.species || 'Unknown Species',
  imageUrl: plant.imageUrl || FALLBACK_IMAGE,
  light: plant.light || 'Bright, indirect light',
  water: plant.water || 'Water when the soil feels dry',
  secretfact: plant.secretfact || plant.secret_fact || 'A beautiful plant.',
});

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  return { response, payload };
};

export const api = {
  baseUrl: API_BASE,

  register: async (userData) => {
    try {
      const { response, payload } = await request('/v1/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        return { error: normalizeError(payload, 'Could not create account.') };
      }

      if (payload?.access) {
        await AsyncStorage.setItem('userToken', payload.access);
      }

      return payload || { error: 'Could not create account.' };
    } catch {
      return {
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  login: async (credentials) => {
    try {
      const { response, payload } = await request('/v1/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        return { error: normalizeError(payload, 'Login failed. Check your credentials.') };
      }

      if (payload?.access) {
        await AsyncStorage.setItem('userToken', payload.access);
        return { token: payload.access, username: payload.username };
      }

      return { error: 'Login failed. The backend did not return an access token.' };
    } catch {
      return {
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  getPlants: async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { data: [], hasNext: false, unauthorized: true };
      }

      const { response, payload } = await request(`/v1/plants/?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          data: [],
          hasNext: false,
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to load plants.'),
        };
      }

      const results = Array.isArray(payload) ? payload : payload?.results || [];
      return {
        data: results.map(mapPlant),
        hasNext: Boolean(payload?.next),
        unauthorized: false,
      };
    } catch {
      return {
        data: [],
        hasNext: false,
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  updatePlant: async (plantId, updates) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request(`/v1/plants/${plantId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          species: updates.species,
          imageUrl: updates.imageUrl,
          light: updates.light,
          water: updates.water,
          secretfact: updates.secretfact,
        }),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to save plant changes.'),
        };
      }

      return { data: mapPlant(payload), unauthorized: false };
    } catch {
      return {
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  createPlant: async (plantData) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/v1/plants/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plantData),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to create your plant.'),
        };
      }

      return { data: mapPlant(payload), unauthorized: false };
    } catch {
      return {
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  identifyPlant: async ({ imageBase64, mimeType = 'image/jpeg', fileName = 'plant.jpg' }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/v1/plants/identify/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          fileName,
        }),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to identify this plant.'),
        };
      }

      return {
        data: {
          candidates: payload?.candidates || [],
          provider: payload?.provider || 'plantnet',
        },
        unauthorized: false,
      };
    } catch {
      return {
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  getProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/v1/auth/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to load your profile.'),
        };
      }

      return {
        data: {
          username: payload.username || '',
          email: payload.email || '',
          firstName: payload.first_name || '',
        },
        unauthorized: false,
      };
    } catch {
      return {
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  updateProfile: async (updates) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/v1/auth/profile/', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: updates.email,
          first_name: updates.firstName,
        }),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to save your profile.'),
        };
      }

      return {
        data: {
          username: payload.username || '',
          email: payload.email || '',
          firstName: payload.first_name || '',
        },
        unauthorized: false,
      };
    } catch {
      return {
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },

  deleteAccount: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/v1/auth/profile/', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to delete your account.'),
        };
      }

      await AsyncStorage.removeItem('userToken');
      return { success: true, unauthorized: false };
    } catch {
      return {
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this device.`,
      };
    }
  },
};
