<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="logo">
        <h1>民宿之家</h1>
      </router-link>
      
      <div class="search-container">
        <CityCascader />
        <input 
          type="text" 
          placeholder="搜索区域或房源名称..." 
          v-model="searchKeyword"
          @input="handleSearch"
          class="search-input"
        />
        <button class="search-btn">
          <span class="search-icon">🔍</span>
        </button>
      </div>
      
      <div class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <a href="#" class="nav-item">城市</a>
        <a href="#" class="nav-item">优惠</a>
        <a href="#" class="nav-item">帮助</a>
        
        <div v-if="currentUser" class="user-menu">
          <button class="user-avatar-btn" @click="toggleUserDropdown">
            <img :src="currentUser.avatar" :alt="currentUser.username" class="user-avatar" />
            <span class="caret" :class="{ open: userDropdownOpen }">▼</span>
          </button>
          
          <Transition name="dropdown">
            <div v-if="userDropdownOpen" class="user-dropdown" @click.stop>
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  <img :src="currentUser.avatar" :alt="currentUser.username" />
                </div>
                <div class="dropdown-info">
                  <div class="dropdown-username">{{ currentUser.username }}</div>
                  <div class="dropdown-email" v-if="currentUser.email">{{ currentUser.email }}</div>
                </div>
              </div>
              
              <div class="dropdown-divider"></div>
              
              <router-link to="/profile" class="dropdown-item" @click="userDropdownOpen = false">
                <span class="dropdown-icon">👤</span>
                <span>个人中心</span>
              </router-link>
              
              <a href="#" class="dropdown-item">
                <span class="dropdown-icon">❤️</span>
                <span>我的收藏</span>
              </a>
              
              <a href="#" class="dropdown-item">
                <span class="dropdown-icon">📋</span>
                <span>我的订单</span>
              </a>
              
              <div class="dropdown-divider"></div>
              
              <button class="dropdown-item logout" @click="handleLogout">
                <span class="dropdown-icon">🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          </Transition>
        </div>
        
        <div v-else class="auth-buttons">
          <router-link to="/login" class="login-btn">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </div>
      </div>
      
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span v-if="!mobileMenuOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>
    
    <div class="mobile-menu" v-if="mobileMenuOpen">
      <router-link to="/" class="mobile-nav-item" @click="toggleMobileMenu">首页</router-link>
      <a href="#" class="mobile-nav-item">城市</a>
      <a href="#" class="mobile-nav-item">优惠</a>
      <a href="#" class="mobile-nav-item">帮助</a>
      
      <div v-if="currentUser" class="mobile-user-section">
        <div class="mobile-user-info">
          <img :src="currentUser.avatar" :alt="currentUser.username" class="mobile-avatar" />
          <span class="mobile-username">{{ currentUser.username }}</span>
        </div>
        <router-link to="/profile" class="mobile-nav-item" @click="toggleMobileMenu">个人中心</router-link>
        <button class="mobile-nav-item mobile-logout" @click="handleLogout">退出登录</button>
      </div>
      
      <div v-else class="mobile-auth">
        <router-link to="/login" class="mobile-login-btn" @click="toggleMobileMenu">登录</router-link>
        <router-link to="/register" class="mobile-register-btn" @click="toggleMobileMenu">注册</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import CityCascader from './CityCascader.vue'
import { getCurrentUser, logoutUser } from '../data/user'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const mobileMenuOpen = ref(false)
const userDropdownOpen = ref(false)
const currentUser = ref(null)

const checkUserStatus = () => {
  currentUser.value = getCurrentUser()
}

watch(
  () => route.path,
  () => {
    checkUserStatus()
  }
)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const toggleUserDropdown = (e) => {
  e.stopPropagation()
  userDropdownOpen.value = !userDropdownOpen.value
}

const closeDropdown = (e) => {
  if (userDropdownOpen.value && !e.target.closest('.user-menu')) {
    userDropdownOpen.value = false
  }
}

const handleSearch = () => {
  router.push({ path: '/', query: { keyword: searchKeyword.value } })
}

const handleLogout = () => {
  logoutUser()
  currentUser.value = null
  userDropdownOpen.value = false
  mobileMenuOpen.value = false
  ElMessage.success('已退出登录')
  router.push('/')
}

onMounted(() => {
  checkUserStatus()
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
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
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-left: 1px solid #e0e0e0;
  outline: none;
  font-size: 0.9rem;
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

.auth-buttons {
  display: flex;
  gap: 0.5rem;
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
  text-decoration: none;
}

.register-btn {
  background-color: #ff5a5f;
  color: white;
  border-color: #ff5a5f;
}

.login-btn:hover {
  border-color: #ff5a5f;
  color: #ff5a5f;
}

.register-btn:hover {
  background-color: #ff474c;
}

.user-menu {
  position: relative;
}

.user-avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 24px;
  transition: background-color 0.3s;
}

.user-avatar-btn:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.user-avatar-btn:hover .user-avatar {
  border-color: #ff5a5f;
}

.caret {
  font-size: 0.6rem;
  color: #666;
  transition: transform 0.3s;
}

.caret.open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.dropdown-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-info {
  flex: 1;
}

.dropdown-username {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.dropdown-email {
  font-size: 0.8rem;
  color: #666;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: #333;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s, color 0.2s;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #fff5f5;
  color: #ff5a5f;
}

.dropdown-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.dropdown-item.logout {
  color: #ff474c;
}

.dropdown-item.logout:hover {
  background-color: #fff5f5;
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

.mobile-user-section {
  padding: 0.5rem 0;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.mobile-username {
  font-weight: 600;
  color: #333;
}

.mobile-logout {
  color: #ff474c;
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
  text-decoration: none;
  text-align: center;
}

.mobile-register-btn {
  background-color: #ff5a5f;
  color: white;
  border-color: #ff5a5f;
}

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
