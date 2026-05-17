import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './styles/App.css';
import About from './About';
import { api } from './api';
import AuthScreen from './components/AuthScreen';
import PlantCard from './components/PlantCard';
import PlantModal from './components/PlantModal';
import ProfilePanel from './components/ProfilePanel';
import SettingsSidebar from './components/SettingsSidebar';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantSaving, setPlantSaving] = useState(false);
  const [allPlants, setAllPlants] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentView, setCurrentView] = useState('garden');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profile, setProfile] = useState({ username: '', email: '', firstName: '' });
  const [authError, setAuthError] = useState('');
  const [gardenError, setGardenError] = useState('');
  const [gardenNotice, setGardenNotice] = useState('');
  const [profileError, setProfileError] = useState('');
  const [telemetry, setTelemetry] = useState(null);
  const [telemetryStatus, setTelemetryStatus] = useState('Connecting telemetry...');

  const createPlantDraft = () => ({
    id: null,
    name: '',
    species: '',
    imageUrl: '',
    light: '',
    water: '',
    secretfact: '',
    description: '',
    isNew: true,
  });

  const mergePlants = useCallback((incomingPlants) => {
    setAllPlants((prev) => {
      const byId = new Map(prev.map((plant) => [plant.id, plant]));
      for (const plant of incomingPlants || []) {
        byId.set(plant.id, plant);
      }
      return Array.from(byId.values());
    });
  }, []);

  const clearSession = useCallback(() => {
    api.clearStoredToken();
    setUserToken(null);
    setAllPlants([]);
    setHasNextPage(true);
    setPage(1);
    setSelectedPlant(null);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    setProfile({ username: '', email: '', firstName: '' });
    setTelemetry(null);
    setTelemetryStatus('Telemetry disconnected');
  }, []);

  const handleBackendUnavailable = useCallback((message) => {
    clearSession();
    setAllPlants([]);
    setSelectedPlant(null);
    setGardenNotice('');
    setGardenError('');
    setProfileError('');
    setAuthError(message || 'Backend offline. Please start Django and sign in again.');
    setAuthChecked(true);
  }, [clearSession]);

  const loadPlants = useCallback(async (pageNumber = 1) => {
    setLoadingMore(true);
    const result = await api.getPlants(pageNumber);

    if (result.unauthorized) {
      clearSession();
      setLoadingMore(false);
      return { unauthorized: true };
    }

    setGardenError(result.error || '');

    if (pageNumber === 1) {
      setAllPlants(result.data || []);
      setPage(1);
      setHasNextPage(result.hasNext);
    } else if ((result.data || []).length > 0) {
      mergePlants(result.data || []);
      setPage(pageNumber);
      setHasNextPage(result.hasNext);
    } else {
      setHasNextPage(false);
    }

    setLoadingMore(false);
    return result;
  }, [clearSession, mergePlants]);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = api.getStoredToken();

      if (!storedToken) {
        setAuthChecked(true);
        return;
      }

      const sessionResult = await api.verifySession(storedToken);

      if (!sessionResult.valid) {
        if (sessionResult.networkDown) {
          handleBackendUnavailable(sessionResult.error || 'Backend offline. Please sign in again.');
        } else {
          // Token expired cleanly — just go back to login
          api.clearStoredToken();
          setAuthError('Your session expired. Please sign in again.');
        }
        setAuthChecked(true);
        return;
      }

      setUserToken(storedToken);
      const [plantsResult, profileResult] = await Promise.all([
        api.getPlants(1),
        api.getProfile(),
      ]);

      if (plantsResult.unauthorized || profileResult.unauthorized) {
        // Session valid per verifySession but data fetch got 401 — token just expired between calls
        api.clearStoredToken();
        setAuthError('Your session expired. Please sign in again.');
      } else if (plantsResult.networkDown || profileResult.networkDown) {
        handleBackendUnavailable(plantsResult.error || profileResult.error || 'Backend offline.');
      } else if (plantsResult.error || profileResult.error) {
        // Non-fatal error — stay logged in, show error in garden
        setGardenError(plantsResult.error || '');
        setProfileError(profileResult.error || '');
      }
      if (!plantsResult.unauthorized && !profileResult.unauthorized) {
        setAllPlants(plantsResult.data || []);
        setHasNextPage(plantsResult.hasNext);
        setPage(1);
        if (profileResult.data) {
          setProfile(profileResult.data);
        }
      }

      setAuthChecked(true);
    };

    bootstrap();
  }, [handleBackendUnavailable]);

  useEffect(() => {
    if (!userToken) {
      return undefined;
    }

    let active = true;

    const verifyLiveSession = async () => {
      const sessionResult = await api.verifySession(userToken);
      if (!active || sessionResult.valid) {
        return;
      }

      if (sessionResult.networkDown) {
        handleBackendUnavailable(sessionResult.error || 'Backend offline. Please sign in again.');
      } else {
        // Token expired — soft redirect, no "backend offline" message
        clearSession();
        setAuthError('Your session expired. Please sign in again.');
        setAuthChecked(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifyLiveSession();
      }
    };

    const intervalId = window.setInterval(verifyLiveSession, 5000);
    window.addEventListener('focus', verifyLiveSession);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', verifyLiveSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleBackendUnavailable, userToken]);

  useEffect(() => {
    if (!userToken) {
      return undefined;
    }

    setTelemetryStatus('Connecting telemetry...');
    const socket = api.connectTelemetry({
      onMessage: (message) => {
        if (message.type === 'telemetry.ready') {
          setTelemetryStatus('Telemetry connected');
          return;
        }

        if (message.type === 'telemetry.update') {
          setTelemetry(message.data);
          setTelemetryStatus('Live sensor feed');
        }
      },
      onError: (message) => setTelemetryStatus(message),
    });

    if (!socket) {
      setTelemetryStatus('Telemetry requires sign in');
      return undefined;
    }

    return () => socket.close();
  }, [userToken]);

  const filteredPlants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return allPlants;
    }

    return allPlants.filter((plant) => (
      plant.name.toLowerCase().includes(query) ||
      plant.species.toLowerCase().includes(query)
    ));
  }, [allPlants, searchQuery]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setAuthError('');
    clearSession();
    const result = await api.login(credentials);

    if (result.token) {
      const sessionResult = await api.verifySession(result.token);

      if (!sessionResult.valid) {
        if (sessionResult.networkDown) {
          handleBackendUnavailable(sessionResult.error || 'Backend offline. Please try again.');
        } else {
          api.clearStoredToken();
          setAuthError(sessionResult.error || 'Login failed. Please try again.');
        }
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      const [profileResult, plantsResult] = await Promise.all([
        api.getProfile(),
        loadPlants(1),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      setProfileError(profileResult.error || '');

      if (plantsResult?.unauthorized || profileResult.unauthorized) {
        api.clearStoredToken();
        setAuthError('Session expired. Please sign in again.');
      } else if (plantsResult?.networkDown || profileResult.networkDown) {
        handleBackendUnavailable(plantsResult?.error || profileResult.error || 'Backend offline.');
      } else {
        setUserToken(result.token);
        if (plantsResult?.error) setGardenError(plantsResult.error);
        if (profileResult.error) setProfileError(profileResult.error);
      }
    } else {
      api.clearStoredToken();
      setAuthError(result.error || 'Invalid credentials.');
    }

    setLoading(false);
    setAuthChecked(true);
  };

  const handleRegister = async (userData) => {
    if (userData?.error) {
      setAuthError(userData.error);
      setAuthChecked(true);
      return;
    }

    setLoading(true);
    setAuthError('');
    const result = await api.register(userData);

    if (result.access) {
      const sessionResult = await api.verifySession(result.access);

      if (!sessionResult.valid) {
        if (sessionResult.networkDown) {
          handleBackendUnavailable(sessionResult.error || 'Registration succeeded, but the backend is no longer reachable.');
        } else {
          api.clearStoredToken();
          setAuthError(sessionResult.error || 'Session could not be verified. Please sign in.');
        }
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      const [profileResult, plantsResult] = await Promise.all([
        api.getProfile(),
        loadPlants(1),
      ]);

      if (plantsResult?.unauthorized || profileResult.unauthorized) {
        api.clearStoredToken();
        setAuthError('Session expired. Please sign in again.');
      } else if (plantsResult?.networkDown || profileResult.networkDown) {
        handleBackendUnavailable(plantsResult?.error || profileResult.error || 'Backend offline.');
      } else {
        setUserToken(result.access);
        setProfile(profileResult.data || {
          username: result.username || userData.username,
          email: userData.email,
          firstName: '',
        });
        if (plantsResult?.error) setGardenError(plantsResult.error);
        if (profileResult.error) setProfileError(profileResult.error);
      }
    } else {
      api.clearStoredToken();
      setAuthError(result.error || 'Could not create account.');
    }

    setLoading(false);
    setAuthChecked(true);
  };

  const handleLogout = () => {
    clearSession();
    setCurrentView('garden');
    setSearchQuery('');
    setAuthError('');
  };

  const handleSavePlant = async (updatedPlant) => {
    setGardenError('');
    setPlantSaving(true);
    const result = updatedPlant.id
      ? await api.updatePlant(updatedPlant.id, updatedPlant)
      : await api.createPlant(updatedPlant);

    if (result.unauthorized) {
      handleBackendUnavailable('Session expired. Please sign in again.');
      setPlantSaving(false);
      return false;
    }

    if (result.error) {
      if (result.networkDown) {
        handleBackendUnavailable(result.error);
        setPlantSaving(false);
        return false;
      }
      setGardenError(result.error);
      setPlantSaving(false);
      return false;
    }

    if (result.data) {
      mergePlants([result.data]);
      setSelectedPlant(result.data);
      setGardenNotice(updatedPlant.id ? 'Plant updated.' : 'Plant added to your garden.');
    }

    setPlantSaving(false);
    return true;
  };

  const handleDeletePlant = async (plantId) => {
    if (!plantId) {
      setSelectedPlant(null);
      return true;
    }

    const confirmed = window.confirm('Delete this plant from your garden?');

    if (!confirmed) {
      return false;
    }

    setGardenError('');
    setPlantSaving(true);
    const result = await api.deletePlant(plantId);

    if (result.unauthorized) {
      handleBackendUnavailable('Session expired. Please sign in again.');
      setPlantSaving(false);
      return false;
    }

    if (result.error) {
      if (result.networkDown) {
        handleBackendUnavailable(result.error);
        setPlantSaving(false);
        return false;
      }
      setGardenError(result.error);
      setPlantSaving(false);
      return false;
    }

    setAllPlants((prev) => prev.filter((plant) => plant.id !== String(plantId)));
    setSelectedPlant(null);
    setGardenNotice('Plant deleted.');
    setPlantSaving(false);
    return true;
  };

  const handleOpenPlant = async (plant) => {
    setGardenError('');
    setGardenNotice('');
    setSelectedPlant(plant);

    const result = await api.getPlant(plant.id);

    if (result.unauthorized) {
      handleBackendUnavailable('Session expired. Please sign in again.');
      return;
    }

    if (result.error) {
      if (result.networkDown) {
        handleBackendUnavailable(result.error);
        return;
      }
      setGardenError(result.error);
      return;
    }

    if (result.data) {
      mergePlants([result.data]);
      setSelectedPlant(result.data);
    }
  };

  const handleSaveProfile = async (updates) => {
    setLoading(true);
    setProfileError('');
    const result = await api.updateProfile(updates);

    if (result.unauthorized) {
      handleBackendUnavailable('Session expired. Please sign in again.');
      setLoading(false);
      return false;
    }

    if (result.error) {
      if (result.networkDown) {
        handleBackendUnavailable(result.error);
        setLoading(false);
        return false;
      }
      setProfileError(result.error);
      setLoading(false);
      return false;
    }

    if (result.data) {
      setProfile(result.data);
    }

    setLoading(false);
    return true;
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('This permanently deletes your account. This action cannot be undone.');

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setProfileError('');
    const result = await api.deleteAccount();

    if (result.unauthorized) {
      clearSession();
      setAuthError('Session expired. Please sign in again.');
    } else if (result.error) {
      setProfileError(result.error);
    } else {
      clearSession();
      setAuthError('');
    }

    setLoading(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !userToken) {
      return;
    }

    setGardenNotice('');
    let nextLocalCount = 0;

    let stillHasLocalPages = hasNextPage;

    if (hasNextPage) {
      const localResult = await loadPlants(page + 1);
      if (localResult?.unauthorized) {
        return;
      }
      if (localResult?.networkDown) {
        handleBackendUnavailable(localResult.error);
        return;
      }
      nextLocalCount = (localResult?.data || []).length;
      stillHasLocalPages = Boolean(localResult?.hasNext);
    }

    if (!stillHasLocalPages || nextLocalCount < 4) {
      const discoveryResult = await api.discoverPlants(Math.max(4, 6 - nextLocalCount));

      if (discoveryResult.unauthorized) {
        handleBackendUnavailable('Session expired. Please sign in again.');
        return;
      }

      if (discoveryResult.error) {
        if (discoveryResult.networkDown) {
          handleBackendUnavailable(discoveryResult.error);
          return;
        }
        setGardenError(discoveryResult.error);
        return;
      }

      mergePlants(discoveryResult.data || []);
      setGardenNotice(discoveryResult.message || '');
    }
  };

  if (!authChecked) {
    return <div className="screen-loader">Loading Plantae...</div>;
  }

  if (!userToken) {
    return (
      <AppFrame>
        <AuthScreen
          loading={loading}
          error={authError}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame dark={isDarkMode}>
      {currentView === 'garden' ? (
        <>
          <SettingsSidebar
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onAboutClick={() => {
              setCurrentView('about');
              setIsSettingsOpen(false);
            }}
            onProfileClick={() => {
              setIsProfileOpen(true);
              setIsSettingsOpen(false);
            }}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />

          <ProfilePanel
            isOpen={isProfileOpen}
            profile={profile}
            plantCount={allPlants.length}
            loading={loading}
            error={profileError}
            onClose={() => setIsProfileOpen(false)}
            onSave={handleSaveProfile}
            onDeleteAccount={handleDeleteAccount}
          />

          <header className="main-header">
            <div className="header-topline">
              <h1 className="brand-script">Plantae.</h1>
              <button
                className="menu-button"
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open settings"
              >
                <span />
                <span />
                <span />
              </button>
            </div>

            <div className="search-wrap">
              <input
                type="text"
                placeholder="search species..."
                className="glass-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button
                className="add-plant-button"
                type="button"
                aria-label="Add plant"
                onClick={() => {
                  setGardenError('');
                  setGardenNotice('');
                  setSelectedPlant(createPlantDraft());
                }}
              >
                <span className="add-plant-icon">+</span>
                <span>Add plant</span>
              </button>
            </div>
          </header>

          <main className="discovery-container">
            <section className={`telemetry-strip ${telemetry?.severity || 'idle'}`}>
              <div>
                <span className="telemetry-label">{telemetryStatus}</span>
                <strong>{telemetry?.prediction || 'Waiting for IoT sensor data'}</strong>
              </div>
              <div className="telemetry-values">
                <span>{telemetry ? `${telemetry.temperature}C` : '--C'}</span>
                <span>{telemetry ? `${telemetry.humidity}% RH` : '--% RH'}</span>
                <span>{telemetry ? `${telemetry.soilMoisture}% soil` : '--% soil'}</span>
              </div>
            </section>

            {gardenError ? <p className="form-message error garden-message">{gardenError}</p> : null}
            {!gardenError && gardenNotice ? <p className="form-message info-message garden-message">{gardenNotice}</p> : null}

            <section className="plant-stack">
              {filteredPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onCardClick={handleOpenPlant}
                />
              ))}
            </section>

            {!filteredPlants.length ? (
              <div className="empty-state">
                <p>{allPlants.length === 0 ? 'Loading your garden...' : 'No plants found.'}</p>
              </div>
            ) : null}

            {(hasNextPage || userToken) ? (
              <button className="secondary-button" type="button" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : hasNextPage ? 'Load more plants' : 'Discover random plants'}
              </button>
            ) : null}
          </main>

          <PlantModal
            plant={selectedPlant}
            onClose={() => setSelectedPlant(null)}
            onSave={handleSavePlant}
            onDelete={handleDeletePlant}
            saving={plantSaving}
            error={gardenError}
          />
        </>
      ) : (
        <About onBack={() => setCurrentView('garden')} />
      )}
    </AppFrame>
  );
}

function AppFrame({ children, dark = false }) {
  return <div className={`app-shell ${dark ? 'dark' : ''}`}>{children}</div>;
}

export default App;
