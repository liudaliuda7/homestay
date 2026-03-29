<template>
  <nav class="navbar">
    <div class="container">
      <!-- 首页入口 -->
      <router-link to="/" class="logo">
        <h1>民宿之家</h1>
      </router-link>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <!-- 城市选择器 -->
        <CityCascade 
          v-model="selectedLocation"
          @change="handleLocationChange"
          class="city-cascade"
        />
        <input 
          type="text" 
          placeholder="搜索区域或房源名称..." 
          v-model="searchKeyword"
          @input="handleSearch"
          class="search-input"
        />
        <button class="search-btn" @click="handleSearch">
          <span class="search-icon">🔍</span>
        </button>
      </div>
      
      <!-- 导航菜单 -->
      <div class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <a href="#" class="nav-item">城市</a>
        <a href="#" class="nav-item">优惠</a>
        <a href="#" class="nav-item">帮助</a>
        <button class="login-btn">登录</button>
        <button class="register-btn">注册</button>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span v-if="!mobileMenuOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>
    
    <!-- 移动端菜单 -->
    <div class="mobile-menu" v-if="mobileMenuOpen">
      <router-link to="/" class="mobile-nav-item" @click="toggleMobileMenu">首页</router-link>
      <a href="#" class="mobile-nav-item">城市</a>
      <a href="#" class="mobile-nav-item">优惠</a>
      <a href="#" class="mobile-nav-item">帮助</a>
      <div class="mobile-auth">
        <button class="mobile-login-btn">登录</button>
        <button class="mobile-register-btn">注册</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CityCascade from './CityCascade.vue'

const router = useRouter()

// 响应式状态
const searchKeyword = ref('')
const mobileMenuOpen = ref(false)
const selectedLocation = ref({
  province: { code: '110000', name: '北京市' },
  city: { code: '110100', name: '北京市' },
  district: { code: '110105', name: '朝阳区' }
})

// 搜索处理函数
const handleSearch = () => {
  const query = { keyword: searchKeyword.value }
  if (selectedLocation.value.city) {
    query.city = selectedLocation.value.city.name
  }
  router.push({ path: '/', query })
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 城市选择变化处理
const handleLocationChange = (location) => {
  selectedLocation.value = location
  // 可以在这里触发搜索或更新搜索结果
  if (searchKeyword.value) {
    handleSearch()
  }
}
</script>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
  color: #ff5a5f;
  font-weight: bold;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
}

.search-container {
  display: flex;
  flex: 1;
  max-width: 600px;
  margin: 0 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: white;
  position: relative;
}

.city-cascade {
  flex-shrink: 0;
  min-width: 120px;
  max-width: 180px;
  border-right: 1px solid #e0e0e0;
}

.city-cascade :deep(.city-selector) {
  border: none;
  border-radius: 0;
  padding: 0.75rem 1rem;
  background-color: transparent;
  font-size: 0.9rem;
  height: 100%;
  display: flex;
  align-items: center;
}

.city-cascade :deep(.city-selector:hover) {
  background-color: #f8f8f8;
}

.city-cascade :deep(.city-selector[title]:hover::after) {
  left: auto;
  right: 100%;
  margin-left: 0;
  margin-right: 8px;
  animation: navbarTooltipFadeIn 0.3s ease-in-out 0.5s forwards;
}

@keyframes navbarTooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(4px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.city-cascade :deep(.dropdown-panel) {
  margin-top: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 0.9rem;
  background-color: transparent;
}

.search-btn {
  background-color: #ff5a5f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #ff474c;
}

.search-icon {
  font-size: 1rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.nav-item:hover {
  color: #ff5a5f;
}

.login-btn, .register-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.register-btn {
  background-color: #ff5a5f;
  color: white;
  border-color: #ff5a5f;
  margin-left: 0.5rem;
}

.login-btn:hover {
  border-color: #ff5a5f;
  color: #ff5a5f;
}

.register-btn:hover {
  background-color: #ff474c;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}

.mobile-menu {
  display: none;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 1rem;
}

.mobile-nav-item {
  display: block;
  padding: 0.75rem 0;
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-nav-item:last-child {
  border-bottom: none;
}

.mobile-auth {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.mobile-login-btn, .mobile-register-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.mobile-register-btn {
  background-color: #ff5a5f;
  color: white;
  border-color: #ff5a5f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    flex-wrap: wrap;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .search-container {
    order: 3;
    width: 100%;
    margin: 1rem 0 0 0;
  }
  
  .city-cascade {
    min-width: 100px;
    max-width: 140px;
  }
  
  .city-cascade :deep(.city-selector) {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .city-cascade :deep(.dropdown-panel) {
    min-width: 280px;
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .logo h1 {
    font-size: 1.2rem;
  }
  
  .search-input {
    font-size: 0.8rem;
  }
  
  .search-btn {
    padding: 0.75rem 1rem;
  }
}
</style>
