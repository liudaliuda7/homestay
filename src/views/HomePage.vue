<template>
  <div class="home-page">
    <div class="container">
      <Transition name="fade">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
      </Transition>
      
      <FilterBar 
        v-model:filters="filters"
      />
      
      <FilterTags 
        v-model:filters="filters"
      />
      
      <div class="content-wrapper">
        <div class="search-result">
          <h2>{{ filteredProperties.length }}套房源</h2>
          <div class="sort-options">
            <span>排序：</span>
            <select v-model="sortBy" @change="handleSort" class="sort-select">
              <option value="recommended">推荐</option>
              <option value="price-low">价格从低到高</option>
              <option value="price-high">价格从高到低</option>
              <option value="rating">评分最高</option>
            </select>
          </div>
        </div>
        
        <Transition name="fade">
          <div v-if="!isLoading && filteredProperties.length > 0" class="properties-grid">
            <PropertyCard 
              v-for="property in filteredProperties" 
              :key="property.id" 
              :property="property" 
            />
          </div>
        </Transition>
        
        <Transition name="fade">
          <div v-if="!isLoading && filteredProperties.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>未找到匹配的房源</h3>
            <p>请尝试其他搜索关键词或调整筛选条件</p>
            <el-button type="danger" @click="clearAllFilters">
              清除所有筛选
            </el-button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PropertyCard from '../components/PropertyCard.vue';
import FilterBar from '../components/FilterBar.vue';
import FilterTags from '../components/FilterTags.vue';
import { properties, searchProperties } from '../data/properties';
import { filterProperties, parseFiltersFromQuery, buildQueryFromFilters } from '../data/filter';

const route = useRoute()
const router = useRouter()

const filteredProperties = ref(properties)
const sortBy = ref('recommended')
const isLoading = ref(false)

const filters = ref({
  minPrice: 0,
  maxPrice: 2000,
  bedrooms: 0,
  bathrooms: 0,
  beds: 0,
  rating: 0,
  amenities: [],
  keyword: ''
})

const initializeFromQuery = () => {
  const queryFilters = parseFiltersFromQuery(route.query)
  filters.value = { ...queryFilters }
}

const updateURL = () => {
  const query = buildQueryFromFilters(filters.value)
  router.replace({
    path: route.path,
    query: query
  })
}

const applyFiltersAndSort = () => {
  isLoading.value = true
  
  setTimeout(() => {
    let result = searchProperties(filters.value.keyword)
    
    result = filterProperties(result, filters.value)
    
    filteredProperties.value = result
    sortProperties()
    
    updateURL()
    
    isLoading.value = false
  }, 200)
}

const sortProperties = () => {
  const propertiesCopy = [...filteredProperties.value]
  
  switch (sortBy.value) {
    case 'price-low':
      propertiesCopy.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      propertiesCopy.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      propertiesCopy.sort((a, b) => b.rating - a.rating)
      break
  }
  
  filteredProperties.value = propertiesCopy
}

const handleSort = () => {
  sortProperties()
}

const clearAllFilters = () => {
  filters.value = {
    minPrice: 0,
    maxPrice: 2000,
    bedrooms: 0,
    bathrooms: 0,
    beds: 0,
    rating: 0,
    amenities: [],
    keyword: filters.value.keyword
  }
}

watch(
  () => route.query.keyword,
  (newKeyword) => {
    filters.value.keyword = newKeyword || ''
    applyFiltersAndSort()
  }
)

watch(
  filters,
  () => {
    applyFiltersAndSort()
  },
  { deep: true }
)

onMounted(() => {
  initializeFromQuery()
  applyFiltersAndSort()
})
</script>

<style scoped>
.home-page {
  background-color: var(--background-secondary, #f9f9f9);
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color-light, #f0f0f0);
  border-top: 4px solid var(--primary-color, #ff5a5f);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-wrapper {
  background-color: transparent;
}

.search-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0;
}

.search-result h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #333333);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary, #666666);
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  font-size: 0.9rem;
  background-color: var(--background-primary, #ffffff);
  cursor: pointer;
  transition: all var(--transition-normal, 0.3s ease);
}

.sort-select:hover {
  border-color: var(--primary-color, #ff5a5f);
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--background-primary, #ffffff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.05));
  margin-top: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary, #333333);
}

.empty-state p {
  font-size: 1rem;
  color: var(--text-secondary, #666666);
  margin: 0 0 1.5rem 0;
}

@media (max-width: 1024px) {
  .properties-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 1rem 0;
  }
  
  .search-result {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .search-result h2 {
    font-size: 1.25rem;
  }
  
  .properties-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  
  .empty-state {
    padding: 2.5rem 1.5rem;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
