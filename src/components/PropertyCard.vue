<template>
  <div class="property-card card-hover">
    <div class="card-image-wrapper">
      <router-link :to="`/property/${property.id}`" class="card-link">
        <div class="card-image">
          <img :src="property.images[0]" :alt="property.title" class="image" @error="handleImageError" />
        </div>
        <div class="card-content">
          <div class="location">{{ property.location }}</div>
          <h3 class="title">{{ property.title }}</h3>
          <div class="info">
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
        </div>
      </router-link>
      <div class="top-actions">
        <button class="share-btn" @click="handleShare">
          <span class="share-icon">📤</span>
        </button>
        <div class="rating">
          <span class="star">⭐</span>
          <span>{{ property.rating }}</span>
          <span>({{ property.reviews }})</span>
        </div>
      </div>
    </div>
    
    <SharePanel
      v-model:visible="sharePanelVisible"
      :share-data="shareData"
      share-type="property"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SharePanel from './SharePanel.vue'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const sharePanelVisible = ref(false)

const DEFAULT_PROPERTY_IMAGE = 'https://picsum.photos/seed/default-property/800/600'

const shareData = computed(() => ({
  id: props.property.id,
  title: props.property.title,
  description: props.property.location,
  image: props.property.images?.[0] || DEFAULT_PROPERTY_IMAGE,
  price: props.property.price
}))

const handleImageError = (event) => {
  event.target.src = DEFAULT_PROPERTY_IMAGE
}

const handleShare = () => {
  sharePanelVisible.value = true
}
</script>

<style scoped>
.property-card {
  position: relative;
  display: block;
  text-decoration: none;
  color: #333;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.card-image-wrapper {
  position: relative;
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 60%;
  overflow: hidden;
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.property-card:hover .image {
  transform: scale(1.05);
}

.top-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.share-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.share-btn:hover {
  background-color: #ff5a5f;
  transform: scale(1.1);
}

.share-btn:hover .share-icon {
  color: white;
}

.share-icon {
  font-size: 1rem;
  color: #666;
  transition: color 0.2s ease;
}

.rating {
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

.card-content {
  padding: 1rem;
}

.location {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.info {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
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
  font-size: 1.1rem;
  color: #ff5a5f;
}

.price-unit {
  font-size: 0.85rem;
  color: #666;
}

@media (max-width: 768px) {
  
  .card-content {
    padding: 0.75rem;
  }
  
  .title {
    font-size: 1rem;
  }
  
  .rating {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
  
  .share-btn {
    width: 28px;
    height: 28px;
  }
  
  .share-icon {
    font-size: 0.9rem;
  }
}
</style>
