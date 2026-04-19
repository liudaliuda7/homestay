<template>
  <div class="pay-page">
    <div class="pay-container">
      <div class="pay-header">
        <h2 class="pay-title">订单支付</h2>
        <p class="pay-subtitle">请确认订单信息后完成支付</p>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">😕</div>
        <h3>{{ error.title }}</h3>
        <p>{{ error.message }}</p>
        <router-link to="/" class="back-btn">返回首页</router-link>
      </div>
      
      <div v-else-if="order" class="pay-content">
        <div class="order-summary">
          <h3 class="section-title">订单信息</h3>
          
          <div class="property-info">
            <div class="property-image">
              <img :src="order.propertyImage" :alt="order.propertyTitle" />
            </div>
            <div class="property-details">
              <h4 class="property-title">{{ order.propertyTitle }}</h4>
              <p class="property-location">📍 {{ order.location }}</p>
              <div class="property-date">
                <span class="date-label">入住：</span>
                <span class="date-value">{{ order.checkInDate }}</span>
                <span class="date-separator">→</span>
                <span class="date-label">退房：</span>
                <span class="date-value">{{ order.checkOutDate }}</span>
              </div>
              <div class="property-info-bottom">
                <span>共 {{ order.stayDays }} 晚</span>
                <span>·</span>
                <span>{{ order.guests }} 位房客</span>
              </div>
            </div>
          </div>
          
          <div class="order-no">
            <span class="label">订单编号：</span>
            <span class="value">{{ order.orderNo }}</span>
          </div>
        </div>
        
        <div class="payment-methods">
          <h3 class="section-title">选择支付方式</h3>
          
          <div class="method-list">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="method-item" 
              :class="{ selected: selectedMethod === method.id }"
              @click="selectedMethod = method.id"
            >
              <div class="method-icon">{{ method.icon }}</div>
              <div class="method-info">
                <div class="method-name">{{ method.name }}</div>
                <div class="method-desc">{{ method.desc }}</div>
              </div>
              <div class="method-radio" :class="{ checked: selectedMethod === method.id }">
                <span v-if="selectedMethod === method.id" class="radio-dot"></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="payment-summary">
          <div class="price-row">
            <span class="price-label">房费 ({{ order.stayDays }}晚)</span>
            <span class="price-value">¥{{ order.price * order.stayDays }}</span>
          </div>
          <div class="price-row">
            <span class="price-label">服务费</span>
            <span class="price-value">¥0</span>
          </div>
          <div class="price-row total">
            <span class="price-label">总计</span>
            <span class="price-value">¥{{ order.totalPrice }}</span>
          </div>
        </div>
        
        <button 
          class="pay-btn" 
          :class="{ loading: paying }"
          @click="handlePay"
          :disabled="paying"
        >
          <span v-if="paying" class="paying-text">
            <span class="spinner-small"></span>
            支付处理中...
          </span>
          <span v-else>确认支付 ¥{{ order.totalPrice }}</span>
        </button>
        
        <div class="pay-notice">
          <div class="notice-icon">🔒</div>
          <span>您的支付信息将被安全加密，仅用于本次交易</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderById, payOrder, ORDER_STATUS } from '../data/orders'
import { getCurrentUser } from '../data/user'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)
const error = ref(null)
const paying = ref(false)
const selectedMethod = ref('alipay')

const paymentMethods = ref([
  { id: 'alipay', name: '支付宝', desc: '推荐使用', icon: '💳' },
  { id: 'wechat', name: '微信支付', desc: '微信扫码支付', icon: '💚' },
  { id: 'card', name: '银行卡', desc: '储蓄卡/信用卡', icon: '🏦' }
])

const loadOrder = () => {
  loading.value = true
  error.value = null
  
  const user = getCurrentUser()
  if (!user) {
    router.push('/login')
    return
  }
  
  const orderId = parseInt(route.params.orderId)
  
  if (isNaN(orderId) || orderId <= 0) {
    error.value = {
      title: '订单不存在',
      message: '您访问的订单不存在或已过期'
    }
    loading.value = false
    return
  }
  
  const orderData = getOrderById(orderId)
  
  if (!orderData) {
    error.value = {
      title: '订单不存在',
      message: '您访问的订单不存在或已过期'
    }
    loading.value = false
    return
  }
  
  if (orderData.userId !== user.id) {
    error.value = {
      title: '无权访问',
      message: '您无权访问此订单'
    }
    loading.value = false
    return
  }
  
  if (orderData.status === ORDER_STATUS.PAID) {
    error.value = {
      title: '订单已支付',
      message: '该订单已完成支付，无需重复支付'
    }
    loading.value = false
    return
  }
  
  if (orderData.status === ORDER_STATUS.CANCELLED) {
    error.value = {
      title: '订单已取消',
      message: '该订单已被取消，请重新预订'
    }
    loading.value = false
    return
  }
  
  order.value = orderData
  loading.value = false
}

const handlePay = () => {
  if (paying.value) return
  
  paying.value = true
  
  setTimeout(() => {
    const result = payOrder(order.value.id)
    
    if (result.success) {
      ElMessage({
        message: '支付成功！',
        type: 'success',
        duration: 2000
      })
      
      setTimeout(() => {
        router.push('/user/order')
      }, 1000)
    } else {
      ElMessage({
        message: result.message || '支付失败',
        type: 'error',
        duration: 2000
      })
      paying.value = false
    }
  }, 2000)
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  background-color: #f9f9f9;
  padding: 2rem 1rem;
}

.pay-container {
  max-width: 700px;
  margin: 0 auto;
}

.pay-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pay-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.pay-subtitle {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff5a5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}

.error-state {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #ff5a5f;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #ff474c;
}

.pay-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.order-summary {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.property-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.property-image {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.property-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.property-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.property-location {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.property-date {
  font-size: 0.85rem;
  color: #666;
}

.date-label {
  color: #999;
}

.date-separator {
  margin: 0 4px;
  color: #ff5a5f;
}

.property-info-bottom {
  font-size: 0.85rem;
  color: #666;
}

.order-no {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fff5f5;
  border-radius: 8px;
}

.order-no .label {
  font-size: 0.9rem;
  color: #666;
}

.order-no .value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ff5a5f;
  font-family: 'Monaco', 'Menlo', monospace;
}

.payment-methods {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-item:hover {
  border-color: #ffd6d6;
}

.method-item.selected {
  border-color: #ff5a5f;
  background: #fff5f5;
}

.method-icon {
  font-size: 1.75rem;
  margin-right: 1rem;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.method-desc {
  font-size: 0.85rem;
  color: #999;
}

.method-radio {
  width: 22px;
  height: 22px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.method-radio.checked {
  border-color: #ff5a5f;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: #ff5a5f;
  border-radius: 50%;
}

.payment-summary {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.price-label {
  font-size: 0.95rem;
  color: #666;
}

.price-value {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.price-row.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.price-row.total .price-label {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.price-row.total .price-value {
  font-size: 1.5rem;
  color: #ff5a5f;
  font-weight: 700;
}

.pay-btn {
  display: block;
  width: calc(100% - 3rem);
  margin: 1.5rem;
  padding: 1rem 2rem;
  background: #ff5a5f;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pay-btn:hover:not(:disabled) {
  background: #ff474c;
}

.pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.paying-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #999;
  font-size: 0.85rem;
  background: #fafafa;
}

.notice-icon {
  font-size: 1rem;
}

@media (max-width: 600px) {
  .pay-page {
    padding: 1rem;
  }
  
  .pay-title {
    font-size: 1.5rem;
  }
  
  .property-info {
    flex-direction: column;
  }
  
  .property-image {
    width: 100%;
    height: 160px;
  }
  
  .price-row.total .price-value {
    font-size: 1.3rem;
  }
}
</style>
