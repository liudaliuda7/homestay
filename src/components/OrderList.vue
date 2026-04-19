<template>
  <div class="content-section">
    <div class="section-header">
      <h2>我的订单</h2>
      <p>查看您的预订记录</p>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>暂无订单</h3>
      <p>您还没有任何预订订单</p>
      <router-link to="/" class="empty-btn">去预订</router-link>
    </div>
    
    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-no">
            <span class="label">订单编号：</span>
            <span class="value">{{ order.orderNo }}</span>
          </div>
          <div class="order-status" :class="order.status">
            {{ getStatusText(order.status) }}
          </div>
        </div>
        
        <div class="order-content">
          <div class="property-image">
            <img :src="order.propertyImage || defaultImage" :alt="order.propertyTitle" />
          </div>
          
          <div class="property-info">
            <h3 class="property-title">{{ order.propertyTitle }}</h3>
            <p class="property-location">📍 {{ order.location }}</p>
            
            <div class="date-info">
              <div class="date-item">
                <span class="date-label">入住：</span>
                <span class="date-value">{{ order.checkInDate }}</span>
              </div>
              <span class="date-arrow">→</span>
              <div class="date-item">
                <span class="date-label">退房：</span>
                <span class="date-value">{{ order.checkOutDate }}</span>
              </div>
            </div>
            
            <div class="extra-info">
              <span>{{ order.stayDays }}晚</span>
              <span>·</span>
              <span>{{ order.guests }}位房客</span>
              <span>·</span>
              <span>￥{{ order.price }}/晚</span>
            </div>
          </div>
          
          <div class="order-price-section">
            <div class="total-price">
              <span class="price-label">总计</span>
              <span class="price-value">￥{{ order.totalPrice }}</span>
            </div>
            
            <div class="order-actions">
              <router-link 
                v-if="order.status === 'pending'" 
                :to="`/pay/${order.id}`"
                class="action-btn primary"
              >
                去支付
              </router-link>
              
              <button 
                v-if="order.status === 'pending'" 
                class="action-btn outline"
                @click="handleCancelOrder(order)"
                :disabled="cancellingId === order.id"
              >
                {{ cancellingId === order.id ? '取消中...' : '取消订单' }}
              </button>
              
              <router-link 
                v-if="order.status === 'paid'" 
                :to="`/property/${order.propertyId}`"
                class="action-btn outline"
              >
                再次预订
              </router-link>
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <span class="create-time">创建时间：{{ formatDate(order.createdAt) }}</span>
          <span v-if="order.paidAt" class="paid-time">支付时间：{{ formatDate(order.paidAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrdersByUserId, cancelOrder, ORDER_STATUS } from '../data/orders'
import { getCurrentUser } from '../data/user'

const DEFAULT_PROPERTY_IMAGE = 'https://picsum.photos/seed/default-property/400/300'

const loading = ref(false)
const orders = ref([])
const cancellingId = ref(null)

const defaultImage = DEFAULT_PROPERTY_IMAGE

const getStatusText = (status) => {
  const statusMap = {
    [ORDER_STATUS.PENDING]: '待支付',
    [ORDER_STATUS.PAID]: '已支付',
    [ORDER_STATUS.COMPLETED]: '已完成',
    [ORDER_STATUS.CANCELLED]: '已取消'
  }
  return statusMap[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadOrders = () => {
  loading.value = true
  
  const user = getCurrentUser()
  if (!user) {
    orders.value = []
    loading.value = false
    return
  }
  
  orders.value = getOrdersByUserId(user.id)
  loading.value = false
}

const handleCancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该订单吗？取消后订单将无法恢复。',
      '确认取消',
      {
        confirmButtonText: '确认取消',
        cancelButtonText: '再想想',
        type: 'warning'
      }
    )
    
    cancellingId.value = order.id
    
    setTimeout(() => {
      const result = cancelOrder(order.id)
      
      if (result.success) {
        ElMessage({
          message: '订单已取消',
          type: 'success',
          duration: 2000
        })
        loadOrders()
      } else {
        ElMessage({
          message: result.message || '取消失败',
          type: 'error',
          duration: 2000
        })
      }
      
      cancellingId.value = null
    }, 300)
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.content-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #666;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff5a5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #333;
  margin: 0 0 0.75rem 0;
}

.empty-state p {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.empty-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #ff5a5f;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.empty-btn:hover {
  background: #ff474c;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.order-no .label {
  font-size: 0.9rem;
  color: #999;
}

.order-no .value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  font-family: 'Monaco', 'Menlo', monospace;
}

.order-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.order-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.order-status.paid {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.completed {
  background: #e6f7ff;
  color: #1890ff;
}

.order-status.cancelled {
  background: #f5f5f5;
  color: #999;
}

.order-content {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
}

.property-image {
  flex-shrink: 0;
  width: 160px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.property-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.property-title {
  font-size: 1.1rem;
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
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.date-label {
  color: #999;
}

.date-value {
  color: #333;
  font-weight: 500;
}

.date-arrow {
  color: #ff5a5f;
  font-weight: 600;
}

.extra-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #999;
}

.order-price-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 140px;
}

.total-price {
  text-align: right;
}

.price-label {
  display: block;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 4px;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff5a5f;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.primary {
  background: #ff5a5f;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #ff474c;
}

.action-btn.outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.action-btn.outline:hover:not(:disabled) {
  color: #ff5a5f;
  border-color: #ff5a5f;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  font-size: 0.8rem;
  color: #999;
}

@media (max-width: 768px) {
  .content-section {
    padding: 1.5rem 1rem;
  }
  
  .order-content {
    flex-direction: column;
  }
  
  .property-image {
    width: 100%;
    height: 180px;
  }
  
  .order-price-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-width: auto;
    width: 100%;
  }
  
  .order-actions {
    flex-direction: row;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
