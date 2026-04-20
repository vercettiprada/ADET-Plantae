export const DEFAULT_CADENCE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export const createEmptyCareProfile = () => ({
  inSanctuary: false,
  cadenceDays: DEFAULT_CADENCE_DAYS,
  lastWateredAt: null,
  notes: '',
  history: [],
});

const toDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getDaysSince = (value) => {
  const date = toDate(value);
  if (!date) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
};

export const getNextWaterDate = (lastWateredAt, cadenceDays = DEFAULT_CADENCE_DAYS) => {
  const date = toDate(lastWateredAt);
  if (!date) {
    return null;
  }

  return new Date(date.getTime() + cadenceDays * DAY_MS);
};

export const getWaterStatus = (careProfile) => {
  const cadenceDays = careProfile?.cadenceDays || DEFAULT_CADENCE_DAYS;
  const daysSince = getDaysSince(careProfile?.lastWateredAt);

  if (!careProfile?.inSanctuary) {
    return { key: 'catalog', label: 'Catalog', tone: 'muted', urgency: 0 };
  }

  if (daysSince === null) {
    return { key: 'new', label: 'Needs first watering', tone: 'accent', urgency: 2 };
  }

  if (daysSince >= cadenceDays) {
    return { key: 'due', label: 'Needs water today', tone: 'danger', urgency: 3 };
  }

  if (daysSince >= Math.max(cadenceDays - 1, 1)) {
    return { key: 'soon', label: 'Water tomorrow', tone: 'warn', urgency: 2 };
  }

  return { key: 'good', label: 'Hydrated', tone: 'good', urgency: 1 };
};

export const formatRelativeWatering = (careProfile) => {
  const daysSince = getDaysSince(careProfile?.lastWateredAt);

  if (!careProfile?.inSanctuary) {
    return 'Add to your sanctuary';
  }

  if (daysSince === null) {
    return 'Needs water';
  }

  if (daysSince === 0) {
    return 'Watered today';
  }

  if (daysSince === 1) {
    return 'Watered yesterday';
  }

  return `Watered ${daysSince} days ago`;
};

export const formatCalendarDate = (value) => {
  const date = toDate(value);
  if (!date) {
    return 'Not set';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const buildHistoryEntry = (type, detail = '') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  detail,
  at: new Date().toISOString(),
});

export const hydratePlant = (plant, careProfile) => {
  const mergedCare = { ...createEmptyCareProfile(), ...careProfile };
  const waterStatus = getWaterStatus(mergedCare);
  const nextWaterDate = getNextWaterDate(mergedCare.lastWateredAt, mergedCare.cadenceDays);

  return {
    ...plant,
    care: mergedCare,
    waterStatus,
    nextWaterDate,
    careLabel: formatRelativeWatering(mergedCare),
  };
};

export const sortPlantsForDashboard = (plants) => (
  [...plants].sort((a, b) => {
    if (b.waterStatus.urgency !== a.waterStatus.urgency) {
      return b.waterStatus.urgency - a.waterStatus.urgency;
    }

    const aStamp = toDate(a.care.lastWateredAt)?.getTime() || 0;
    const bStamp = toDate(b.care.lastWateredAt)?.getTime() || 0;
    return aStamp - bStamp;
  })
);
