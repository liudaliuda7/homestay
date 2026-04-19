const STORAGE_KEY = 'homestay_favorites';
const EXPIRE_DAYS = 3;

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getFavoritesData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    const now = new Date().getTime();
    
    if (parsed.expireTime && now > parsed.expireTime) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (e) {
    return null;
  }
};

const getFavorites = () => {
  const data = getFavoritesData();
  return data && data.items ? data.items : [];
};

const saveFavorites = (favorites) => {
  const data = {
    items: favorites,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const isFavorite = (propertyId) => {
  const favorites = getFavorites();
  return favorites.includes(propertyId);
};

export const toggleFavorite = (propertyId) => {
  const favorites = getFavorites();
  const isCurrentlyFavorite = favorites.includes(propertyId);
  
  if (isCurrentlyFavorite) {
    const updated = favorites.filter(id => id !== propertyId);
    saveFavorites(updated);
    return {
      isFavorite: false,
      message: '已取消收藏'
    };
  } else {
    const updated = [...favorites, propertyId];
    saveFavorites(updated);
    return {
      isFavorite: true,
      message: '收藏成功'
    };
  }
};

export const addFavorite = (propertyId) => {
  const favorites = getFavorites();
  if (!favorites.includes(propertyId)) {
    const updated = [...favorites, propertyId];
    saveFavorites(updated);
    return {
      isFavorite: true,
      message: '收藏成功'
    };
  }
  return {
    isFavorite: true,
    message: '已收藏'
  };
};

export const removeFavorite = (propertyId) => {
  const favorites = getFavorites();
  const updated = favorites.filter(id => id !== propertyId);
  saveFavorites(updated);
  return {
    isFavorite: false,
    message: '已取消收藏'
  };
};

export const getFavoriteCount = () => {
  const favorites = getFavorites();
  return favorites.length;
};

export const getAllFavorites = () => {
  return getFavorites();
};
