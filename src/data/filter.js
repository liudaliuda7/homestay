// 筛选服务

export const AMENITIES_LIST = [
  'Wi-Fi', '空调', '洗衣机', '冰箱', '电视', '厨房',
  '停车位', '电梯', '泳池', '花园', '浴缸', '阳台',
  '海景', '早餐服务', '影音室'
];

export const PRICE_OPTIONS = [
  { label: '不限', value: [0, 2000] },
  { label: '¥0-¥300', value: [0, 300] },
  { label: '¥300-¥600', value: [300, 600] },
  { label: '¥600-¥1000', value: [600, 1000] },
  { label: '¥1000-¥2000', value: [1000, 2000] }
];

export const RATING_OPTIONS = [
  { label: '不限', value: 0 },
  { label: '3.5分以上', value: 3.5 },
  { label: '4.0分以上', value: 4.0 },
  { label: '4.5分以上', value: 4.5 }
];

export const ROOM_OPTIONS = [
  { label: '不限', value: 0 },
  { label: '1室', value: 1 },
  { label: '2室', value: 2 },
  { label: '3室+', value: 3 }
];

export const filterProperties = (properties, filters) => {
  return properties.filter(property => {
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      if (property.price < filters.minPrice) return false;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice < 2000) {
      if (property.price > filters.maxPrice) return false;
    }
    
    if (filters.bedrooms && filters.bedrooms > 0) {
      if (filters.bedrooms >= 3) {
        if (property.bedroom < 3) return false;
      } else {
        if (property.bedroom !== filters.bedrooms) return false;
      }
    }
    
    if (filters.bathrooms && filters.bathrooms > 0) {
      if (filters.bathrooms >= 3) {
        if (property.bathroom < 3) return false;
      } else {
        if (property.bathroom !== filters.bathrooms) return false;
      }
    }
    
    if (filters.beds && filters.beds > 0) {
      if (filters.beds >= 3) {
        if (property.beds < 3) return false;
      } else {
        if (property.beds !== filters.beds) return false;
      }
    }
    
    if (filters.rating && filters.rating > 0) {
      if (property.rating < filters.rating) return false;
    }
    
    if (filters.amenities && filters.amenities.length > 0) {
      for (const amenity of filters.amenities) {
        if (!property.amenities.includes(amenity)) {
          return false;
        }
      }
    }
    
    return true;
  });
};

export const getActiveFiltersCount = (filters) => {
  let count = 0;
  if (filters.minPrice > 0 || filters.maxPrice < 2000) count++;
  if (filters.bedrooms > 0) count++;
  if (filters.bathrooms > 0) count++;
  if (filters.beds > 0) count++;
  if (filters.rating > 0) count++;
  if (filters.amenities && filters.amenities.length > 0) count++;
  return count;
};

export const parseFiltersFromQuery = (query) => {
  const filters = {
    minPrice: query.minPrice ? parseInt(query.minPrice) : 0,
    maxPrice: query.maxPrice ? parseInt(query.maxPrice) : 2000,
    bedrooms: query.bedrooms ? parseInt(query.bedrooms) : 0,
    bathrooms: query.bathrooms ? parseInt(query.bathrooms) : 0,
    beds: query.beds ? parseInt(query.beds) : 0,
    rating: query.rating ? parseFloat(query.rating) : 0,
    amenities: query.amenities ? query.amenities.split(',') : [],
    keyword: query.keyword || ''
  };
  return filters;
};

export const buildQueryFromFilters = (filters) => {
  const query = {};
  if (filters.minPrice > 0) query.minPrice = filters.minPrice;
  if (filters.maxPrice < 2000) query.maxPrice = filters.maxPrice;
  if (filters.bedrooms > 0) query.bedrooms = filters.bedrooms;
  if (filters.bathrooms > 0) query.bathrooms = filters.bathrooms;
  if (filters.beds > 0) query.beds = filters.beds;
  if (filters.rating > 0) query.rating = filters.rating;
  if (filters.amenities && filters.amenities.length > 0) {
    query.amenities = filters.amenities.join(',');
  }
  if (filters.keyword) query.keyword = filters.keyword;
  return query;
};

export const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};
