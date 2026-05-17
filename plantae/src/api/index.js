const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=900&q=80',
];
const TOKEN_KEY = 'plantaeUserToken';
const REQUEST_TIMEOUT_MS = 10000;
const DISCOVER_TIMEOUT_MS = 60000;

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
    // Normalize to: <host>:<port>/api (with trailing slash)
    return configured.replace(/\/$/, '').replace(/\/api\/?$/, '/api/');
  }

  const { protocol, hostname } = window.location;

  // If developing locally (localhost, 127.0.0.1, or LAN IP 192.168.x.x)
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.');

  if (isLocal) {
    // Dynamically use the current hostname but point to the Django port (8000)
    return `${protocol}//${hostname}:8000/api/`;
  }

  // Fallback for production builds
  return '/api/';
};

const normalizePath = (path = '') => String(path);

const API_BASE = resolveBaseUrl();
const IMAGE_FALLBACK = FALLBACK_IMAGES[0];

const resolveWebSocketBaseUrl = () => {
  const configured = process.env.REACT_APP_WS_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  // API_BASE is normalized to .../api/
  return API_BASE
    .replace(/^https:/, 'wss:')
    .replace(/^http:/, 'ws:')
    .replace(/\/api\/$/, '');
};

const WS_BASE = resolveWebSocketBaseUrl();

const hashText = (value = '') => (
  Array.from(String(value)).reduce((hash, character) => (
    ((hash << 5) - hash) + character.charCodeAt(0)
  ), 0)
);

const getFallbackPlantImage = (plant = {}) => {
  const seed = `${plant.id || ''}|${plant.name || ''}|${plant.species || ''}`;
  const index = Math.abs(hashText(seed)) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[index];
};

const isUsableImageUrl = (url) => {
  const normalizedCandidate = String(url || '').trim();
  const lowered = normalizedCandidate.toLowerCase();

  return Boolean(
    normalizedCandidate &&
    lowered.startsWith('http') &&
    !lowered.includes('upgrade_access') &&
    !lowered.includes('placehold.co') &&
    !lowered.includes('example.com') &&
    !lowered.includes('x-amz-signature') &&
    !lowered.includes('x-amz-expires') &&
    !lowered.includes('photo-1463936575829-25148e1db1b8')
  );
};

const pickImageUrl = (...candidates) => {
  for (const candidate of candidates) {
    if (isUsableImageUrl(candidate)) {
      return String(candidate).trim();
    }
  }

  return '';
};

const resolvePlantImage = (plant = {}) => {
  const defaultImage = plant.default_image || plant.defaultImage || plant.perenualData?.default_image || {};

  return pickImageUrl(
    plant.imageUrl,
    plant.image_url,
    defaultImage.regular_url,
    defaultImage.medium_url,
    defaultImage.original_url,
    defaultImage.thumbnail,
    plant.thumbnail,
  ) || getFallbackPlantImage(plant);
};

const mapPlant = (plant) => ({
  id: String(plant.id),
  name: plant.name || 'Unknown Plant',
  species: plant.species || 'Unknown Species',
  imageUrl: resolvePlantImage(plant),
  light: plant.light || 'Bright, indirect light',
  water: plant.water || 'Water when the soil feels dry',
  secretfact: plant.secretfact || plant.secret_fact || 'A beautiful plant.',
  description: plant.description || '',
  cycle: plant.cycle || '',
  maintenance: plant.maintenance || '',
  growthRate: plant.growthRate || plant.growth_rate || '',
  hardinessMin: plant.hardinessMin || plant.hardiness_min || '',
  hardinessMax: plant.hardinessMax || plant.hardiness_max || '',
  perenualId: plant.perenualId || plant.perenual_id || null,
  perenualData: plant.perenualData || plant.perenual_payload || {},
  careGuides: Array.isArray(plant.careGuides) ? plant.careGuides : (plant.care_guides || []),
});

const buildNetworkError = () => ({
  networkDown: true,
  error: `Network error. Start Django and make sure ${API_BASE} is reachable from this browser.`,
});

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Strip leading slash from path — API_BASE already ends with '/'
    // e.g. API_BASE='http://host/api/' + '/auth/login/' → strips to 'auth/login/'
    // Without this: 'http://host/api/' + '/auth/login/' = 'http://host/api//auth/login/' → 404
    const normalizedPath = normalizePath(path).replace(/^\/+/, '');

    // Belt-and-suspenders: collapse any remaining double slashes anywhere in the URL
    const rawUrl = `${API_BASE}${normalizedPath}`;
    const url = rawUrl.replace(/([^:])\/{2,}/g, '$1/');

    const response = await fetch(url, {
      ...fetchOptions,
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    return { response, payload };
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const readSessionToken = () => window.sessionStorage.getItem(TOKEN_KEY);
const readLegacyToken = () => window.localStorage.getItem(TOKEN_KEY);

const getStoredToken = () => {
  const sessionToken = readSessionToken();
  if (sessionToken) {
    return sessionToken;
  }

  const legacyToken = readLegacyToken();
  if (legacyToken) {
    window.sessionStorage.setItem(TOKEN_KEY, legacyToken);
    window.localStorage.removeItem(TOKEN_KEY);
    return legacyToken;
  }

  return null;
};

const storeToken = (token) => {
  window.sessionStorage.setItem(TOKEN_KEY, token);
  window.localStorage.removeItem(TOKEN_KEY);
};

const clearStoredToken = () => {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
};

const buildPlantPayload = (plantData = {}) => ({
  name: plantData.name,
  species: plantData.species,
  imageUrl: plantData.imageUrl,
  light: plantData.light,
  water: plantData.water,
  secretfact: plantData.secretfact,
  description: plantData.description,
  cycle: plantData.cycle,
  maintenance: plantData.maintenance,
  growthRate: plantData.growthRate,
  hardinessMin: plantData.hardinessMin,
  hardinessMax: plantData.hardinessMax,
  perenualId: plantData.perenualId,
  perenualData: plantData.perenualData,
  careGuides: plantData.careGuides,
});

const buildAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const api = {
  baseUrl: API_BASE,
  webSocketUrl: WS_BASE,
  imageFallback: IMAGE_FALLBACK,
  getFallbackPlantImage,
  getStoredToken,
  clearStoredToken,

  verifySession: async (tokenOverride) => {
    const token = tokenOverride || getStoredToken();

    if (!token) {
      return { valid: false, unauthorized: true };
    }

    try {
      const { response, payload } = await request('/token/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        clearStoredToken();
        return {
          valid: false,
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Your session is no longer valid. Please sign in again.'),
        };
      }

      return { valid: true };
    } catch {
      clearStoredToken();
      return { valid: false, ...buildNetworkError() };
    }
  },

  register: async (userData) => {
    try {
      const { response, payload } = await request('/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        clearStoredToken();
        return { error: normalizeError(payload, 'Could not create account.') };
      }

      if (payload?.access) {
        storeToken(payload.access);
      }

      return payload || { error: 'Could not create account.' };
    } catch {
      clearStoredToken();
      return buildNetworkError();
    }
  },

  login: async (credentials) => {
    try {
      const { response, payload } = await request('/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        clearStoredToken();
        return { error: normalizeError(payload, 'Login failed. Check your credentials.') };
      }

      if (payload?.access) {
        storeToken(payload.access);
        return { token: payload.access, username: payload.username };
      }

      return { error: 'Login failed. The backend did not return an access token.' };
    } catch {
      clearStoredToken();
      return buildNetworkError();
    }
  },

  getPlants: async (page = 1) => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { data: [], hasNext: false, unauthorized: true };
      }

      const { response, payload } = await request(`/v1/plants/?page=${page}`, {
        headers: buildAuthHeaders(token),
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
        hasNext: Boolean(payload?.pagination?.next),
        unauthorized: false,
      };
    } catch {
      return { data: [], hasNext: false, unauthorized: false, ...buildNetworkError() };
    }
  },

  getPlant: async (plantId) => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request(`/v1/plants/${plantId}/`, {
        headers: buildAuthHeaders(token),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to load plant details.'),
        };
      }

      return { data: mapPlant(payload), unauthorized: false };
    } catch {
      return { unauthorized: false, ...buildNetworkError() };
    }
  },

  discoverPlants: async (count = 4) => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { data: [], unauthorized: true };
      }

      const { response, payload } = await request('/v1/plants/discover/', {
        method: 'POST',
        headers: buildAuthHeaders(token),
        body: JSON.stringify({ count }),
        timeoutMs: DISCOVER_TIMEOUT_MS,
      });

      if (!response.ok) {
        return {
          data: [],
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to discover more plants.'),
        };
      }

      const results = Array.isArray(payload?.results) ? payload.results : [];
      return {
        data: results.map(mapPlant),
        unauthorized: false,
        providers: Array.isArray(payload?.providers) ? payload.providers : [],
        message: payload?.message || '',
      };
    } catch {
      return { data: [], unauthorized: false, ...buildNetworkError() };
    }
  },

  createPlant: async (plantData) => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/v1/plants/', {
        method: 'POST',
        headers: buildAuthHeaders(token),
        body: JSON.stringify(buildPlantPayload(plantData)),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to create plant.'),
        };
      }

      return { data: mapPlant(payload), unauthorized: false };
    } catch {
      return { unauthorized: false, ...buildNetworkError() };
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
        headers: buildAuthHeaders(token),
        body: JSON.stringify(buildPlantPayload(updates)),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to save plant changes.'),
        };
      }

      return { data: mapPlant(payload), unauthorized: false };
    } catch {
      return { unauthorized: false, ...buildNetworkError() };
    }
  },

  deletePlant: async (plantId) => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request(`/v1/plants/${plantId}/`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token),
      });

      if (!response.ok) {
        return {
          unauthorized: response.status === 401 || response.status === 403,
          error: normalizeError(payload, 'Unable to delete plant.'),
        };
      }

      return { success: true, unauthorized: false };
    } catch {
      return { unauthorized: false, ...buildNetworkError() };
    }
  },

  getProfile: async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/auth/profile/', {
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
      return { unauthorized: false, ...buildNetworkError() };
    }
  },

  updateProfile: async (updates) => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/auth/profile/', {
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
      return { unauthorized: false, ...buildNetworkError() };
    }
  },

  deleteAccount: async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        return { unauthorized: true, error: 'Your session expired. Please sign in again.' };
      }

      const { response, payload } = await request('/auth/profile/', {
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
      return { unauthorized: false, ...buildNetworkError() };
    }
  },

  connectTelemetry: ({ onMessage, onError } = {}) => {
    const token = getStoredToken();

    if (!token) {
      return null;
    }

    const socket = new WebSocket(`${WS_BASE}/ws/iot/telemetry/?token=${encodeURIComponent(token)}`);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        deviceId: 'demo-sensor-01',
        temperature: 31,
        humidity: 58,
        soilMoisture: 42,
      }));
    };

    socket.onmessage = (event) => {
      try {
        onMessage?.(JSON.parse(event.data));
      } catch {
        onError?.('Telemetry returned an unreadable message.');
      }
    };

    socket.onerror = () => {
      onError?.('Telemetry WebSocket is offline.');
    };

    return socket;
  },
};
