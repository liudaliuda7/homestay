const STORAGE_KEY = 'homestay_favorites';

const getFavorites = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveFavorites = (favorites) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
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
