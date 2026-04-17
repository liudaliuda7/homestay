<template>
  <div class="city-cascader" ref="cascaderRef">
    <div 
      class="city-display" 
      @click="toggleDropdown"
      :class="{ 'is-open': dropdownOpen }"
    >
      <span class="city-name">{{ displayText }}</span>
      <span class="dropdown-icon" :class="{ 'rotated': dropdownOpen }">▼</span>
    </div>
    
    <Transition name="dropdown">
      <div class="city-dropdown" v-if="dropdownOpen">
        <div class="cascader-container">
          <div class="cascader-column">
            <div class="column-title">选择省份</div>
            <TransitionGroup name="list">
              <div 
                v-for="province in provinces" 
                :key="province.code"
                class="cascader-item"
                :class="{ active: selectedProvinceCode === province.code }"
                @click="selectProvince(province)"
              >
                <span class="item-text">{{ province.name }}</span>
                <span v-if="mockCities[province.code]?.length > 0" class="item-arrow">›</span>
              </div>
            </TransitionGroup>
          </div>
          
          <div class="cascader-column" v-if="cities.length > 0">
            <div class="column-title">选择城市</div>
            <TransitionGroup name="list">
              <div 
                v-for="city in cities" 
                :key="city.code"
                class="cascader-item"
                :class="{ active: selectedCityCode === city.code }"
                @click="selectCity(city)"
              >
                <span class="item-text">{{ city.name }}</span>
                <span v-if="mockDistricts[city.code]?.length > 0" class="item-arrow">›</span>
              </div>
            </TransitionGroup>
          </div>
          
          <div class="cascader-column" v-if="districts.length > 0">
            <div class="column-title">选择区县</div>
            <TransitionGroup name="list">
              <div 
                v-for="district in districts" 
                :key="district.code"
                class="cascader-item"
                :class="{ active: selectedDistrictCode === district.code }"
                @click="selectDistrict(district)"
              >
                <span class="item-text">{{ district.name }}</span>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const cascaderRef = ref(null)
const dropdownOpen = ref(false)

const provinces = ref([])
const cities = ref([])
const districts = ref([])

const selectedProvinceCode = ref('')
const selectedCityCode = ref('')
const selectedDistrictCode = ref('')

const selectedProvinceName = ref('')
const selectedCityName = ref('')
const selectedDistrictName = ref('')

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
  { code: '320000', name: '江苏省' },
  { code: '330000', name: '浙江省' },
  { code: '340000', name: '安徽省' },
  { code: '350000', name: '福建省' },
  { code: '360000', name: '江西省' },
  { code: '370000', name: '山东省' },
  { code: '410000', name: '河南省' },
  { code: '420000', name: '湖北省' },
  { code: '430000', name: '湖南省' },
  { code: '440000', name: '广东省' },
  { code: '450000', name: '广西壮族自治区' },
  { code: '460000', name: '海南省' },
  { code: '500000', name: '重庆市' },
  { code: '510000', name: '四川省' },
  { code: '520000', name: '贵州省' },
  { code: '530000', name: '云南省' },
  { code: '610000', name: '陕西省' },
  { code: '620000', name: '甘肃省' },
  { code: '630000', name: '青海省' },
  { code: '640000', name: '宁夏回族自治区' },
  { code: '650000', name: '新疆维吾尔自治区' }
]

const mockCities = {
  '110000': [{ code: '110100', name: '北京市' }],
  '120000': [{ code: '120100', name: '天津市' }],
  '130000': [
    { code: '130100', name: '石家庄市' },
    { code: '130200', name: '唐山市' },
    { code: '130300', name: '秦皇岛市' },
    { code: '130400', name: '邯郸市' },
    { code: '130500', name: '邢台市' },
    { code: '130600', name: '保定市' },
    { code: '130700', name: '张家口市' },
    { code: '130800', name: '承德市' },
    { code: '130900', name: '沧州市' },
    { code: '131000', name: '廊坊市' },
    { code: '131100', name: '衡水市' }
  ],
  '310000': [{ code: '310100', name: '上海市' }],
  '320000': [
    { code: '320100', name: '南京市' },
    { code: '320200', name: '无锡市' },
    { code: '320300', name: '徐州市' },
    { code: '320400', name: '常州市' },
    { code: '320500', name: '苏州市' },
    { code: '320600', name: '南通市' },
    { code: '320700', name: '连云港市' },
    { code: '320800', name: '淮安市' },
    { code: '320900', name: '盐城市' },
    { code: '321000', name: '扬州市' },
    { code: '321100', name: '镇江市' },
    { code: '321200', name: '泰州市' },
    { code: '321300', name: '宿迁市' }
  ],
  '330000': [
    { code: '330100', name: '杭州市' },
    { code: '330200', name: '宁波市' },
    { code: '330300', name: '温州市' },
    { code: '330400', name: '嘉兴市' },
    { code: '330500', name: '湖州市' },
    { code: '330600', name: '绍兴市' },
    { code: '330700', name: '金华市' },
    { code: '330800', name: '衢州市' },
    { code: '330900', name: '舟山市' },
    { code: '331000', name: '台州市' },
    { code: '331100', name: '丽水市' }
  ],
  '440000': [
    { code: '440100', name: '广州市' },
    { code: '440200', name: '韶关市' },
    { code: '440300', name: '深圳市' },
    { code: '440400', name: '珠海市' },
    { code: '440500', name: '汕头市' },
    { code: '440600', name: '佛山市' },
    { code: '440700', name: '江门市' },
    { code: '440800', name: '湛江市' },
    { code: '440900', name: '茂名市' },
    { code: '441200', name: '肇庆市' },
    { code: '441300', name: '惠州市' },
    { code: '441400', name: '梅州市' },
    { code: '441500', name: '汕尾市' },
    { code: '441600', name: '河源市' },
    { code: '441700', name: '阳江市' },
    { code: '441800', name: '清远市' },
    { code: '441900', name: '东莞市' },
    { code: '442000', name: '中山市' },
    { code: '445100', name: '潮州市' },
    { code: '445200', name: '揭阳市' },
    { code: '445300', name: '云浮市' }
  ],
  '510000': [
    { code: '510100', name: '成都市' },
    { code: '510300', name: '自贡市' },
    { code: '510400', name: '攀枝花市' },
    { code: '510500', name: '泸州市' },
    { code: '510600', name: '德阳市' },
    { code: '510700', name: '绵阳市' },
    { code: '510800', name: '广元市' },
    { code: '510900', name: '遂宁市' },
    { code: '511000', name: '内江市' },
    { code: '511100', name: '乐山市' },
    { code: '511300', name: '南充市' },
    { code: '511400', name: '眉山市' },
    { code: '511500', name: '宜宾市' },
    { code: '511600', name: '广安市' },
    { code: '511700', name: '达州市' },
    { code: '511800', name: '雅安市' },
    { code: '511900', name: '巴中市' },
    { code: '512000', name: '资阳市' }
  ]
}

const mockDistricts = {
  '110100': [
    { code: '110101', name: '东城区' },
    { code: '110102', name: '西城区' },
    { code: '110105', name: '朝阳区' },
    { code: '110106', name: '丰台区' },
    { code: '110107', name: '石景山区' },
    { code: '110108', name: '海淀区' },
    { code: '110109', name: '门头沟区' },
    { code: '110111', name: '房山区' },
    { code: '110112', name: '通州区' },
    { code: '110113', name: '顺义区' },
    { code: '110114', name: '昌平区' },
    { code: '110115', name: '大兴区' },
    { code: '110116', name: '怀柔区' },
    { code: '110117', name: '平谷区' }
  ],
  '310100': [
    { code: '310101', name: '黄浦区' },
    { code: '310104', name: '徐汇区' },
    { code: '310105', name: '长宁区' },
    { code: '310106', name: '静安区' },
    { code: '310107', name: '普陀区' },
    { code: '310109', name: '虹口区' },
    { code: '310110', name: '杨浦区' },
    { code: '310112', name: '闵行区' },
    { code: '310113', name: '宝山区' },
    { code: '310114', name: '嘉定区' },
    { code: '310115', name: '浦东新区' },
    { code: '310116', name: '金山区' },
    { code: '310117', name: '松江区' },
    { code: '310118', name: '青浦区' }
  ],
  '320100': [
    { code: '320102', name: '玄武区' },
    { code: '320104', name: '秦淮区' },
    { code: '320105', name: '建邺区' },
    { code: '320106', name: '鼓楼区' },
    { code: '320111', name: '浦口区' },
    { code: '320113', name: '栖霞区' },
    { code: '320114', name: '雨花台区' },
    { code: '320115', name: '江宁区' },
    { code: '320116', name: '六合区' },
    { code: '320117', name: '溧水区' },
    { code: '320118', name: '高淳区' }
  ],
  '330100': [
    { code: '330102', name: '上城区' },
    { code: '330103', name: '拱墅区' },
    { code: '330104', name: '江干区' },
    { code: '330105', name: '拱墅区' },
    { code: '330106', name: '西湖区' },
    { code: '330108', name: '滨江区' },
    { code: '330109', name: '萧山区' },
    { code: '330110', name: '余杭区' },
    { code: '330111', name: '富阳区' },
    { code: '330112', name: '临安区' }
  ],
  '440100': [
    { code: '440103', name: '荔湾区' },
    { code: '440104', name: '越秀区' },
    { code: '440105', name: '海珠区' },
    { code: '440106', name: '天河区' },
    { code: '440111', name: '白云区' },
    { code: '440112', name: '黄埔区' },
    { code: '440113', name: '番禺区' },
    { code: '440114', name: '花都区' },
    { code: '440115', name: '南沙区' },
    { code: '440117', name: '从化区' },
    { code: '440118', name: '增城区' }
  ],
  '440300': [
    { code: '440303', name: '罗湖区' },
    { code: '440304', name: '福田区' },
    { code: '440305', name: '南山区' },
    { code: '440306', name: '宝安区' },
    { code: '440307', name: '龙岗区' },
    { code: '440308', name: '盐田区' },
    { code: '440309', name: '龙华区' },
    { code: '440310', name: '坪山区' }
  ],
  '510100': [
    { code: '510104', name: '锦江区' },
    { code: '510105', name: '青羊区' },
    { code: '510106', name: '金牛区' },
    { code: '510107', name: '武侯区' },
    { code: '510108', name: '成华区' },
    { code: '510112', name: '龙泉驿区' },
    { code: '510113', name: '青白江区' },
    { code: '510114', name: '新都区' },
    { code: '510115', name: '温江区' },
    { code: '510116', name: '双流区' },
    { code: '510117', name: '郫都区' }
  ]
}

const displayText = computed(() => {
  if (selectedDistrictName.value && selectedDistrictName.value !== selectedCityName.value) {
    return `${selectedCityName.value} ${selectedDistrictName.value}`
  }
  if (selectedCityName.value) {
    return selectedCityName.value
  }
  if (selectedProvinceName.value) {
    return selectedProvinceName.value
  }
  return '北京'
})

const toggleDropdown = (event) => {
  if (event) {
    event.stopPropagation()
  }
  dropdownOpen.value = !dropdownOpen.value
  
  if (dropdownOpen.value) {
    initializeCascader()
  }
}

const initializeCascader = () => {
  if (selectedProvinceCode.value) {
    cities.value = mockCities[selectedProvinceCode.value] || []
  }
  
  if (selectedCityCode.value) {
    districts.value = mockDistricts[selectedCityCode.value] || []
  }
}

const selectProvince = (province) => {
  selectedProvinceCode.value = province.code
  selectedProvinceName.value = province.name
  selectedCityCode.value = ''
  selectedCityName.value = ''
  selectedDistrictCode.value = ''
  selectedDistrictName.value = ''
  
  const hasCities = mockCities[province.code]?.length > 0
  
  if (hasCities) {
    cities.value = mockCities[province.code] || []
    districts.value = []
  } else {
    dropdownOpen.value = false
  }
}

const selectCity = (city) => {
  selectedCityCode.value = city.code
  selectedCityName.value = city.name
  selectedDistrictCode.value = ''
  selectedDistrictName.value = ''
  
  const hasDistricts = mockDistricts[city.code]?.length > 0
  
  if (hasDistricts) {
    districts.value = mockDistricts[city.code] || []
  } else {
    dropdownOpen.value = false
  }
}

const selectDistrict = (district) => {
  selectedDistrictCode.value = district.code
  selectedDistrictName.value = district.name
  dropdownOpen.value = false
}

const handleClickOutside = (event) => {
  if (cascaderRef.value && !cascaderRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  provinces.value = mockProvinces
  
  const beijingProvince = provinces.value.find(p => p.code === '110000')
  if (beijingProvince) {
    selectedProvinceCode.value = beijingProvince.code
    selectedProvinceName.value = beijingProvince.name
    selectedCityName.value = '北京市'
    cities.value = mockCities['110000'] || []
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.city-cascader {
  position: relative;
  display: inline-block;
  z-index: 999;
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
  min-width: 100px;
  transition: all 0.3s ease;
  position: relative;
}

.city-display:hover {
  background-color: #fafafa;
}

.city-display.is-open {
  background-color: #fafafa;
}

.city-name {
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.dropdown-icon {
  margin-left: 0.5rem;
  color: #999;
  font-size: 0.6rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
  color: #ff5a5f;
}

.city-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 99999;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 540px;
  overflow: visible;
}

.cascader-container {
  display: flex;
  max-height: 400px;
  overflow: hidden;
}

.cascader-column {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
  border-right: 1px solid #f0f0f0;
  min-width: 180px;
}

.cascader-column:last-child {
  border-right: none;
}

.column-title {
  padding: 0 1rem 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cascader-item {
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: #333;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0.5rem;
}

.cascader-item:hover {
  background-color: #fff5f5;
  color: #ff5a5f;
  transform: translateX(4px);
}

.cascader-item.active {
  background-color: #ff5a5f;
  color: white;
}

.cascader-item.active:hover {
  background-color: #ff474c;
}

.item-text {
  flex: 1;
}

.item-arrow {
  font-size: 1rem;
  font-weight: 300;
  opacity: 0;
  transition: all 0.2s ease;
}

.cascader-item:hover .item-arrow,
.cascader-item.active .item-arrow {
  opacity: 1;
}

.cascader-column::-webkit-scrollbar {
  width: 6px;
}

.cascader-column::-webkit-scrollbar-track {
  background: #f9f9f9;
  border-radius: 3px;
}

.cascader-column::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
  transition: background 0.2s;
}

.cascader-column::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
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

@media (max-width: 768px) {
  .city-dropdown {
    min-width: 280px;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    max-width: 400px;
  }
  
  .cascader-container {
    flex-direction: column;
    max-height: 50vh;
  }
  
  .cascader-column {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    min-width: auto;
    max-height: 150px;
  }
  
  .cascader-column:last-child {
    border-bottom: none;
  }
}
</style>