<template>
  <div class="home-page">
    <!-- 搜索结果统计 -->
    <div class="container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="search-result">
          <div class="skeleton-title"></div>
          <div class="skeleton-sort"></div>
        </div>
        
        <div class="properties-grid">
          <div v-for="i in 6" :key="i" class="property-card-skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-text"></div>
              <div class="skeleton-title-small"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 正常内容 -->
      <div v-else>
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
        
        <!-- 房源列表 -->
        <div class="properties-grid">
          <PropertyCard 
            v-for="property in filteredProperties" 
            :key="property.id" 
            :property="property" 
          />
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredProperties.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>未找到匹配的房源</h3>
          <p>请尝试其他搜索关键词或调整筛选条件</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import PropertyCard from '../components/PropertyCard.vue';
import { properties, searchProperties } from '../data/properties';

const route = useRoute()

// 响应式状态
const allProperties = ref(properties)
const filteredProperties = ref(properties)
const searchKeyword = ref('')
const sortBy = ref('recommended')
const loading = ref(true)

// 筛选和排序房源
const filterAndSortProperties = () => {
  loading.value = true;
  
  // 模拟加载延迟，实际项目中可以移除
  setTimeout(() => {
    // 先搜索
    filteredProperties.value = searchProperties(searchKeyword.value)
    // 再排序
    sortProperties()
    loading.value = false;
  }, 500);
}

// 排序房源
const sortProperties = () => {
  switch (sortBy.value) {
    case 'price-low':
      filteredProperties.value.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProperties.value.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProperties.value.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // 默认按推荐排序（这里使用原始顺序）
      filteredProperties.value = searchProperties(searchKeyword.value);
  }
}

const handleSort = () => {
  sortProperties()
}

// 监听路由参数变化，实现搜索功能
watch(() => route.query.keyword, (newKeyword) => {
  searchKeyword.value = newKeyword || '';
  filterAndSortProperties();
}, {
  immediate: true
})

// 组件挂载时模拟加载
onMounted(() => {
  // 模拟加载延迟，实际项目中可以根据需要调整
  setTimeout(() => {
    loading.value = false;
  }, 800);
})
</script>

<style scoped>
.home-page {
  background-color: #f9f9f9;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.search-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-result h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
  cursor: pointer;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
}

.empty-state p {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* 骨架屏样式 */
.loading-container {
  min-height: 400px;
}

.property-card-skeleton {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: shimmer 2s infinite;
}

.skeleton-image {
  width: 100%;
  padding-top: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-title-small {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-title {
  width: 150px;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.skeleton-sort {
  width: 150px;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: 1rem 0;
  }
  
  .search-result {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .properties-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-result h2 {
    font-size: 1.3rem;
  }
}
</style>
