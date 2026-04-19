<template>
  <div class="filter-panel">
    <div class="filter-section">
      <h3 class="filter-title">价格区间</h3>
      
      <div class="price-options">
        <button 
          v-for="option in PRICE_OPTIONS" 
          :key="option.label"
          class="price-option-btn"
          :class="{ active: isPriceOptionActive(option) }"
          @click="selectPriceOption(option)"
        >
          {{ option.label }}
        </button>
      </div>
      
      <div class="price-slider">
        <el-slider
          v-model="priceRange"
          range
          :min="0"
          :max="2000"
          :step="10"
          :format-tooltip="formatPrice"
          :debounce="300"
          @change="handlePriceSliderChange"
        />
      </div>
      
      <div class="price-inputs">
        <span class="price-prefix">¥</span>
        <el-input-number
          v-model="minPrice"
          :min="0"
          :max="maxPrice"
          :step="10"
          size="small"
          controls-position="right"
          @change="handlePriceInputChange"
        />
        <span class="price-separator">-</span>
        <span class="price-prefix">¥</span>
        <el-input-number
          v-model="maxPrice"
          :min="minPrice"
          :max="2000"
          :step="10"
          size="small"
          controls-position="right"
          @change="handlePriceInputChange"
        />
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">卧室数量</h3>
      <div class="room-options">
        <button 
          v-for="option in ROOM_OPTIONS" 
          :key="'bedroom-' + option.value"
          class="room-btn"
          :class="{ active: bedrooms === option.value }"
          @click="updateBedrooms(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">卫生间数量</h3>
      <div class="room-options">
        <button 
          v-for="option in ROOM_OPTIONS" 
          :key="'bathroom-' + option.value"
          class="room-btn"
          :class="{ active: bathrooms === option.value }"
          @click="updateBathrooms(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">床位数</h3>
      <div class="room-options">
        <button 
          v-for="option in ROOM_OPTIONS" 
          :key="'beds-' + option.value"
          class="room-btn"
          :class="{ active: beds === option.value }"
          @click="updateBeds(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">房源评分</h3>
      <div class="rating-options">
        <button 
          v-for="option in RATING_OPTIONS" 
          :key="'rating-' + option.value"
          class="rating-btn"
          :class="{ active: rating === option.value }"
          @click="updateRating(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">房屋设施</h3>
      <div class="amenities-list">
        <el-checkbox-group v-model="amenities" @change="handleAmenitiesChange">
          <div class="amenities-grid">
            <el-checkbox
              v-for="amenity in displayedAmenities"
              :key="amenity"
              :label="amenity"
              class="amenity-checkbox"
            >
              {{ amenity }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      
      <button 
        v-if="AMENITIES_LIST.length > 6"
        class="toggle-more-btn"
        @click="showAllAmenities = !showAllAmenities"
      >
        {{ showAllAmenities ? '收起' : '更多' }}
        <span :class="{ rotated: showAllAmenities }">▼</span>
      </button>
    </div>
    
    <div class="filter-actions">
      <button class="clear-btn" @click="clearFilters">清除筛选</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  AMENITIES_LIST, 
  PRICE_OPTIONS, 
  RATING_OPTIONS, 
  ROOM_OPTIONS 
} from '../data/filter'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters'])

const showAllAmenities = ref(false)
const priceRange = ref([0, 2000])

const minPrice = computed({
  get: () => props.filters.minPrice || 0,
  set: (val) => emit('update:filters', { ...props.filters, minPrice: val })
})

const maxPrice = computed({
  get: () => props.filters.maxPrice || 2000,
  set: (val) => emit('update:filters', { ...props.filters, maxPrice: val })
})

const bedrooms = computed({
  get: () => props.filters.bedrooms || 0,
  set: (val) => emit('update:filters', { ...props.filters, bedrooms: val })
})

const bathrooms = computed({
  get: () => props.filters.bathrooms || 0,
  set: (val) => emit('update:filters', { ...props.filters, bathrooms: val })
})

const beds = computed({
  get: () => props.filters.beds || 0,
  set: (val) => emit('update:filters', { ...props.filters, beds: val })
})

const rating = computed({
  get: () => props.filters.rating || 0,
  set: (val) => emit('update:filters', { ...props.filters, rating: val })
})

const amenities = computed({
  get: () => props.filters.amenities || [],
  set: (val) => emit('update:filters', { ...props.filters, amenities: val })
})

const displayedAmenities = computed(() => {
  if (showAllAmenities.value) {
    return AMENITIES_LIST
  }
  return AMENITIES_LIST.slice(0, 6)
})

watch(() => [props.filters.minPrice, props.filters.maxPrice], ([min, max]) => {
  priceRange.value = [min || 0, max || 2000]
}, { immediate: true })

const formatPrice = (val) => `¥${val}`

const isPriceOptionActive = (option) => {
  return props.filters.minPrice === option.value[0] && 
         props.filters.maxPrice === option.value[1]
}

const selectPriceOption = (option) => {
  emit('update:filters', {
    ...props.filters,
    minPrice: option.value[0],
    maxPrice: option.value[1]
  })
}

const handlePriceSliderChange = (val) => {
  emit('update:filters', {
    ...props.filters,
    minPrice: val[0],
    maxPrice: val[1]
  })
}

const handlePriceInputChange = () => {
  priceRange.value = [minPrice.value, maxPrice.value]
}

const updateBedrooms = (val) => {
  emit('update:filters', { ...props.filters, bedrooms: val })
}

const updateBathrooms = (val) => {
  emit('update:filters', { ...props.filters, bathrooms: val })
}

const updateBeds = (val) => {
  emit('update:filters', { ...props.filters, beds: val })
}

const updateRating = (val) => {
  emit('update:filters', { ...props.filters, rating: val })
}

const handleAmenitiesChange = (val) => {
  emit('update:filters', { ...props.filters, amenities: val })
}

const clearFilters = () => {
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
.filter-panel {
  background-color: var(--background-primary, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));
  width: 280px;
  flex-shrink: 0;
}

.filter-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color-light, #f0f0f0);
}

.filter-section:last-of-type {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.filter-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #333333);
  margin: 0 0 1rem 0;
}

.price-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.price-option-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: var(--radius-full, 9999px);
  background-color: var(--background-primary, #ffffff);
  font-size: 0.85rem;
  color: var(--text-secondary, #666666);
  cursor: pointer;
  transition: all var(--transition-normal, 0.3s ease);
}

.price-option-btn:hover {
  border-color: var(--primary-color, #ff5a5f);
  color: var(--primary-color, #ff5a5f);
}

.price-option-btn.active {
  background-color: var(--primary-color, #ff5a5f);
  border-color: var(--primary-color, #ff5a5f);
  color: #ffffff;
}

.price-slider {
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.price-prefix {
  font-size: 0.85rem;
  color: var(--text-secondary, #666666);
  margin-right: 0.2rem;
}

.price-separator {
  color: var(--text-muted, #999999);
  margin: 0 0.3rem;
}

.room-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.room-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  background-color: var(--background-primary, #ffffff);
  font-size: 0.85rem;
  color: var(--text-secondary, #666666);
  cursor: pointer;
  transition: all var(--transition-normal, 0.3s ease);
  flex: 1;
  min-width: 60px;
}

.room-btn:hover {
  border-color: var(--primary-color, #ff5a5f);
  color: var(--primary-color, #ff5a5f);
}

.room-btn.active {
  background-color: var(--primary-color, #ff5a5f);
  border-color: var(--primary-color, #ff5a5f);
  color: #ffffff;
}

.rating-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rating-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  background-color: var(--background-primary, #ffffff);
  font-size: 0.85rem;
  color: var(--text-secondary, #666666);
  cursor: pointer;
  transition: all var(--transition-normal, 0.3s ease);
  flex: 1;
  min-width: 70px;
}

.rating-btn:hover {
  border-color: var(--primary-color, #ff5a5f);
  color: var(--primary-color, #ff5a5f);
}

.rating-btn.active {
  background-color: var(--primary-color, #ff5a5f);
  border-color: var(--primary-color, #ff5a5f);
  color: #ffffff;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.amenity-checkbox {
  font-size: 0.85rem;
  color: var(--text-secondary, #666666);
  margin: 0;
}

:deep(.amenity-checkbox .el-checkbox__label) {
  font-size: 0.85rem;
  padding-left: 6px;
}

.toggle-more-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  color: var(--primary-color, #ff5a5f);
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 0.75rem;
  padding: 0;
}

.toggle-more-btn span {
  transition: transform 0.3s ease;
  font-size: 0.7rem;
}

.toggle-more-btn span.rotated {
  transform: rotate(180deg);
}

.filter-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color-light, #f0f0f0);
}

.clear-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  background-color: var(--background-primary, #ffffff);
  font-size: 0.9rem;
  color: var(--text-secondary, #666666);
  cursor: pointer;
  transition: all var(--transition-normal, 0.3s ease);
}

.clear-btn:hover {
  border-color: var(--text-muted, #999999);
  color: var(--text-primary, #333333);
}

@media (max-width: 1024px) {
  .filter-panel {
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  .amenities-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-panel {
    padding: 1rem;
  }
  
  .amenities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .room-btn, .rating-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
