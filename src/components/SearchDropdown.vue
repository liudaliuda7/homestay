<template>
  <div 
    v-if="visible" 
    class="search-dropdown"
    ref="dropdownRef"
  >
    <div class="loading-container" v-if="isLoading">
      <div class="loading-spinner"></div>
      <span class="loading-text">搜索中...</span>
    </div>

    <TransitionGroup name="list" tag="div" class="suggestions-list" v-else-if="suggestions.length > 0">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion.keyword + '-' + index"
        class="suggestion-item"
        :class="{ active: selectedIndex === index }"
        @click="handleSuggestionClick(suggestion)"
        @mouseenter="selectedIndex = index"
      >
        <span class="suggestion-icon">
          <template v-if="suggestion.type === 'title'">🏠</template>
          <template v-else-if="suggestion.type === 'location'">📍</template>
          <template v-else-if="suggestion.type === 'amenity'">✨</template>
        </span>
        <span 
          class="suggestion-text"
          v-html="highlightedSuggestion(suggestion.keyword)"
        ></span>
        <span class="suggestion-type">{{ getSuggestionTypeLabel(suggestion.type) }}</span>
      </div>
    </TransitionGroup>

    <div v-else-if="hasInput" class="empty-result-section">
      <div class="empty-result">
        <span class="empty-result-icon">🔍</span>
        <span class="empty-result-text">未找到相关房源</span>
      </div>
      
      <div class="hot-section" v-if="hotSearches.length > 0">
        <div class="section-header">
          <span class="section-title">🔥 热门搜索</span>
        </div>
        <div class="tags-list">
          <div
            v-for="(item, index) in hotSearches"
            :key="item.keyword + '-' + index"
            class="hot-tag"
            :class="{ 
              active: selectedIndex === index,
              'top-three': index < 3
            }"
            @click="handleHotClick(item.keyword)"
            @mouseenter="selectedIndex = index"
          >
            <span class="hot-rank" v-if="index < 3">{{ index + 1 }}</span>
            <span class="hot-text">{{ item.keyword }}</span>
            <span class="hot-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="history-section" v-else-if="searchHistory.length > 0">
      <div class="section-header">
        <span class="section-title">搜索历史</span>
        <button class="clear-btn" @click="handleClearHistory">
          <span>🗑️</span>
          <span>清空</span>
        </button>
      </div>
      <div class="tags-list">
        <div
          v-for="(item, index) in searchHistory"
          :key="item.keyword + '-' + index"
          class="history-tag"
          :class="{ active: selectedIndex === index }"
          @click="handleHistoryClick(item.keyword)"
          @mouseenter="selectedIndex = index"
        >
          <span class="history-icon">🕐</span>
          <span class="history-text">{{ item.keyword }}</span>
          <button 
            class="remove-btn"
            @click.stop="handleRemoveHistory(item.keyword)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <div class="hot-section" v-else-if="hotSearches.length > 0">
      <div class="section-header">
        <span class="section-title">🔥 热门搜索</span>
      </div>
      <div class="tags-list">
        <div
          v-for="(item, index) in hotSearches"
          :key="item.keyword + '-' + index"
          class="hot-tag"
          :class="{ 
            active: selectedIndex === index,
            'top-three': index < 3
          }"
          @click="handleHotClick(item.keyword)"
          @mouseenter="selectedIndex = index"
        >
          <span class="hot-rank" v-if="index < 3">{{ index + 1 }}</span>
          <span class="hot-text">{{ item.keyword }}</span>
          <span class="hot-count">{{ item.count }}</span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <span class="empty-icon">🔍</span>
      <span class="empty-text">开始搜索吧</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  getSearchHistory, 
  getHotSearches, 
  getSuggestions, 
  highlightText,
  clearSearchHistory,
  removeFromSearchHistory,
  debounce
} from '../data/search';
import { properties } from '../data/properties';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  searchKeyword: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select', 'update:searchKeyword', 'loadingChange']);

const dropdownRef = ref(null);
const searchHistory = ref([]);
const hotSearches = ref([]);
const suggestions = ref([]);
const selectedIndex = ref(-1);
const isLoading = ref(false);

const hasInput = computed(() => props.searchKeyword && props.searchKeyword.trim() !== '');

const loadData = () => {
  searchHistory.value = getSearchHistory();
  hotSearches.value = getHotSearches();
};

const fetchSuggestions = (keyword) => {
  if (!keyword || keyword.trim() === '') {
    suggestions.value = [];
    selectedIndex.value = -1;
    isLoading.value = false;
    emit('loadingChange', false);
    return;
  }
  
  isLoading.value = true;
  emit('loadingChange', true);
  
  suggestions.value = getSuggestions(keyword.trim(), properties);
  selectedIndex.value = suggestions.value.length > 0 ? 0 : 0;
  
  isLoading.value = false;
  emit('loadingChange', false);
};

const debouncedFetchSuggestions = debounce((keyword) => {
  fetchSuggestions(keyword);
}, 300);

watch(
  () => props.searchKeyword,
  (newKeyword) => {
    debouncedFetchSuggestions(newKeyword);
  }
);

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      loadData();
      selectedIndex.value = -1;
    }
  }
);

const highlightedSuggestion = (text) => {
  return highlightText(text, props.searchKeyword);
};

const getSuggestionTypeLabel = (type) => {
  const labels = {
    title: '房源',
    location: '位置',
    amenity: '设施'
  };
  return labels[type] || type;
};

const handleSuggestionClick = (suggestion) => {
  emit('update:searchKeyword', suggestion.keyword);
  emit('select', suggestion.keyword);
};

const handleHistoryClick = (keyword) => {
  emit('update:searchKeyword', keyword);
  emit('select', keyword);
};

const handleHotClick = (keyword) => {
  emit('update:searchKeyword', keyword);
  emit('select', keyword);
};

const handleRemoveHistory = (keyword) => {
  removeFromSearchHistory(keyword);
  loadData();
  ElMessage({
    message: '已删除搜索记录',
    type: 'success',
    duration: 1500
  });
};

const handleClearHistory = () => {
  clearSearchHistory();
  loadData();
  ElMessage({
    message: '已清空搜索历史',
    type: 'success',
    duration: 1500
  });
};

const handleKeyDown = (event) => {
  if (!props.visible) return;
  
  let items = [];
  
  if (isLoading.value) {
    return;
  }
  
  if (hasInput.value) {
    if (suggestions.value.length > 0) {
      items = suggestions.value;
    } else if (hotSearches.value.length > 0) {
      items = hotSearches.value;
    }
  } else {
    if (searchHistory.value.length > 0) {
      items = searchHistory.value;
    } else if (hotSearches.value.length > 0) {
      items = hotSearches.value;
    }
  }
  
  const maxIndex = items.length - 1;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (selectedIndex.value < maxIndex) {
        selectedIndex.value++;
      } else {
        selectedIndex.value = -1;
      }
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
      } else if (selectedIndex.value === -1) {
        selectedIndex.value = maxIndex;
      } else {
        selectedIndex.value = -1;
      }
      break;
      
    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value >= 0 && selectedIndex.value <= maxIndex) {
        if (hasInput.value && suggestions.value.length > 0 && suggestions.value[selectedIndex.value]) {
          handleSuggestionClick(suggestions.value[selectedIndex.value]);
        } else if (searchHistory.value.length > 0 && searchHistory.value[selectedIndex.value]) {
          handleHistoryClick(searchHistory.value[selectedIndex.value].keyword);
        } else if (hotSearches.value.length > 0 && hotSearches.value[selectedIndex.value]) {
          handleHotClick(hotSearches.value[selectedIndex.value].keyword);
        }
      } else if (hasInput.value) {
        emit('select', props.searchKeyword);
      }
      break;
      
    case 'Escape':
      event.preventDefault();
      emit('close');
      break;
  }
};

onMounted(() => {
  loadData();
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

defineExpose({
  loadData,
  handleKeyDown
});
</script>

<style scoped>
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  padding: 12px 0;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #ff5a5f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.9rem;
  color: #666;
}

.suggestions-list {
  padding: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #fff5f5;
}

.suggestion-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-type {
  font-size: 0.75rem;
  color: #999;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.highlight {
  color: #ff5a5f;
  font-weight: 600;
}

.empty-result-section {
  padding: 8px 0;
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  gap: 8px;
}

.empty-result-icon {
  font-size: 1.5rem;
  opacity: 0.5;
}

.empty-result-text {
  font-size: 0.85rem;
  color: #999;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #999;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  color: #ff5a5f;
  background-color: #fff5f5;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 4px;
}

.history-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.history-tag:hover,
.history-tag.active {
  background: #fff5f5;
  border-color: #ff5a5f;
}

.history-icon {
  font-size: 0.85rem;
}

.history-text {
  font-size: 0.85rem;
  color: #333;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ddd;
  border: none;
  font-size: 0.65rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ff5a5f;
  color: white;
}

.hot-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ffe0e0;
}

.hot-tag:hover,
.hot-tag.active {
  background: linear-gradient(135deg, #ffe0e0 0%, #fff5f5 100%);
  border-color: #ff5a5f;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 90, 95, 0.2);
}

.hot-tag.top-three {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7878 100%);
  border-color: #ff5a5f;
}

.hot-tag.top-three .hot-text,
.hot-tag.top-three .hot-rank {
  color: white;
}

.hot-tag.top-three .hot-count {
  color: rgba(255, 255, 255, 0.8);
}

.hot-tag.top-three:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);
}

.hot-rank {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff5a5f;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.hot-text {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
}

.hot-count {
  font-size: 0.7rem;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  gap: 8px;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.9rem;
  color: #999;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.history-section {
  padding-bottom: 8px;
}

.hot-section {
  padding-bottom: 4px;
}

@media (max-width: 768px) {
  .search-dropdown {
    border-radius: 12px;
    margin-top: 4px;
  }
  
  .suggestion-item {
    padding: 10px 16px;
  }
  
  .tags-list {
    padding: 0 16px 4px;
  }
  
  .section-header {
    padding: 8px 16px;
  }
}
</style>
