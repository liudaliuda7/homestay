<template>
  <router-link :to="`/property/${property.id}`" class="property-card card-hover">
    <div class="card-image">
      <img :src="property.images[0]" :alt="property.title" class="image" />
      <div class="rating">
        <span class="star">⭐</span>
        <span>{{ property.rating }}</span>
        <span>({{ property.reviews }})</span>
      </div>
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
</template>

<script setup>
defineProps({
  property: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.property-card {
  display: block;
  text-decoration: none;
  color: #333;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 1.5rem;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 60%; /* 16:9 宽高比 */
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

.rating {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .property-card {
    margin-bottom: 1rem;
  }
  
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
}
</style>