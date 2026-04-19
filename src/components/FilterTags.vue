<template>
  <div class="filter-tags" v-if="hasActiveFilters">
    <span class="tags-label">已选筛选：</span>
    <div class="tags-list">
      <el-tag 
        v-if="hasPriceFilter"
        closable
        @close="removePriceFilter"
        type="danger"
        effect="light"
      >
        ¥{{ filters.minPrice }} - ¥{{ filters.maxPrice }}
      </el-tag>
      
      <el-tag 
        v-if="filters.bedrooms > 0"
        closable
        @close="removeBedroomsFilter"
        type="danger"
        effect="light"
      >
        {{ filters.bedrooms >= 3 ? '3室+' : filters.bedrooms + '室' }}
      </el-tag>
      
      <el-tag 
        v-if="filters.bathrooms > 0"
        closable
        @close="removeBathroomsFilter"
        type="danger"
        effect="light"
      >
        {{ filters.bathrooms >= 3 ? '3卫+' : filters.bathrooms + '卫' }}
      </el-tag>
      
      <el-tag 
        v-if="filters.beds > 0"
        closable
        @close="removeBedsFilter"
        type="danger"
        effect="light"
      >
        {{ filters.beds >= 3 ? '3床+' : filters.beds + '床' }}
      </el-tag>
      
      <el-tag 
        v-if="filters.rating > 0"
        closable
        @close="removeRatingFilter"
        type="danger"
        effect="light"
      >
        {{ filters.rating }}分以上
      </el-tag>
      
      <el-tag 
        v-for="amenity in filters.amenities" 
        :key="amenity"
        closable
        @close="removeAmenity(amenity)"
        type="danger"
        effect="light"
      >
        {{ amenity }}
      </el-tag>
    </div>
    
    <button class="clear-all-btn" @click="clearAll">
      清除全部
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters'])

const hasPriceFilter = computed(() => {
  return props.filters.minPrice > 0 || props.filters.maxPrice < 2000
})

const hasActiveFilters = computed(() => {
  return hasPriceFilter.value ||
         props.filters.bedrooms > 0 ||
         props.filters.bathrooms > 0 ||
         props.filters.beds > 0 ||
         props.filters.rating > 0 ||
         (props.filters.amenities && props.filters.amenities.length > 0)
})

const removePriceFilter = () => {
  emit('update:filters', {
    ...props.filters,
    minPrice: 0,
    maxPrice: 2000
  })
}

const removeBedroomsFilter = () => {
  emit('update:filters', { ...props.filters, bedrooms: 0 })
}

const removeBathroomsFilter = () => {
  emit('update:filters', { ...props.filters, bathrooms: 0 })
}

const removeBedsFilter = () => {
  emit('update:filters', { ...props.filters, beds: 0 })
}

const removeRatingFilter = () => {
  emit('update:filters', { ...props.filters, rating: 0 })
}

const removeAmenity = (amenity) => {
  const newAmenities = props.filters.amenities.filter(a => a !== amenity)
  emit('update:filters', { ...props.filters, amenities: newAmenities })
}

const clearAll = () => {
  emit('update:filters', {
    minPrice: 0,
    maxPrice: 2000,
    bedrooms: 0,
    bathrooms: 0,
    beds: 0,
    rating: 0,
    amenities: [],
    keyword: props.filters.keyword
  })
}
</script>

<style scoped>
.filter-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: var(--background-primary, #ffffff);
  border-radius: var(--radius-lg, 12px);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.05));
}

.tags-label {
  font-size: 0.9rem;
  color: var(--text-secondary, #666666);
  font-weight: 500;
  white-space: nowrap;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.clear-all-btn {
  background: none;
  border: none;
  color: var(--primary-color, #ff5a5f);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;
  transition: color var(--transition-normal, 0.3s ease);
}

.clear-all-btn:hover {
  color: var(--primary-color-hover, #e54e53);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .filter-tags {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .tags-label {
    margin-bottom: 0.25rem;
  }
  
  .clear-all-btn {
    align-self: flex-end;
    margin-top: 0.25rem;
  }
}
</style>
