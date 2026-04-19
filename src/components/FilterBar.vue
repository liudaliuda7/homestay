<template>
  <div class="filter-bar">
    <div class="filter-row">
      <div class="filter-item">
        <span class="filter-label">价格：</span>
        <el-select 
          v-model="priceSelect" 
          placeholder="选择价格区间" 
          size="default"
          @change="handlePriceChange"
          clearable
          style="width: 150px;"
        >
          <el-option
            v-for="item in PRICE_SELECT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      
      <div class="filter-item">
        <span class="filter-label">卧室：</span>
        <el-select 
          v-model="filters.bedrooms" 
          placeholder="选择卧室数量" 
          size="default"
          @change="emitUpdate"
          clearable
          style="width: 130px;"
        >
          <el-option
            v-for="item in BEDROOM_SELECT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      
      <div class="filter-item">
        <span class="filter-label">卫生间：</span>
        <el-select 
          v-model="filters.bathrooms" 
          placeholder="选择卫生间数量" 
          size="default"
          @change="emitUpdate"
          clearable
          style="width: 130px;"
        >
          <el-option
            v-for="item in BATHROOM_SELECT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      
      <div class="filter-item">
        <span class="filter-label">床位：</span>
        <el-select 
          v-model="filters.beds" 
          placeholder="选择床位数" 
          size="default"
          @change="emitUpdate"
          clearable
          style="width: 130px;"
        >
          <el-option
            v-for="item in BEDS_SELECT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      
      <div class="filter-item">
        <span class="filter-label">评分：</span>
        <el-select 
          v-model="filters.rating" 
          placeholder="选择评分" 
          size="default"
          @change="emitUpdate"
          clearable
          style="width: 130px;"
        >
          <el-option
            v-for="item in RATING_SELECT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      
      <div class="filter-item">
        <span class="filter-label">设施：</span>
        <el-select
          v-model="filters.amenities"
          multiple
          filterable
          allow-create
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择设施"
          size="default"
          @change="emitUpdate"
          style="width: 200px;"
        >
          <el-option
            v-for="item in AMENITIES_SELECT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      
      <el-button 
        type="danger" 
        size="default"
        :icon="Refresh"
        @click="clearFilters"
      >
        重置筛选
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import {
  PRICE_SELECT_OPTIONS,
  BEDROOM_SELECT_OPTIONS,
  BATHROOM_SELECT_OPTIONS,
  BEDS_SELECT_OPTIONS,
  RATING_SELECT_OPTIONS,
  AMENITIES_SELECT_OPTIONS,
  getPriceOptionByKey,
  getPriceKeyByRange
} from '../data/filter'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters'])

const priceSelect = ref('unlimited')

// 监听 filters 变化，同步价格选择
watch(
  () => [props.filters.minPrice, props.filters.maxPrice],
  ([min, max]) => {
    priceSelect.value = getPriceKeyByRange(min, max)
  },
  { immediate: true, deep: true }
)

const emitUpdate = () => {
  emit('update:filters', { ...props.filters })
}

const handlePriceChange = (val) => {
  const option = getPriceOptionByKey(val)
  emit('update:filters', {
    ...props.filters,
    minPrice: option.min,
    maxPrice: option.max
  })
}

const clearFilters = () => {
  priceSelect.value = 'unlimited'
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
.filter-bar {
  background-color: var(--background-primary, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.05));
  margin-bottom: 1.5rem;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  color: var(--text-secondary, #666666);
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .filter-row {
    gap: 0.75rem;
  }
  
  .filter-item {
    gap: 0.25rem;
  }
  
  .filter-label {
    font-size: 0.85rem;
  }
}

@media (max-width: 992px) {
  .filter-bar {
    padding: 1rem;
  }
  
  .filter-row {
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .filter-bar {
    padding: 0.75rem;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .filter-item {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-label {
    width: 60px;
    flex-shrink: 0;
  }
  
  .filter-item :deep(.el-select) {
    flex: 1;
    max-width: none !important;
  }
  
  .filter-item:last-child {
    margin-top: 0.5rem;
    justify-content: flex-end;
  }
}
</style>
