// constants/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://192.168.1.6:8000/api/v1';

// ITEM 5: Authentication Endpoint
export const loginUser = async (credentials) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await res.json(); // Should return { token: 'xyz' }
  } catch (e) { return { error: e }; }
};

export const fetchLivePlants = async (page = 1) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    // ITEM 11: CRUD Security (Sending Token to Backend)
    const response = await fetch(`${API_BASE}/plants/?page=${page}`, {
      headers: { 'Authorization': `Token ${token}` } 
    });
    
    const json = await response.json();
    const results = json.results || (Array.isArray(json) ? json : []);

    const data = results.map(plant => ({
      id: plant.id.toString(),
      name: plant.name || "Unknown",
      species: plant.species || "Unknown",
      imageUrl: plant.imageUrl || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8',
      secretfact: plant.secretfact || "A sanctuary secret.",
    }));

    return { data, hasNext: !!json.next };
  } catch (e) { return { data: [], hasNext: false }; }
};