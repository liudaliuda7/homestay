<template>
  <div class="content-section">
    <div class="section-header">
      <h2>我的收藏</h2>
      <p>您收藏的房源列表</p>
    </div>
    
    <Transition name="fade" mode="out-in">
      <div v-if="favorites.length > 0" key="list" class="favorites-list">
        <div 
          v-for="property in favorites" 
          :key="property.id" 
          class="favorite-item"
        >
          <div class="favorite-card">
            <router-link :to="`/property/${property.id}`" class="property-link">
              <div class="property-image">
                <img :src="property.images[0]" :alt="property.title" @error="handleImageError" />
                <div class="rating-badge">
                  <span class="star">⭐</span>
                  <span>{{ property.rating }}</span>
                </div>
              </div>
            </router-link>
            
            <div class="property-info">
              <router-link :to="`/property/${property.id}`" class="property-link">
                <div class="location">{{ property.location }}</div>
                <h3 class="title">{{ property.title }}</h3>
                <div class="details">
                  <span>{{ property.guests }}位房客</span>
                  <span>·</span>
                  <span>{{ property.bedroom }}间卧室</span>
                  <span>·</span>
                  <span>{{ property.bathroom }}间卫生间</span>
                </div>
                <div class="price">
                  <span class="price-value">¥{{ property.price }}</span>
                  <span class="price-unit">/晚</span>
                </div>
              </router-link>
              
              <button 
                class="remove-btn"
                :class="{ removing: isRemoving(property.id) }"
                @click="handleRemoveFavorite(property.id)"
              >
                <span class="heart-icon">{{ isRemoving(property.id) ? '🖤' : '❤️' }}</span>
                <span class="remove-text">取消收藏</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else key="empty" class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3>暂无收藏</h3>
        <p>去发现喜欢的房源吧</p>
        <router-link to="/" class="empty-btn">浏览房源</router-link>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAllFavorites, removeFavorite } from '../data/favorites'
import { properties } from '../data/properties'

const route = useRoute()
const DEFAULT_PROPERTY_IMAGE = 'https://picsum.photos/seed/default-property/800/600'

const removingIds = ref(new Set())

const favoriteIds = ref([])

const favorites = computed(() => {
  return favoriteIds.value
    .map(id => properties.find(p => p.id === id))
    .filter(p => p !== undefined)
})

const isRemoving = (id) => {
  return removingIds.value.has(id)
}

const loadFavorites = () => {
  favoriteIds.value = getAllFavorites()
}

const handleImageError = (event) => {
  event.target.src = DEFAULT_PROPERTY_IMAGE
}

const handleRemoveFavorite = (propertyId) => {
  removingIds.value.add(propertyId)
  
  setTimeout(() => {
    const result = removeFavorite(propertyId)
    removingIds.value.delete(propertyId)
    loadFavorites()
    
    ElMessage({
      message: '已取消收藏',
      type: 'info',
      duration: 2000
    })
  }, 300)
}

onMounted(() => {
  loadFavorites()
})

watch(
  () => route.path,
  () => {
    loadFavorites()
  }
)
</script>

<style scoped>
.content-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #666;
  margin: 0;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.favorite-item {
  transition: opacity 0.3s ease;
}

.favorite-card {
  display: flex;
  background-color: #fafafa;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.property-link {
  text-decoration: none;
  color: inherit;
}

.property-image {
  position: relative;
  width: 280px;
  min-width: 280px;
  height: 180px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.favorite-card:hover .property-image img {
  transform: scale(1.05);
}

.rating-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: white;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  color: #ff5a5f;
  font-size: 0.8rem;
}

.property-info {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.location {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  color: #222;
}

.details {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.price {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-value {
  font-size: 1.2rem;
  color: #ff5a5f;
}

.price-unit {
  font-size: 0.85rem;
  color: #666;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem;
  width: fit-content;
}

.remove-btn:hover {
  border-color: #ff5a5f;
  background-color: #fff5f5;
}

.remove-btn.removing {
  opacity: 0.6;
}

.heart-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.remove-btn.removing .heart-icon {
  animation: heartFade 0.3s ease;
}

@keyframes heartFade {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.remove-text {
  font-size: 0.9rem;
  color: #666;
  transition: color 0.2s ease;
}

.remove-btn:hover .remove-text {
  color: #ff5a5f;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #333;
  margin: 0 0 0.75rem 0;
}

.empty-state p {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.empty-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #ff5a5f;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.empty-btn:hover {
  background: #ff474c;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .favorite-card {
    flex-direction: column;
  }
  
  .property-image {
    width: 100%;
    min-width: 100%;
    height: 180px;
  }
  
  .property-info {
    padding: 1rem;
  }
  
  .remove-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 1rem;
  }
}
</style>
