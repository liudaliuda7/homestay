<template>
  <div class="home-page">
    <!-- 搜索结果统计 -->
    <div class="container">
      <div class="search-result">
        <h2>{{ loading ? '加载中...' : filteredProperties.length + '套房源' }}</h2>
        <div class="sort-options">
          <span>排序：</span>
          <select v-model="sortBy" @change="handleSort" class="sort-select" :disabled="loading">
            <option value="recommended">推荐</option>
            <option value="price-low">价格从低到高</option>
            <option value="price-high">价格从高到低</option>
            <option value="rating">评分最高</option>
          </select>
        </div>
      </div>
      
      <!-- 骨架屏加载状态 -->
      <div v-if="loading" class="skeleton-grid">
        <Skeleton v-for="i in 6" :key="i" />
      </div>
      
      <!-- 房源列表 -->
      <template v-else>
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
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import PropertyCard from '../components/PropertyCard.vue';
import Skeleton from '../components/Skeleton.vue';
import { properties, searchProperties } from '../data/properties';

const route = useRoute()

// 响应式状态
const allProperties = ref(properties)
const filteredProperties = ref([])
const searchKeyword = ref('')
const sortBy = ref('recommended')
const loading = ref(true)

// 筛选和排序房源
const filterAndSortProperties = () => {
  // 先搜索
  filteredProperties.value = searchProperties(searchKeyword.value)
  // 再排序
  sortProperties()
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
  // 模拟加载延迟，展示骨架屏效果
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}, {
  immediate: true
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

.skeleton-grid {
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
  
  .properties-grid, .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .properties-grid, .skeleton-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-result h2 {
    font-size: 1.3rem;
  }
}
</style>
