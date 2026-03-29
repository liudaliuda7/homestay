<template>
  <div class="city-cascade" ref="cascadeRef">
    <div class="city-selector" @click="toggleDropdown" :title="tooltipText">
      <span class="selected-text">{{ selectedText }}</span>
      <span class="dropdown-icon" :class="{ 'open': isOpen }">▼</span>
    </div>
    
    <div class="dropdown-panel" v-if="isOpen" @click.stop>
      <div class="tabs">
        <button 
          class="tab" 
          :class="{ active: activeTab === 'province' }"
          @click="activeTab = 'province'"
        >
          {{ selectedProvince ? selectedProvince.name : '省份' }}
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'city', disabled: !selectedProvince }"
          @click="selectedProvince && (activeTab = 'city')"
          :disabled="!selectedProvince"
        >
          {{ selectedCity ? selectedCity.name : '城市' }}
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'district', disabled: !selectedCity }"
          @click="selectedCity && (activeTab = 'district')"
          :disabled="!selectedCity"
        >
          {{ selectedDistrict ? selectedDistrict.name : '区县' }}
        </button>
      </div>
      
      <div class="options-container">
        <!-- 省份选项 -->
        <div class="options" v-if="activeTab === 'province'">
          <div 
            v-for="province in provinces" 
            :key="province.code"
            class="option"
            :class="{ selected: selectedProvince && selectedProvince.code === province.code }"
            @click="selectProvince(province)"
          >
            {{ province.name }}
          </div>
        </div>
        
        <!-- 城市选项 -->
        <div class="options" v-if="activeTab === 'city'">
          <div 
            v-for="city in cities" 
            :key="city.code"
            class="option"
            :class="{ selected: selectedCity && selectedCity.code === city.code }"
            @click="selectCity(city)"
          >
            {{ city.name }}
          </div>
        </div>
        
        <!-- 区县选项 -->
        <div class="options" v-if="activeTab === 'district'">
          <div 
            v-for="district in districts" 
            :key="district.code"
            class="option"
            :class="{ selected: selectedDistrict && selectedDistrict.code === district.code }"
            @click="selectDistrict(district)"
          >
            {{ district.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import cityService from '../services/cityService.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      province: null,
      city: null,
      district: null
    })
  },
  defaultValue: {
    type: Object,
    default: () => ({
      province: { code: '110000', name: '北京市' },
      city: { code: '110100', name: '北京市' },
      district: { code: '110105', name: '朝阳区' }
    })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const activeTab = ref('province')
const provinces = ref([])
const cities = ref([])
const districts = ref([])
const cascadeRef = ref(null)

const selectedProvince = ref(props.modelValue.province || props.defaultValue.province)
const selectedCity = ref(props.modelValue.city || props.defaultValue.city)
const selectedDistrict = ref(props.modelValue.district || props.defaultValue.district)

const selectedText = computed(() => {
  if (selectedDistrict.value) {
    return `${selectedProvince.value.name} ${selectedCity.value.name} ${selectedDistrict.value.name}`
  } else if (selectedCity.value) {
    return `${selectedProvince.value.name} ${selectedCity.value.name}`
  } else if (selectedProvince.value) {
    return selectedProvince.value.name
  }
  return '选择城市'
})

const tooltipText = computed(() => {
  if (selectedDistrict.value) {
    return `${selectedProvince.value.name} - ${selectedCity.value.name} - ${selectedDistrict.value.name}`
  } else if (selectedCity.value) {
    return `${selectedProvince.value.name} - ${selectedCity.value.name}`
  } else if (selectedProvince.value) {
    return selectedProvince.value.name
  }
  return '请选择城市'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    loadProvinces()
    updateActiveTab()
  }
}

const updateActiveTab = () => {
  if (selectedDistrict.value) {
    activeTab.value = 'district'
  } else if (selectedCity.value) {
    activeTab.value = 'city'
  } else {
    activeTab.value = 'province'
  }
}

const loadProvinces = async () => {
  provinces.value = await cityService.getProvinces()
  if (selectedProvince.value) {
    await loadCities(selectedProvince.value.code)
  }
}

const loadCities = async (provinceCode) => {
  cities.value = await cityService.getCitiesByProvince(provinceCode)
  if (selectedCity.value && cities.value.some(city => city.code === selectedCity.value.code)) {
    await loadDistricts(selectedCity.value.code)
  } else {
    districts.value = []
  }
}

const loadDistricts = async (cityCode) => {
  districts.value = await cityService.getDistrictsByCity(cityCode)
}

const selectProvince = async (province) => {
  selectedProvince.value = province
  selectedCity.value = null
  selectedDistrict.value = null
  cities.value = []
  districts.value = []
  
  await loadCities(province.code)
  activeTab.value = 'city'
  
  emitChange()
}

const selectCity = async (city) => {
  selectedCity.value = city
  selectedDistrict.value = null
  districts.value = []
  
  await loadDistricts(city.code)
  activeTab.value = 'district'
  
  emitChange()
}

const selectDistrict = (district) => {
  selectedDistrict.value = district
  isOpen.value = false
  emitChange()
}

const emitChange = () => {
  const location = {
    province: selectedProvince.value,
    city: selectedCity.value,
    district: selectedDistrict.value
  }
  emit('update:modelValue', location)
  emit('change', location)
}

const handleClickOutside = (event) => {
  if (cascadeRef.value && !cascadeRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

watch(() => props.modelValue, (newValue) => {
  selectedProvince.value = newValue.province
  selectedCity.value = newValue.city
  selectedDistrict.value = newValue.district
}, { deep: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 初始化默认值
  if (props.defaultValue && !props.modelValue.province) {
    selectedProvince.value = props.defaultValue.province
    selectedCity.value = props.defaultValue.city
    selectedDistrict.value = props.defaultValue.district
    emitChange()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.city-cascade {
  position: relative;
  display: inline-block;
  width: 100%;
}

.city-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.city-selector:hover {
  border-color: #ff5a5f;
  background-color: #f8f8f8;
}

.city-selector[title]:hover::after {
  content: attr(title);
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  background-color: #333;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10000;
  margin-left: 8px;
  opacity: 0;
  animation: tooltipFadeIn 0.3s ease-in-out 0.5s forwards;
  pointer-events: none;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.selected-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  margin-left: 8px;
  font-size: 12px;
  transition: transform 0.3s;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  margin-top: 8px;
  min-width: 320px;
  max-width: 400px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #ff5a5f;
  border-bottom-color: #ff5a5f;
}

.tab:hover:not(.disabled) {
  color: #ff5a5f;
}

.tab.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.options-container {
  max-height: 300px;
  overflow-y: auto;
}

.options {
  padding: 8px 0;
}

.option {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.option:hover {
  background-color: #f5f5f5;
}

.option.selected {
  background-color: #fff5f5;
  color: #ff5a5f;
  font-weight: 500;
}

/* 滚动条样式 */
.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.options-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .city-cascade {
    min-width: 150px;
  }
  
  .dropdown-panel {
    min-width: 250px;
  }
  
  .tab {
    font-size: 13px;
    padding: 10px 6px;
  }
  
  .option {
    font-size: 13px;
    padding: 8px 12px;
  }
}
</style>