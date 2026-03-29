<template>
  <div class="skeleton">
    <!-- 图片区域骨架 -->
    <div class="skeleton-image"></div>
    
    <!-- 内容区域骨架 -->
    <div class="skeleton-content">
      <div class="skeleton-line skeleton-line-small"></div>
      <div class="skeleton-line skeleton-line-medium"></div>
      <div class="skeleton-line skeleton-line-small"></div>
      <div class="skeleton-line skeleton-line-large"></div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.skeleton {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.skeleton-image {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-line {
  height: 16px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line-small {
  width: 30%;
}

.skeleton-line-medium {
  width: 60%;
}

.skeleton-line-large {
  width: 100%;
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
  .skeleton {
    margin-bottom: 1rem;
  }
  
  .skeleton-image {
    height: 150px;
  }
  
  .skeleton-content {
    padding: 0.75rem;
  }
}
</style>