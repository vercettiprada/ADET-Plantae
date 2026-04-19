import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️  IMPORTANT: Replace with your PC's local IP address.
// Run 'ipconfig' on Windows, find your IPv4 Address (e.g. 192.168.1.5)
// Do NOT use 'localhost' — it won't reach Django from a phone/emulator.
export const API_BASE = 'http://192.168.137.1:8000/api';

export const api = {

  // REGISTER — POST /api/auth/register/
  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      return { error: "Server error. Check Django is running." };
    } catch (e) {
      return { error: "Network error. Is Django running? Check your IP in src/api/index.js" };
    }
  },

  // LOGIN — POST /api/auth/login/
  // Matches login_view in plants/views.py -> returns { access, refresh, username }
  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('userToken', json.access);
        return { token: json.access };
      } else {
        return { error: json.error || json.detail || "Login failed. Check credentials." };
      }
    } catch (e) {
      return { error: "Network error. Is Django running? Check your IP in src/api/index.js" };
    }
  },

  // GET PLANTS — GET /api/v1/plants/?page=N  (JWT protected)
  getPlants: async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return { data: [], hasNext: false, unauthorized: true };
      }

      const response = await fetch(`${API_BASE}/v1/plants/?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log("Plants fetch error:", response.status);
        return {
          data: [],
          hasNext: false,
          unauthorized: response.status === 401 || response.status === 403,
        };
      }

      const json = await response.json();
      const results = Array.isArray(json) ? json : (json.results || []);

      const mappedData = results.map((plant) => ({
        id: (plant.id || Math.random()).toString(),
        name: plant.name || "Unknown Plant",
        species: plant.species || "Unknown Species",
        imageUrl: plant.imageUrl || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8',
        light: plant.light || 'Bright, Indirect',
        water: plant.water || 'Weekly',
        secretfact: plant.secretfact || plant.secret_fact || 'A beautiful plant.',
      }));

      return { data: mappedData, hasNext: !!json.next, unauthorized: false };
    } catch (error) {
      console.error("Fetch Error:", error);
      return { data: [], hasNext: false, unauthorized: false };
    }
  }
};
