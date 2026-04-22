<template>
  <div class="coupon-center-page">
    <div class="center-header">
      <div class="header-bg">
        <div class="header-content">
          <div class="header-info">
            <h2 class="header-title">领券中心</h2>
            <p class="header-desc">海量优惠券等你来领</p>
          </div>
          <div class="header-decorations">
            <span class="decoration-icon">🎁</span>
            <span class="decoration-icon">🎉</span>
            <span class="decoration-icon">💝</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="countdown-section" v-if="timedCoupons.length > 0">
      <div class="countdown-header">
        <span class="countdown-icon">🔥</span>
        <span class="countdown-title">限时秒杀</span>
        <div class="countdown-timer" v-if="timeLeft">
          <span class="timer-label">距离结束</span>
          <span class="timer-box">{{ timeLeft.hours }}</span>
          <span class="timer-sep">:</span>
          <span class="timer-box">{{ timeLeft.minutes }}</span>
          <span class="timer-sep">:</span>
          <span class="timer-box">{{ timeLeft.seconds }}</span>
        </div>
      </div>
      
      <div class="timed-coupons-list">
        <div 
          v-for="template in timedCoupons" 
          :key="template.id" 
          class="timed-coupon-card"
        >
          <div class="coupon-left">
            <div class="coupon-value" :class="getTypeClass(template.type)">
              <span class="value-num" v-if="template.type !== 'discount'">
                {{ template.discountAmount }}
              </span>
              <span class="value-num" v-else>
                {{ template.discountPercentage }}折
              </span>
              <span class="value-unit" v-if="template.type !== 'discount'">元</span>
            </div>
          </div>
          <div class="coupon-right">
            <div class="coupon-header">
              <span class="coupon-type-tag">{{ getTypeLabel(template.type) }}</span>
              <span class="quantity-badge" v-if="template.totalQuantity">
                剩余 {{ template.totalQuantity - template.claimedQuantity }}/{{ template.totalQuantity }}
              </span>
            </div>
            <h4 class="coupon-name">{{ template.name }}</h4>
            <p class="coupon-desc" v-if="template.description">{{ template.description }}</p>
            <div class="coupon-meta">
              <span class="coupon-condition" v-if="template.minOrderAmount > 0">
                满¥{{ template.minOrderAmount }}可用
              </span>
              <span class="coupon-condition" v-else>
                无门槛
              </span>
              <span class="coupon-validity">
                有效期 {{ template.validDays }}天
              </span>
            </div>
            <div class="coupon-actions">
              <button 
                class="claim-btn" 
                @click="handleClaimCoupon(template)"
                :class="{ 'claimed': isClaimed(template.id) }"
              >
                <span v-if="isClaimed(template.id)">已领取</span>
                <span v-else>立即领取</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="regular-section">
      <div class="section-header">
        <span class="section-icon">🎫</span>
        <span class="section-title">全部优惠券</span>
      </div>
      
      <div class="regular-coupons-list" v-if="regularCoupons.length > 0">
        <div 
          v-for="template in regularCoupons" 
          :key="template.id" 
          class="regular-coupon-card"
        >
          <div class="card-top">
            <div class="coupon-value" :class="getTypeClass(template.type)">
              <span class="value-num" v-if="template.type !== 'discount'">
                {{ template.discountAmount }}
              </span>
              <span class="value-num" v-else>
                {{ template.discountPercentage }}折
              </span>
              <span class="value-unit" v-if="template.type !== 'discount'">元</span>
            </div>
            <div class="coupon-info">
              <div class="coupon-header">
                <span class="coupon-type-tag">{{ getTypeLabel(template.type) }}</span>
              </div>
              <h4 class="coupon-name">{{ template.name }}</h4>
              <div class="coupon-meta">
                <span class="coupon-condition" v-if="template.minOrderAmount > 0">
                  满¥{{ template.minOrderAmount }}可用
                </span>
                <span class="coupon-condition" v-else>
                  无门槛
                </span>
              </div>
            </div>
          </div>
          <div class="card-bottom">
            <div class="coupon-desc" v-if="template.description">
              {{ template.description }}
            </div>
            <div class="coupon-actions">
              <span class="validity-info">有效期 {{ template.validDays }}天</span>
              <button 
                class="claim-btn" 
                @click="handleClaimCoupon(template)"
                :class="{ 'claimed': isClaimed(template.id) }"
              >
                <span v-if="isClaimed(template.id)">已领取</span>
                <span v-else>领取</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="coupons-empty" v-else>
        <div class="empty-icon">😢</div>
        <p class="empty-text">暂无优惠券</p>
        <p class="empty-desc">请稍后再来查看</p>
      </div>
    </div>
    
    <div class="tips-section">
      <div class="section-header">
        <span class="section-icon">📝</span>
        <span class="section-title">使用说明</span>
      </div>
      <div class="tips-list">
        <div class="tip-item">
          <span class="tip-icon">①</span>
          <span class="tip-text">优惠券领取后可在"我的优惠券"中查看</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">②</span>
          <span class="tip-text">优惠券与其他优惠互斥，不可叠加使用</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">③</span>
          <span class="tip-text">限时优惠券请在有效期内尽快使用</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">④</span>
          <span class="tip-text">优惠券使用后如取消订单，优惠券将不予退回</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getCouponTemplates,
  getTimedCoupons,
  claimCoupon,
  getUserCoupons,
  COUPON_TYPE_LABELS,
  COUPONS_EVENT,
  sendCouponNotification
} from '../data/coupons'
import { getCurrentUser } from '../data/user'

const router = useRouter()

const user = ref(null)
const updateCount = ref(0)
const timeLeft = ref(null)
let timerInterval = null

const handleCouponsUpdate = () => {
  updateCount.value++
}

const timedCoupons = computed(() => {
  updateCount.value
  return getTimedCoupons()
})

const regularCoupons = computed(() => {
  updateCount.value
  const templates = getCouponTemplates()
  return templates.filter(t => !t.isTimed)
})

const userCoupons = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getUserCoupons(user.value.id)
})

const isClaimed = (templateId) => {
  return userCoupons.value.some(uc => uc.templateId === templateId)
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

const handleClaimCoupon = (template) => {
  if (!user.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  if (isClaimed(template.id)) {
    ElMessage.warning('您已领取过该优惠券')
    return
  }
  
  const result = claimCoupon(user.value.id, template.id)
  
  if (result.success) {
    ElMessage.success({
      message: '领取成功！',
      duration: 2000
    })
    
    sendCouponNotification(user.value.id, result.coupon, 'claim')
    
    updateCount.value++
  } else {
    ElMessage.warning({
      message: result.message,
      duration: 2000
    })
  }
}

const updateCountdown = () => {
  if (timedCoupons.value.length === 0) {
    timeLeft.value = null
    return
  }
  
  const now = new Date().getTime()
  let earliestEnd = null
  
  timedCoupons.value.forEach(template => {
    if (template.timedEnd) {
      const endTime = new Date(template.timedEnd).getTime()
      if (!earliestEnd || endTime < earliestEnd) {
        earliestEnd = endTime
      }
    }
  })
  
  if (!earliestEnd) {
    timeLeft.value = null
    return
  }
  
  const diff = earliestEnd - now
  
  if (diff <= 0) {
    timeLeft.value = null
    updateCount.value++
    return
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  timeLeft.value = {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
}

onMounted(() => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  user.value = currentUser
  
  if (typeof window !== 'undefined') {
    window.addEventListener(COUPONS_EVENT, handleCouponsUpdate)
  }
  
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(COUPONS_EVENT, handleCouponsUpdate)
  }
  
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

onActivated(() => {
  updateCount.value++
  updateCountdown()
})
</script>

<style scoped>
.coupon-center-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding-bottom: 2rem;
}

.center-header {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 50%, #fa8c16 100%);
  padding: 2rem 0;
  position: relative;
  overflow: hidden;
}

.center-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.center-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-bg {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  color: white;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.header-desc {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
}

.header-decorations {
  display: flex;
  gap: 1rem;
}

.decoration-icon {
  font-size: 2rem;
  animation: bounce 2s ease-in-out infinite;
}

.decoration-icon:nth-child(2) {
  animation-delay: 0.3s;
}

.decoration-icon:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.countdown-section {
  max-width: 1200px;
  margin: -1rem auto 1.5rem;
  padding: 0 1rem;
}

.countdown-header {
  background: linear-gradient(135deg, #fff7e6 0%, #fff 100%);
  border-radius: 12px 12px 0 0;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #fffaeb;
}

.countdown-icon {
  font-size: 1.25rem;
}

.countdown-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.countdown-timer {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.timer-label {
  font-size: 0.85rem;
  color: #666;
  margin-right: 0.5rem;
}

.timer-box {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  min-width: 2rem;
  text-align: center;
}

.timer-sep {
  color: #ff5a5f;
  font-weight: 700;
}

.timed-coupons-list {
  background-color: white;
  border-radius: 0 0 12px 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.timed-coupon-card {
  display: flex;
  background: linear-gradient(135deg, #fffbf7 0%, #fff 100%);
  border: 1px solid #ffe7ba;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.timed-coupon-card:last-child {
  margin-bottom: 0;
}

.timed-coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(250, 140, 22, 0.15);
}

.regular-section {
  max-width: 1200px;
  margin: 1rem auto 1.5rem;
  padding: 0 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.section-icon {
  font-size: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.regular-coupons-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.regular-coupon-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.regular-coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-top {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  border-bottom: 1px dashed #e8e8e8;
}

.card-bottom {
  padding: 0.75rem 1rem 1rem;
}

.coupon-left {
  display: flex;
  align-items: center;
}

.coupon-value {
  width: 100px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  border-radius: 8px;
  flex-shrink: 0;
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

.value-num {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.value-unit {
  font-size: 0.75rem;
  opacity: 0.9;
}

.coupon-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.coupon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.coupon-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.coupon-type-tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
}

.quantity-badge {
  font-size: 0.75rem;
  color: #fa8c16;
  background-color: #fff7e6;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.validity-info {
  font-size: 0.8rem;
  color: #999;
}

.claim-btn {
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

.claim-btn:hover:not(.claimed) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);
}

.claim-btn.claimed {
  background: #d9d9d9;
  cursor: default;
}

.coupons-empty {
  padding: 3rem 1rem;
  text-align: center;
  background-color: white;
  border-radius: 12px;
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
  margin: 0;
}

.tips-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tips-list {
  background-color: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.tip-item:last-child {
  border-bottom: none;
}

.tip-icon {
  width: 1.25rem;
  height: 1.25rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.tip-text {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .center-header {
    padding: 1.5rem 0;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .countdown-header {
    flex-wrap: wrap;
  }
  
  .countdown-timer {
    margin-left: 0;
    margin-top: 0.5rem;
    width: 100%;
    justify-content: center;
  }
  
  .timed-coupon-card {
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
    border-radius: 8px 8px 0 0;
  }
  
  .regular-coupons-list {
    grid-template-columns: 1fr;
  }
  
  .card-top {
    flex-direction: column;
  }
  
  .coupon-value {
    width: 100%;
    height: 70px;
  }
  
  .coupon-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .claim-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.25rem;
  }
  
  .decoration-icon {
    font-size: 1.5rem;
  }
  
  .timer-box {
    font-size: 0.9rem;
    padding: 0.25rem 0.375rem;
    min-width: 1.75rem;
  }
}
</style>
