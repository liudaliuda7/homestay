<template>
  <div class="city-cascader">
    <div class="city-display" @click="toggleDropdown" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
      <span class="city-name">{{ selectedCity }}</span>
      <span class="dropdown-icon">{{ dropdownOpen ? '▲' : '▼' }}</span>
      <div class="tooltip" v-if="showTooltip">{{ selectedCity }}</div>
    </div>
    
    <div class="city-dropdown" v-if="dropdownOpen">
      <div class="cascader-container">
        <div class="cascader-column">
          <div 
            v-for="province in provinces" 
            :key="province.code"
            class="cascader-item"
            :class="{ active: selectedProvinceCode === province.code }"
            @click="selectProvince(province)"
          >
            {{ province.name }}
          </div>
        </div>
        
        <div class="cascader-column" v-if="cities.length > 0">
          <div 
            v-for="city in cities" 
            :key="city.code"
            class="cascader-item"
            :class="{ active: selectedCityCode === city.code }"
            @click="selectCity(city)"
          >
            {{ city.name }}
          </div>
        </div>
        
        <div class="cascader-column" v-if="districts.length > 0">
          <div 
            v-for="district in districts" 
            :key="district.code"
            class="cascader-item"
            :class="{ active: selectedDistrictCode === district.code }"
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
import { ref, onMounted, onUnmounted } from 'vue'

// 响应式状态
const dropdownOpen = ref(false)
const showTooltip = ref(false)
const provinces = ref([])
const cities = ref([])
const districts = ref([])

const selectedProvinceCode = ref('')
const selectedCityCode = ref('')
const selectedDistrictCode = ref('')

// 默认显示北京
const selectedCity = ref('北京')

// 切换下拉菜单
const toggleDropdown = (event) => {
  event.stopPropagation() // 阻止事件冒泡
  dropdownOpen.value = !dropdownOpen.value
  console.log('Dropdown toggled:', dropdownOpen.value) // 调试日志
}

// 点击外部关闭
const handleClickOutside = (event) => {
  const cityCascader = document.querySelector('.city-cascader')
  if (cityCascader && !cityCascader.contains(event.target)) {
    dropdownOpen.value = false
  }
}

// 选择省份
const selectProvince = (province) => {
  selectedProvinceCode.value = province.code
  selectedCityCode.value = ''
  selectedDistrictCode.value = ''
  
  // 获取该省份下的城市
  cities.value = mockCities[province.code] || []
  districts.value = []
}

// 选择城市
const selectCity = (city) => {
  selectedCityCode.value = city.code
  selectedDistrictCode.value = ''
  
  // 获取该城市下的区县
  districts.value = mockDistricts[city.code] || []
}

// 选择区县
const selectDistrict = (district) => {
  selectedDistrictCode.value = district.code
  
  // 查找对应的省市区名称
  const province = provinces.value.find(p => p.code === selectedProvinceCode.value)
  const city = cities.value.find(c => c.code === selectedCityCode.value)
  
  if (province && city && district) {
    selectedCity.value = `${province.name} ${city.name} ${district.name}`
  } else if (province && city) {
    selectedCity.value = `${province.name} ${city.name}`
  } else if (province) {
    selectedCity.value = province.name
  }
  
  dropdownOpen.value = false
}

// 模拟城市数据
const mockProvinces = [
  { code: '110000', name: '北京市' },
  { code: '120000', name: '天津市' },
  { code: '130000', name: '河北省' },
  { code: '140000', name: '山西省' },
  { code: '150000', name: '内蒙古自治区' },
  { code: '210000', name: '辽宁省' },
  { code: '220000', name: '吉林省' },
  { code: '230000', name: '黑龙江省' },
  { code: '310000', name: '上海市' },
  { code: '320000', name: '江苏省' }
]

const mockCities = {
  '110000': [{ code: '110100', name: '北京市' }],
  '310000': [{ code: '310100', name: '上海市' }],
  '320000': [
    { code: '320100', name: '南京市' },
    { code: '320200', name: '无锡市' },
    { code: '320300', name: '徐州市' },
    { code: '320400', name: '常州市' },
    { code: '320500', name: '苏州市' },
    { code: '320600', name: '南通市' }
  ]
}

const mockDistricts = {
  '110100': [
    { code: '110101', name: '东城区' },
    { code: '110102', name: '西城区' },
    { code: '110105', name: '朝阳区' },
    { code: '110106', name: '丰台区' },
    { code: '110107', name: '石景山区' },
    { code: '110108', name: '海淀区' }
  ],
  '310100': [
    { code: '310101', name: '黄浦区' },
    { code: '310104', name: '徐汇区' },
    { code: '310105', name: '长宁区' },
    { code: '310106', name: '静安区' },
    { code: '310107', name: '普陀区' },
    { code: '310109', name: '虹口区' }
  ]
}

// 初始化省份数据
const initProvinces = () => {
  provinces.value = mockProvinces
  
  // 默认选择北京
  const beijingProvince = provinces.value.find(p => p.name === '北京市')
  if (beijingProvince) {
    selectProvince(beijingProvince)
    selectedCity.value = '北京'
  }
}

// 生命周期钩子
onMounted(() => {
  initProvinces()
  document.addEventListener('click', handleClickOutside)
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.city-cascader {
  position: relative;
  display: inline-block;
  z-index: 999999;
  overflow: visible;
}

.city-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: white;
  border: none;
  border-radius: 24px 0 0 24px;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 120px;
  transition: all 0.3s;
}

.city-display:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.city-name {
  color: #333;
  font-weight: 500;
}

.dropdown-icon {
  margin-left: 0.5rem;
  color: #999;
  font-size: 0.8rem;
}

.tooltip {
  position: absolute;
  top: -120%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #333;
}

.city-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 9999999;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 600px;
  overflow: visible;
  margin-top: 8px;
}

.cascader-container {
  display: flex;
  max-height: 400px;
  overflow: hidden;
}

.cascader-column {
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
  border-right: 1px solid #f0f0f0;
}

.cascader-column:last-child {
  border-right: none;
}

.cascader-item {
  padding: 0.5rem;
  cursor: pointer;
  color: #333;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.cascader-item:hover {
  background-color: #f5f5f5;
  color: #ff5a5f;
}

.cascader-item.active {
  background-color: #ff5a5f;
  color: white;
}

.cascader-column::-webkit-scrollbar {
  width: 6px;
}

.cascader-column::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.cascader-column::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.cascader-column::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style>