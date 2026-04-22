<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-container">
        <div class="sidebar">
          <div class="sidebar-header">
            <div class="user-avatar-large">
              <img :src="userInfo.avatar" :alt="userInfo.username" />
            </div>
            <div class="user-info">
              <h3 class="username">{{ userInfo.username }}</h3>
              <p class="user-status">{{ currentLevelLabel }}</p>
            </div>
          </div>
          
          <div class="sidebar-menu">
            <router-link 
              v-for="item in menuItems" 
              :key="item.id"
              :to="item.path"
              class="menu-item" 
              :class="{ active: isActiveMenu(item.id) }"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.name }}</span>
              <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
            </router-link>
          </div>
        </div>
        
        <div class="content">
          <router-view :userInfo="userInfo" @update:userInfo="handleUpdateUserInfo" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCurrentUser, updateUserInfo } from '../data/user'
import { getFavoriteCount } from '../data/favorites'
import { getUnreadCount, NOTIFICATION_EVENT } from '../data/notifications'
import { getCouponsCount, COUPONS_EVENT } from '../data/coupons'
import { MEMBERSHIP_EVENT, getUserMembership, MEMBERSHIP_LEVEL_LABELS } from '../data/membership'

const route = useRoute()
const router = useRouter()

const userInfo = ref({
  id: 0,
  username: '',
  avatar: '',
  email: '',
  phone: ''
})

const notificationUpdateCount = ref(0)
const couponUpdateCount = ref(0)
const membershipUpdateCount = ref(0)

const currentMembership = computed(() => {
  const user = getCurrentUser()
  if (!user) return null
  membershipUpdateCount.value
  return getUserMembership(user.id)
})

const currentLevelLabel = computed(() => {
  if (!currentMembership.value) return '普通会员'
  return MEMBERSHIP_LEVEL_LABELS[currentMembership.value.level] || '普通会员'
})

const menuItems = computed(() => {
  const user = getCurrentUser()
  const unreadCount = user ? getUnreadCount(user.id) : 0
  notificationUpdateCount.value
  couponUpdateCount.value
  membershipUpdateCount.value
  
  const couponCounts = user ? getCouponsCount(user.id) : { available: 0, expiringSoon: 0 }
  
  return [
    { id: 'profile', name: '个人信息', icon: '👤', path: '/user/profile' },
    { id: 'order', name: '我的订单', icon: '📋', path: '/user/order', badge: 0 },
    { id: 'membership', name: '会员中心', icon: '👑', path: '/user/membership' },
    { id: 'favorites', name: '我的收藏', icon: '❤️', path: '/user/favorites', badge: getFavoriteCount() },
    { id: 'notifications', name: '消息中心', icon: '🔔', path: '/user/notifications', badge: unreadCount },
    { id: 'points', name: '我的积分', icon: '💰', path: '/user/points' },
    { id: 'coupons', name: '我的优惠券', icon: '🎫', path: '/user/coupons', badge: couponCounts.available > 0 ? couponCounts.available : null },
    { id: 'coupon-center', name: '领券中心', icon: '🎁', path: '/user/coupon-center' },
    { id: 'invite', name: '邀请好友', icon: '👥', path: '/user/invite' },
    { id: 'security', name: '账户安全', icon: '🔐', path: '/user/security' },
    { id: 'help', name: '帮助中心', icon: '❓', path: '/user/help' }
  ]
})

const handleNotificationUpdate = () => {
  notificationUpdateCount.value++
}

const handleCouponUpdate = () => {
  couponUpdateCount.value++
}

const handleMembershipUpdate = () => {
  membershipUpdateCount.value++
}

const isActiveMenu = (menuId) => {
  const pathMap = {
    'profile': '/user/profile',
    'order': '/user/order',
    'membership': '/user/membership',
    'favorites': '/user/favorites',
    'notifications': '/user/notifications',
    'points': '/user/points',
    'coupons': '/user/coupons',
    'coupon-center': '/user/coupon-center',
    'invite': '/user/invite',
    'security': '/user/security',
    'help': '/user/help'
  }
  return route.path === pathMap[menuId]
}

const handleUpdateUserInfo = (updatedUser) => {
  Object.assign(userInfo.value, updatedUser)
}

onMounted(() => {
  const user = getCurrentUser()
  if (!user) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  userInfo.value = { ...user }
  
  if (typeof window !== 'undefined') {
    window.addEventListener(NOTIFICATION_EVENT, handleNotificationUpdate)
    window.addEventListener(COUPONS_EVENT, handleCouponUpdate)
    window.addEventListener(MEMBERSHIP_EVENT, handleMembershipUpdate)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(NOTIFICATION_EVENT, handleNotificationUpdate)
    window.removeEventListener(COUPONS_EVENT, handleCouponUpdate)
    window.removeEventListener(MEMBERSHIP_EVENT, handleMembershipUpdate)
  }
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  min-height: calc(100vh - 240px);
}

.sidebar {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  margin-bottom: 80px;
}

.sidebar-header {
  padding: 2rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  text-align: center;
  flex-shrink: 0;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  color: white;
}

.username {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.user-status {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0;
}

.sidebar-menu {
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  text-decoration: none;
}

.menu-item:hover {
  background-color: #fff5f5;
}

.menu-item.active {
  background-color: #fff5f5;
  border-right: 3px solid #ff5a5f;
}

.menu-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 0.95rem;
  color: #333;
  flex: 1;
}

.menu-item.active .menu-text {
  color: #ff5a5f;
  font-weight: 600;
}

.menu-badge {
  background: #ff5a5f;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.content {
  min-height: 400px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

@media (max-width: 1024px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: sticky;
    top: 80px;
    height: auto;
    margin-bottom: 0;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .user-avatar-large {
    width: 60px;
    height: 60px;
    margin: 0;
  }
  
  .user-info {
    text-align: left;
  }
  
  .sidebar-menu {
    display: flex;
    overflow-x: auto;
    padding: 0;
  }
  
  .menu-item {
    flex-direction: column;
    padding: 1rem;
    min-width: 80px;
    gap: 0.5rem;
  }
  
  .menu-item.active {
    border-right: none;
    border-bottom: 3px solid #ff5a5f;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 1rem 0;
  }
}
</style>
