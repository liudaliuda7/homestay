<template>
  <div class="coupons-page">
    <div class="coupons-header">
      <div class="header-bg">
        <div class="header-content">
          <div class="coupons-info">
            <div class="coupons-label">我的优惠券</div>
            <div class="coupons-value">{{ couponCounts.available }}</div>
            <div class="coupons-tips">
              <span v-if="couponCounts.expiringSoon > 0" class="expiring-tip">
                🔥 {{ couponCounts.expiringSoon }} 张即将过期
              </span>
              <span v-else>可使用</span>
            </div>
          </div>
          <div class="center-section">
            <button class="center-btn" @click="goToCouponCenter">
              <span class="center-icon">🎁</span>
              领券中心
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="main-tabs-wrapper">
      <div class="main-tabs">
        <button 
          v-for="tab in mainTabs" 
          :key="tab.value"
          class="main-tab-btn"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count">({{ getTabCount(tab.value) }})</span>
          <span v-if="tab.value === 'available' && couponCounts.expiringSoon > 0" class="tab-badge">
            {{ couponCounts.expiringSoon }}
          </span>
        </button>
      </div>
      
      <div class="main-tab-content">
        <transition name="fade" mode="out-in">
          <div v-if="currentTab === 'available'" key="available" class="coupons-section">
            <div class="coupons-list" v-if="availableCoupons.length > 0">
              <div 
                v-for="coupon in availableCoupons" 
                :key="coupon.id" 
                class="coupon-card"
                :class="{ 'expiring-soon': coupon.isExpiringSoon }"
              >
                <div class="coupon-left">
                  <div class="coupon-value" :class="getTypeClass(coupon.type)">
                    <span class="value-num" v-if="coupon.type !== 'discount'">
                      {{ getCouponDisplayValue(coupon).value }}
                    </span>
                    <span class="value-num" v-else>
                      {{ getCouponDisplayValue(coupon).value }}折
                    </span>
                    <span class="value-unit" v-if="coupon.type !== 'discount'">
                      {{ getCouponDisplayValue(coupon).unit }}
                    </span>
                  </div>
                  <div class="coupon-divider">
                    <div class="divider-top"></div>
                    <div class="divider-bottom"></div>
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-header">
                    <span class="coupon-type-tag">{{ getTypeLabel(coupon.type) }}</span>
                    <span v-if="coupon.isExpiringSoon" class="expiring-tag">即将过期</span>
                  </div>
                  <h4 class="coupon-name">{{ coupon.name }}</h4>
                  <p class="coupon-desc" v-if="coupon.description">{{ coupon.description }}</p>
                  <div class="coupon-meta">
                    <span class="coupon-condition" v-if="coupon.minOrderAmount > 0">
                      满¥{{ coupon.minOrderAmount }}可用
                    </span>
                    <span class="coupon-condition" v-else>
                      无门槛
                    </span>
                    <span class="coupon-date">
                      有效期至 {{ formatCouponDate(coupon.validEnd) }}
                    </span>
                  </div>
                  <div class="coupon-actions">
                    <button class="use-btn" @click="handleUseCoupon(coupon)">立即使用</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="coupons-empty" v-else>
              <div class="empty-icon">🎫</div>
              <p class="empty-text">暂无可用优惠券</p>
              <p class="empty-desc">去领券中心领取优惠券吧</p>
              <button class="go-center-btn" @click="goToCouponCenter">去领券中心</button>
            </div>
          </div>
          
          <div v-else-if="currentTab === 'used'" key="used" class="coupons-section">
            <div class="coupons-list" v-if="usedCoupons.length > 0">
              <div 
                v-for="coupon in usedCoupons" 
                :key="coupon.id" 
                class="coupon-card used"
              >
                <div class="coupon-left">
                  <div class="coupon-value used">
                    <span class="value-num" v-if="coupon.type !== 'discount'">
                      {{ getCouponDisplayValue(coupon).value }}
                    </span>
                    <span class="value-num" v-else>
                      {{ getCouponDisplayValue(coupon).value }}折
                    </span>
                    <span class="value-unit" v-if="coupon.type !== 'discount'">
                      {{ getCouponDisplayValue(coupon).unit }}
                    </span>
                  </div>
                  <div class="coupon-divider">
                    <div class="divider-top"></div>
                    <div class="divider-bottom"></div>
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-header">
                    <span class="coupon-type-tag used">{{ getTypeLabel(coupon.type) }}</span>
                    <span class="used-tag">已使用</span>
                  </div>
                  <h4 class="coupon-name">{{ coupon.name }}</h4>
                  <div class="coupon-meta">
                    <span class="coupon-condition" v-if="coupon.orderAmount">
                      订单金额 ¥{{ coupon.orderAmount }}
                    </span>
                    <span class="coupon-saved" v-if="coupon.savedAmount">
                      节省 ¥{{ coupon.savedAmount }}
                    </span>
                    <span class="coupon-date">
                      使用时间 {{ formatCouponDate(coupon.usedAt) }}
                    </span>
                  </div>
                </div>
                <div class="coupon-mask">
                  <span class="mask-text">已使用</span>
                </div>
              </div>
            </div>
            
            <div class="coupons-empty" v-else>
              <div class="empty-icon">📋</div>
              <p class="empty-text">暂无使用记录</p>
              <p class="empty-desc">使用优惠券后会在这里显示</p>
            </div>
          </div>
          
          <div v-else-if="currentTab === 'expired'" key="expired" class="coupons-section">
            <div class="coupons-list" v-if="expiredCoupons.length > 0">
              <div 
                v-for="coupon in expiredCoupons" 
                :key="coupon.id" 
                class="coupon-card expired"
              >
                <div class="coupon-left">
                  <div class="coupon-value expired">
                    <span class="value-num" v-if="coupon.type !== 'discount'">
                      {{ getCouponDisplayValue(coupon).value }}
                    </span>
                    <span class="value-num" v-else>
                      {{ getCouponDisplayValue(coupon).value }}折
                    </span>
                    <span class="value-unit" v-if="coupon.type !== 'discount'">
                      {{ getCouponDisplayValue(coupon).unit }}
                    </span>
                  </div>
                  <div class="coupon-divider">
                    <div class="divider-top"></div>
                    <div class="divider-bottom"></div>
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-header">
                    <span class="coupon-type-tag expired">{{ getTypeLabel(coupon.type) }}</span>
                    <span class="expired-tag">已过期</span>
                  </div>
                  <h4 class="coupon-name">{{ coupon.name }}</h4>
                  <div class="coupon-meta">
                    <span class="coupon-date">
                      有效期至 {{ formatCouponDate(coupon.validEnd) }}
                    </span>
                  </div>
                </div>
                <div class="coupon-mask">
                  <span class="mask-text">已过期</span>
                </div>
              </div>
            </div>
            
            <div class="coupons-empty" v-else>
              <div class="empty-icon">🕐</div>
              <p class="empty-text">暂无过期优惠券</p>
              <p class="empty-desc">已过期的优惠券会在这里显示</p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getUserCoupons,
  getCouponsCount,
  COUPON_STATUS,
  COUPON_TYPE_LABELS,
  COUPON_TYPE_ICONS,
  getCouponDisplayValue,
  formatCouponTime,
  COUPONS_EVENT,
  isExpiringSoon,
  seedSampleCoupons
} from '../data/coupons'
import { getCurrentUser } from '../data/user'

const router = useRouter()

const user = ref(null)
const currentTab = ref('available')
const updateCount = ref(0)

const handleCouponsUpdate = () => {
  updateCount.value++
}

const mainTabs = [
  { value: 'available', label: '可使用' },
  { value: 'used', label: '已使用' },
  { value: 'expired', label: '已过期' }
]

const couponCounts = computed(() => {
  updateCount.value
  if (!user.value) {
    return { available: 0, used: 0, expired: 0, expiringSoon: 0 }
  }
  return getCouponsCount(user.value.id)
})

const availableCoupons = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getUserCoupons(user.value.id, COUPON_STATUS.AVAILABLE)
})

const usedCoupons = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getUserCoupons(user.value.id, COUPON_STATUS.USED)
})

const expiredCoupons = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getUserCoupons(user.value.id, COUPON_STATUS.EXPIRED)
})

const getTabCount = (tabValue) => {
  if (!user.value) return 0
  switch (tabValue) {
    case 'available':
      return couponCounts.value.available
    case 'used':
      return couponCounts.value.used
    case 'expired':
      return couponCounts.value.expired
    default:
      return 0
  }
}

const getTypeLabel = (type) => {
  return COUPON_TYPE_LABELS[type] || type
}

const getTypeClass = (type) => {
  const classes = {
    new_user: 'new-user',
    full_reduction: 'full-reduction',
    discount: 'discount',
    no_threshold: 'no-threshold',
    holiday: 'holiday',
    invitation: 'invitation',
    member: 'member'
  }
  return classes[type] || 'default'
}

const getCouponDisplayValueWrapper = (coupon) => {
  return getCouponDisplayValue(coupon)
}

const formatCouponDate = (time) => {
  return formatCouponTime(time)
}

const goToCouponCenter = () => {
  router.push('/user/coupon-center')
}

const handleUseCoupon = (coupon) => {
  ElMessage.info('请在下单时选择使用优惠券')
  router.push('/')
}

onMounted(() => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  user.value = currentUser
  
  seedSampleCoupons()
  
  if (typeof window !== 'undefined') {
    window.addEventListener(COUPONS_EVENT, handleCouponsUpdate)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(COUPONS_EVENT, handleCouponsUpdate)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.coupons-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding-bottom: 2rem;
}

.coupons-header {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  padding: 2rem 0;
}

.header-bg {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupons-info {
  color: white;
}

.coupons-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.coupons-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.coupons-tips {
  font-size: 0.85rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expiring-tip {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.center-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.center-btn {
  padding: 0.875rem 2rem;
  background-color: white;
  color: #ff5a5f;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.center-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.center-icon {
  font-size: 1.1rem;
}

.main-tabs-wrapper {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  padding: 0 1rem;
}

.main-tabs {
  display: flex;
  background-color: white;
  border-radius: 12px 12px 0 0;
  padding: 0.75rem 1rem 0;
  gap: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.main-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;
  position: relative;
}

.main-tab-btn:hover {
  color: #ff5a5f;
  background-color: #fff5f5;
}

.main-tab-btn.active {
  color: #ff5a5f;
  font-weight: 600;
}

.main-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff5a5f 0%, #ff7a7f 100%);
  border-radius: 2px 2px 0 0;
}

.tab-label {
}

.tab-count {
  font-size: 0.85rem;
  color: #999;
  margin-left: 0.25rem;
}

.main-tab-btn.active .tab-count {
  color: #ff5a5f;
}

.tab-badge {
  background-color: #ff5a5f;
  color: white;
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  min-width: 1.25rem;
  text-align: center;
}

.main-tab-content {
  background-color: white;
  border-radius: 0 0 12px 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.coupons-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coupon-card {
  display: flex;
  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.2s ease;
}

.coupon-card:hover:not(.used):not(.expired) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.coupon-card.expiring-soon {
  border: 2px solid #fa8c16;
  box-shadow: 0 0 0 2px rgba(250, 140, 22, 0.1);
}

.coupon-left {
  display: flex;
  align-items: center;
  position: relative;
}

.coupon-value {
  width: 120px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  padding: 1rem;
}

.coupon-value.new-user {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.coupon-value.discount {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

.coupon-value.no-threshold {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
}

.coupon-value.holiday {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

.coupon-value.invitation {
  background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
}

.coupon-value.member {
  background: linear-gradient(135deg, #eb2f96 0%, #f759ab 100%);
}

.coupon-value.used,
.coupon-value.expired {
  background: #d9d9d9;
}

.value-num {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.value-unit {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.coupon-divider {
  position: absolute;
  right: -8px;
  top: 0;
  bottom: 0;
  width: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.divider-top,
.divider-bottom {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-left: -8px;
}

.coupon-right {
  flex: 1;
  padding: 1rem 1rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.coupon-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.coupon-type-tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
}

.coupon-type-tag.used,
.coupon-type-tag.expired {
  background: #d9d9d9;
}

.expiring-tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background-color: #fff7e6;
  color: #fa8c16;
}

.used-tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #999;
}

.expired-tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background-color: #fff2f0;
  color: #ff4d4f;
}

.coupon-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
}

.coupon-desc {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.coupon-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 0.8rem;
  color: #999;
}

.coupon-actions {
  margin-top: auto;
  padding-top: 0.75rem;
}

.use-btn {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.use-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);
}

.coupon-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.mask-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d9d9d9;
  transform: rotate(-15deg);
}

.coupons-empty {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.empty-desc {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1.5rem 0;
}

.go-center-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.go-center-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .main-tabs {
    padding: 0.5rem 0.75rem 0;
  }
  
  .main-tab-btn {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 1rem;
  }
  
  .coupon-card {
    flex-direction: column;
  }
  
  .coupon-left {
    width: 100%;
  }
  
  .coupon-value {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.25rem;
  }
  
  .coupon-divider {
    right: 0;
    left: 0;
    top: auto;
    bottom: -8px;
    width: 100%;
    flex-direction: row;
  }
  
  .divider-top,
  .divider-bottom {
    margin-left: 0;
    margin-top: -8px;
  }
  
  .coupon-right {
    padding: 1.25rem 1rem 1rem;
  }
  
  .coupon-actions {
    text-align: center;
  }
  
  .use-btn {
    width: 100%;
    padding: 0.625rem;
  }
}

@media (max-width: 480px) {
  .coupons-header {
    padding: 1.5rem 0;
  }
  
  .coupons-value {
    font-size: 2rem;
  }
  
  .center-btn {
    padding: 0.75rem 1.5rem;
  }
}
</style>
