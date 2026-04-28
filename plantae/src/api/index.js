const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80';
const TOKEN_KEY = 'plantaeUserToken';

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

const resolveBaseUrl = () => {
  const configured = process.env.REACT_APP_API_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000/api`;
};

const API_BASE = resolveBaseUrl();

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

const getStoredToken = () => window.localStorage.getItem(TOKEN_KEY);
const storeToken = (token) => window.localStorage.setItem(TOKEN_KEY, token);
const clearStoredToken = () => window.localStorage.removeItem(TOKEN_KEY);

export const api = {
  baseUrl: API_BASE,
  getStoredToken,
  clearStoredToken,

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
        storeToken(payload.access);
      }

      return payload || { error: 'Could not create account.' };
    } catch {
      return {
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
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
        storeToken(payload.access);
        return { token: payload.access, username: payload.username };
      }

      return { error: 'Login failed. The backend did not return an access token.' };
    } catch {
      return {
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
      };
    }
  },

  getPlants: async (page = 1) => {
    try {
      const token = getStoredToken();

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
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
      };
    }
  },

  updatePlant: async (plantId, updates) => {
    try {
      const token = getStoredToken();

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
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
      };
    }
  },

  getProfile: async () => {
    try {
      const token = getStoredToken();

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
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
      };
    }
  },

  updateProfile: async (updates) => {
    try {
      const token = getStoredToken();

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
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
      };
    }
  },

  deleteAccount: async () => {
    try {
      const token = getStoredToken();

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

      clearStoredToken();
      return { success: true, unauthorized: false };
    } catch {
      return {
        unauthorized: false,
        error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
      };
    }
  },
};
