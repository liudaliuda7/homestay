const HISTORY_STORAGE_KEY = 'homestay_search_history';
const HOT_SEARCHES_STORAGE_KEY = 'homestay_hot_searches';
const MAX_HISTORY_COUNT = 10;
const MAX_HOT_SEARCH_COUNT = 8;
const EXPIRE_DAYS = 7;

const getExpireTime = () => {
  const now = new Date();
  now.setDate(now.getDate() + EXPIRE_DAYS);
  return now.getTime();
};

const staticHotSearches = [
  { keyword: '海景民宿', count: 156 },
  { keyword: '温泉度假', count: 142 },
  { keyword: '亲子出游', count: 128 },
  { keyword: '情侣套房', count: 115 },
  { keyword: '商务出差', count: 98 },
  { keyword: '日式风格', count: 87 },
  { keyword: '北欧简约', count: 76 },
  { keyword: '中式古典', count: 65 }
];

export const getSearchHistory = () => {
  const data = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    const now = new Date().getTime();
    
    if (parsed.expireTime && now > parsed.expireTime) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      return [];
    }
    
    return parsed.items || [];
  } catch (e) {
    return [];
  }
};

export const addToSearchHistory = (keyword) => {
  if (!keyword || keyword.trim() === '') return;
  
  const history = getSearchHistory();
  const trimmedKeyword = keyword.trim();
  
  const existingIndex = history.findIndex(item => item.keyword === trimmedKeyword);
  
  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }
  
  history.unshift({
    keyword: trimmedKeyword,
    searchTime: new Date().getTime()
  });
  
  if (history.length > MAX_HISTORY_COUNT) {
    history.splice(MAX_HISTORY_COUNT);
  }
  
  const data = {
    items: history,
    expireTime: getExpireTime()
  };
  
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data));
  
  updateHotSearchStats(trimmedKeyword);
};

export const removeFromSearchHistory = (keyword) => {
  const history = getSearchHistory();
  const newHistory = history.filter(item => item.keyword !== keyword);
  
  const data = {
    items: newHistory,
    expireTime: getExpireTime()
  };
  
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data));
};

export const clearSearchHistory = () => {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
};

export const getHotSearches = () => {
  const data = localStorage.getItem(HOT_SEARCHES_STORAGE_KEY);
  
  if (!data) {
    const initialData = {
      items: staticHotSearches,
      expireTime: getExpireTime()
    };
    localStorage.setItem(HOT_SEARCHES_STORAGE_KEY, JSON.stringify(initialData));
    return staticHotSearches;
  }
  
  try {
    const parsed = JSON.parse(data);
    const now = new Date().getTime();
    
    if (parsed.expireTime && now > parsed.expireTime) {
      const initialData = {
        items: staticHotSearches,
        expireTime: getExpireTime()
      };
      localStorage.setItem(HOT_SEARCHES_STORAGE_KEY, JSON.stringify(initialData));
      return staticHotSearches;
    }
    
    return parsed.items || staticHotSearches;
  } catch (e) {
    return staticHotSearches;
  }
};

const updateHotSearchStats = (keyword) => {
  const hotSearches = getHotSearches();
  const existingIndex = hotSearches.findIndex(item => item.keyword === keyword);
  
  if (existingIndex !== -1) {
    hotSearches[existingIndex].count += 1;
  } else {
    if (hotSearches.length < MAX_HOT_SEARCH_COUNT) {
      hotSearches.push({ keyword, count: 1 });
    } else {
      const minCount = Math.min(...hotSearches.map(item => item.count));
      if (1 > minCount) {
        const minIndex = hotSearches.findIndex(item => item.count === minCount);
        hotSearches[minIndex] = { keyword, count: 1 };
      }
    }
  }
  
  hotSearches.sort((a, b) => b.count - a.count);
  
  if (hotSearches.length > MAX_HOT_SEARCH_COUNT) {
    hotSearches.splice(MAX_HOT_SEARCH_COUNT);
  }
  
  const data = {
    items: hotSearches,
    expireTime: getExpireTime()
  };
  
  localStorage.setItem(HOT_SEARCHES_STORAGE_KEY, JSON.stringify(data));
};

export const getSuggestions = (keyword, properties) => {
  if (!keyword || keyword.trim() === '') return [];
  
  const trimmedKeyword = keyword.trim().toLowerCase();
  const suggestions = [];
  
  const uniqueKeywords = new Set();
  
  for (const property of properties) {
    const titleLower = property.title.toLowerCase();
    const locationLower = property.location.toLowerCase();
    
    if (titleLower.includes(trimmedKeyword)) {
      const keywordWithoutDuplicate = property.title;
      if (!uniqueKeywords.has(keywordWithoutDuplicate)) {
        uniqueKeywords.add(keywordWithoutDuplicate);
        suggestions.push({
          type: 'title',
          keyword: property.title,
          property: property
        });
      }
    }
    
    if (locationLower.includes(trimmedKeyword)) {
      if (!uniqueKeywords.has(property.location)) {
        uniqueKeywords.add(property.location);
        suggestions.push({
          type: 'location',
          keyword: property.location,
          property: property
        });
      }
    }
    
    if (property.amenities) {
      for (const amenity of property.amenities) {
        const amenityLower = amenity.toLowerCase();
        if (amenityLower.includes(trimmedKeyword) && !uniqueKeywords.has(amenity)) {
          uniqueKeywords.add(amenity);
          suggestions.push({
            type: 'amenity',
            keyword: amenity,
            property: property
          });
        }
      }
    }
  }
  
  return suggestions.slice(0, 8);
};

export const highlightText = (text, keyword) => {
  if (!keyword || keyword.trim() === '') return text;
  
  const trimmedKeyword = keyword.trim();
  const regex = new RegExp(`(${escapeRegExp(trimmedKeyword)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
