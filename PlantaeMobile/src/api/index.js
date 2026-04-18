import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://192.168.1.6:8000/api/v1';
export const UNSPLASH_ACCESS_KEY = 'asDgc1ykxE_pRE3VxZgE4SA01ggeJVeIJSeTQ07Tjv4';

export const api = {
  // ITEM 5: Authentication - Register (CREATE User)
  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      // Check if response is actually JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await res.json();
      } else {
        return { error: "Server returned non-JSON response. Check Django URL." };
      }
    } catch (e) {
      console.error("Register API Error:", e);
      return { error: "Registration Failed" };
    }
  },

  // ITEM 5: Authentication - Login
  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await res.json();
      } else {
        return { error: "Server error (HTML instead of JSON). Check API_BASE URL." };
      }
    } catch (e) {
      console.error("Login API Error:", e);
      return { error: "Connection Failed" };
    }
  },

  // ITEM 4, 6 & 11: Secure Data Fetching
  getPlants: async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE}/plants/?page=${page}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const json = await response.json();
      
      const results = Array.isArray(json) ? json : (json.results || []);

      const mappedData = await Promise.all(
        results.map(async (plant) => {
          let imageUrl = plant.imageUrl || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8';
          try {
            const query = plant.name || 'houseplant';
            const randomPage = Math.floor(Math.random() * 50) + 1;
            const imgRes = await fetch(
              `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1&page=${randomPage}`
            );
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              imageUrl = imgData.results?.[0]?.urls?.regular || imageUrl;
            }
          } catch (imgErr) { /* Fallback */ }

          return {
            id: plant.id.toString(),
            name: plant.name || "Unknown Plant",
            species: plant.species || "Unknown Species",
            imageUrl: imageUrl,
            light: plant.light || 'Bright, Indirect',
            water: plant.water || 'Weekly',
            secretfact: plant.secretfact || plant.secret_fact || 'Organic sanctuary addition.',
          };
        })
      );

      return { data: mappedData, hasNext: !!json.next };
    } catch (error) {
      console.error("Fetch Error:", error);
      return { data: [], hasNext: false };
    }
  }
};