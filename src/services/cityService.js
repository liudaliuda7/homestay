// 城市数据服务
// 使用高德地图API获取城市数据
const AMAP_KEY = 'your_amap_key_here' // 需要替换为实际的高德地图API密钥

// 模拟城市数据（当API不可用时使用）
const mockCityData = {
  provinces: [
    {
      code: '110000',
      name: '北京市',
      cities: [
        {
          code: '110100',
          name: '北京市',
          districts: [
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
            { code: '110117', name: '平谷区' },
            { code: '110118', name: '密云区' },
            { code: '110119', name: '延庆区' }
          ]
        }
      ]
    },
    {
      code: '310000',
      name: '上海市',
      cities: [
        {
          code: '310100',
          name: '上海市',
          districts: [
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
            { code: '310118', name: '青浦区' },
            { code: '310120', name: '奉贤区' },
            { code: '310151', name: '崇明区' }
          ]
        }
      ]
    },
    {
      code: '440000',
      name: '广东省',
      cities: [
        {
          code: '440100',
          name: '广州市',
          districts: [
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
          ]
        },
        {
          code: '440300',
          name: '深圳市',
          districts: [
            { code: '440303', name: '罗湖区' },
            { code: '440304', name: '福田区' },
            { code: '440305', name: '南山区' },
            { code: '440306', name: '宝安区' },
            { code: '440307', name: '龙岗区' },
            { code: '440308', name: '盐田区' },
            { code: '440309', name: '龙华区' },
            { code: '440310', name: '坪山区' },
            { code: '440311', name: '光明区' }
          ]
        }
      ]
    }
  ]
}

class CityService {
  constructor() {
    this.cityData = null
    this.init()
  }

  async init() {
    // 尝试从API获取数据，如果失败则使用模拟数据
    try {
      this.cityData = await this.fetchCityDataFromAPI()
    } catch (error) {
      console.warn('无法从API获取城市数据，使用模拟数据', error)
      this.cityData = mockCityData
    }
  }

  async fetchCityDataFromAPI() {
    // 这里应该调用实际的API，暂时返回模拟数据
    // 实际使用时需要申请高德地图API密钥
    // const response = await fetch(`https://restapi.amap.com/v3/config/district?keywords=中国&subdistrict=3&key=${AMAP_KEY}`)
    // return await response.json()
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockCityData
  }

  getProvinces() {
    if (!this.cityData) return []
    return this.cityData.provinces.map(province => ({
      code: province.code,
      name: province.name
    }))
  }

  getCitiesByProvince(provinceCode) {
    if (!this.cityData) return []
    const province = this.cityData.provinces.find(p => p.code === provinceCode)
    return province ? province.cities.map(city => ({
      code: city.code,
      name: city.name
    })) : []
  }

  getDistrictsByCity(cityCode) {
    if (!this.cityData) return []
    for (const province of this.cityData.provinces) {
      const city = province.cities.find(c => c.code === cityCode)
      if (city) {
        return city.districts.map(district => ({
          code: district.code,
          name: district.name
        }))
      }
    }
    return []
  }

  getFullLocationName(provinceCode, cityCode, districtCode) {
    const province = this.cityData.provinces.find(p => p.code === provinceCode)
    if (!province) return ''
    
    const city = province.cities.find(c => c.code === cityCode)
    if (!city) return province.name
    
    const district = city.districts.find(d => d.code === districtCode)
    if (!district) return `${province.name} ${city.name}`
    
    return `${province.name} ${city.name} ${district.name}`
  }

  getLocationByCode(provinceCode, cityCode, districtCode) {
    const province = this.cityData.provinces.find(p => p.code === provinceCode)
    if (!province) return null
    
    const city = province.cities.find(c => c.code === cityCode)
    if (!city) return { province: province.name }
    
    const district = city.districts.find(d => d.code === districtCode)
    if (!district) return { 
      province: province.name, 
      city: city.name 
    }
    
    return {
      province: province.name,
      city: city.name,
      district: district.name
    }
  }
}

// 创建单例实例
const cityService = new CityService()

export default cityService