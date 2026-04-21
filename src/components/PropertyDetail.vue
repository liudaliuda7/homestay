<template>
  <div class="property-detail">
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">😕</div>
      <h3>{{ error.title }}</h3>
      <p>{{ error.message }}</p>
      <router-link to="/" class="back-home-btn">返回首页</router-link>
    </div>
    
    <!-- 房源内容 -->
    <div v-else-if="property">
      <!-- 房源图片轮播 -->
      <div class="image-carousel">
        <div class="main-image">
          <img :src="currentImage" :alt="property.title" class="image" @error="handleImageError($event, 'main')" />
        </div>
        <div class="thumbnail-container">
          <div 
            v-for="(image, index) in property.images" 
            :key="index"
            class="thumbnail"
            :class="{ active: index === currentImageIndex }"
            @click="currentImageIndex = index"
          >
            <img :src="image" :alt="`${property.title} ${index + 1}`" @error="handleImageError($event, 'thumbnail', index)" />
          </div>
        </div>
      </div>
      
      <!-- 房源基本信息 -->
      <div class="container">
        <div class="main-content">
          <div class="info-section">
            <div class="header">
              <h1 class="title">{{ property.title }}</h1>
              <div class="header-right">
                <div class="rating">
                  <span class="star">⭐</span>
                  <span>{{ property.rating }}</span>
                  <span>({{ propertyReviews.length }}条评价)</span>
                </div>
                <button 
                  class="share-btn"
                  @click="handleShare"
                >
                  <span class="share-icon">📤</span>
                  <span class="share-label">分享</span>
                </button>
                <button 
                  class="favorite-btn" 
                  :class="{ active: isFavorited, animating: isAnimating }"
                  @click="handleToggleFavorite"
                >
                  <span class="heart-icon">{{ isFavorited ? '❤️' : '🤍' }}</span>
                  <span class="favorite-label">{{ isFavorited ? '已收藏' : '收藏' }}</span>
                </button>
              </div>
            </div>
            
            <div class="location">📍 {{ property.location }}</div>
            
            <div class="divider"></div>
            
            <div class="property-info">
              <div class="info-item">
                <span class="info-icon">👥</span>
                <span>{{ property.guests }}位房客</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🛏️</span>
                <span>{{ property.bedroom }}间卧室</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🛁</span>
                <span>{{ property.bathroom }}间卫生间</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🛏️</span>
                <span>{{ property.beds }}张床</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- 房东信息 -->
            <div class="host-info">
              <div class="host-avatar">
                <img :src="property.host.avatar" :alt="property.host.name" @error="handleImageError($event, 'avatar')" />
              </div>
              <div class="host-details">
                <div class="host-label">房东</div>
                <div class="host-name">{{ property.host.name }}</div>
                <div class="host-verified" v-if="property.host.verified">
                  ✅ 已验证 | 加入于 {{ property.host.joined }}
                </div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- 房源描述 -->
            <div class="description">
              <h2>房源描述</h2>
              <p>{{ property.description }}</p>
            </div>
            
            <div class="divider"></div>
            
            <!-- 设施配备 -->
            <div class="amenities">
              <h2>设施配备</h2>
              <div class="amenities-grid">
                <div v-for="(amenity, index) in property.amenities" :key="index" class="amenity-item">
                  <span class="amenity-icon">✅</span>
                  <span>{{ amenity }}</span>
                </div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- 入住规则 -->
            <div class="rules">
              <h2>入住规则</h2>
              <ul>
                <li v-for="(rule, index) in property.rules" :key="index">
                  <span class="rule-icon">📌</span>
                  <span>{{ rule }}</span>
                </li>
              </ul>
            </div>
            
            <div class="divider"></div>
            
            <!-- 入住时间 -->
            <div class="checkin-checkout">
              <h2>入住与退房</h2>
              <div class="time-info">
                <div class="time-item">
                  <span class="time-label">入住时间：</span>
                  <span class="time-value">{{ property.checkIn }}</span>
                </div>
                <div class="time-item">
                  <span class="time-label">退房时间：</span>
                  <span class="time-value">{{ property.checkOut }}</span>
                </div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- 用户评价 -->
            <div class="reviews">
              <h2>用户评价 ({{ propertyReviews.length }})</h2>
              <div v-if="propertyReviews.length > 0" class="review-list">
                <div v-for="review in propertyReviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <div class="review-user">
                      <img :src="review.userAvatar || (review.user ? review.user.avatar : '')" :alt="review.userName || (review.user ? review.user.name : '')" class="user-avatar" @error="handleImageError($event, 'avatar')" />
                      <span class="user-name">{{ review.userName || (review.user ? review.user.name : '') }}</span>
                    </div>
                    <div class="review-rating">
                      <span class="star">⭐</span>
                      <span>{{ review.ratings ? review.ratings.overall : review.rating }}</span>
                    </div>
                  </div>
                  <div class="review-date">{{ review.date }}</div>
                  <div class="review-content">{{ review.content || review.comment }}</div>
                  
                  <div class="review-footer">
                    <button 
                      class="like-btn"
                      :class="{ 'liked': isReviewLiked(review), 'animating': animatingReviews.has(review.id) }"
                      @click="handleToggleLike(review)"
                    >
                      <span class="like-icon">{{ isReviewLiked(review) ? '❤️' : '🤍' }}</span>
                      <span class="like-count">{{ getLikeCount(review) }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="reviews-empty">
                <div class="empty-icon">💬</div>
                <h4>暂无评价</h4>
                <p>该房源暂时还没有用户评价，快来成为第一个评价的人吧！</p>
              </div>
            </div>
          </div>
          
          <!-- 侧边栏 - 预订信息 -->
          <div class="sidebar">
            <div class="booking-card">
              <div class="price-section">
                <span class="price">¥{{ pricePerNight }}</span>
                <span class="price-unit">/晚</span>
              </div>
              <div class="rating-section">
                <span class="star">⭐</span>
                <span>{{ property.rating }}</span>
                <span>({{ property.reviews }}条评价)</span>
              </div>
              <div class="date-picker">
                <div class="date-input">
                  <label>入住日期</label>
                  <el-date-picker
                    v-model="checkInDate"
                    type="date"
                    placeholder="选择入住日期"
                    :disabled-date="disabledCheckInDate"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleCheckInChange"
                    style="width: 100%;"
                  />
                </div>
                <div class="date-input">
                  <label>退房日期</label>
                  <el-date-picker
                    v-model="checkOutDate"
                    type="date"
                    placeholder="选择退房日期"
                    :disabled-date="disabledCheckOutDate"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleCheckOutChange"
                    style="width: 100%;"
                  />
                </div>
              </div>
              <div class="guests-input">
                <label>房客数量</label>
                <el-input-number
                  v-model="guests"
                  :min="1"
                  :max="maxGuests"
                  :controls="true"
                  size="default"
                  style="width: 100%;"
                />
              </div>
              <div class="total-price">
                <span class="total-label">总价</span>
                <span class="total-amount">¥{{ totalPrice }}</span>
                <span class="total-nights" v-if="stayDays > 0">({{ stayDays }}晚)</span>
              </div>
              <button class="book-btn" @click="handleBook">立即预订</button>
              <div class="cancellation">
                <span class="cancellation-icon">✅</span>
                <span>可免费取消</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="bookingDialogVisible"
      title="确认预订信息"
      width="500px"
      :close-on-click-modal="false"
      center
    >
      <div class="booking-dialog-content">
        <div class="booking-property">
          <div class="property-img">
            <img :src="property?.images?.[0] || DEFAULT_PROPERTY_IMAGE" :alt="property?.title" />
          </div>
          <div class="property-detail">
            <h3 class="property-title">{{ property?.title }}</h3>
            <p class="property-loc">📍 {{ property?.location }}</p>
          </div>
        </div>
        
        <div class="booking-info">
          <div class="info-row">
            <span class="info-label">入住日期</span>
            <span class="info-value">{{ checkInDate }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">退房日期</span>
            <span class="info-value">{{ checkOutDate }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">入住天数</span>
            <span class="info-value">{{ stayDays }}晚</span>
          </div>
          <div class="info-row">
            <span class="info-label">房客数量</span>
            <span class="info-value">{{ guests }}人</span>
          </div>
        </div>
        
        <div class="booking-total">
          <span class="total-label">总价</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bookingDialogVisible = false">取消</el-button>
          <el-button 
            type="danger" 
            :loading="creatingOrder"
            @click="handleConfirmBooking"
          >
            确认预订
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <SharePanel
      v-model:visible="sharePanelVisible"
      :share-data="shareData"
      share-type="property"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPropertyById } from '../data/properties';
import { getReviewsByPropertyId, toggleLike } from '../data/reviews';
import { isFavorite, toggleFavorite } from '../data/favorites';
import { createOrder } from '../data/orders';
import { getCurrentUser } from '../data/user';
import SharePanel from './SharePanel.vue';

const route = useRoute()
const router = useRouter()

const DEFAULT_PROPERTY_IMAGE = 'https://picsum.photos/seed/default-property/800/600'
const DEFAULT_AVATAR_IMAGE = 'https://picsum.photos/seed/default-avatar/100/100'

const property = ref(null)
const loading = ref(true)
const error = ref(null)
const currentImageIndex = ref(0)
const propertyReviews = ref([])
const checkInDate = ref('')
const checkOutDate = ref('')
const guests = ref(1)
const isFavorited = ref(false)
const isAnimating = ref(false)
const bookingDialogVisible = ref(false)
const creatingOrder = ref(false)
const animatingReviews = ref(new Set())
const sharePanelVisible = ref(false)

const shareData = computed(() => ({
  id: property.value?.id,
  title: property.value?.title,
  description: property.value?.location,
  image: property.value?.images?.[0] || DEFAULT_PROPERTY_IMAGE,
  price: property.value?.price
}))

const currentImage = computed(() => {
  return property.value ? property.value.images[currentImageIndex.value] : '';
})

// 最大房客数量
const maxGuests = computed(() => {
  return property.value ? property.value.guests : 1;
})

// 禁用入住日期（禁用今天之前的日期）
const disabledCheckInDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

// 禁用退房日期（禁用入住日期之前的日期）
const disabledCheckOutDate = (date) => {
  if (!checkInDate.value) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  }
  const checkIn = new Date(checkInDate.value);
  checkIn.setHours(0, 0, 0, 0);
  return date.getTime() <= checkIn.getTime();
}

// 计算入住天数
const stayDays = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0;
  
  const checkIn = new Date(checkInDate.value);
  const checkOut = new Date(checkOutDate.value);
  
  // 确保退房日期晚于入住日期
  if (checkOut <= checkIn) return 0;
  
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
})

// 计算总价
const totalPrice = computed(() => {
  if (!property.value || !stayDays.value) return 0;
  
  return property.value.price * stayDays.value;
})

// 计算每晚价格
const pricePerNight = computed(() => {
  return property.value ? property.value.price : 0;
})

// 加载房源信息
const loadProperty = () => {
  loading.value = true;
  error.value = null;
  
  const idParam = route.params.id;
  
  if (!idParam) {
    error.value = {
      title: '房源不存在',
      message: '您访问的房源页面不存在，请检查URL是否正确。'
    };
    loading.value = false;
    return;
  }
  
  const id = parseInt(idParam);
  
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    error.value = {
      title: '无效的房源ID',
      message: '您访问的房源ID格式不正确，请检查URL是否正确。'
    };
    loading.value = false;
    return;
  }
  
  const data = getPropertyById(id);
  
  if (!data) {
    error.value = {
      title: '房源不存在',
      message: `房源ID ${id} 不存在或已被下架，请返回首页浏览其他房源。`
    };
    loading.value = false;
    return;
  }
  
  property.value = data;
  isFavorited.value = isFavorite(id);
  loading.value = false;
}

// 加载评论
const loadReviews = () => {
  const id = parseInt(route.params.id);
  if (!isNaN(id) && id > 0) {
    propertyReviews.value = getReviewsByPropertyId(id);
  }
}

// 检查用户是否点赞了评价
const isReviewLiked = (review) => {
  const user = getCurrentUser();
  if (!user || !review.likes) return false;
  return review.likes.users && review.likes.users.includes(user.id);
}

// 获取点赞数量
const getLikeCount = (review) => {
  if (!review.likes) return 0;
  return review.likes.count || 0;
}

// 切换点赞状态
const handleToggleLike = (review) => {
  const user = getCurrentUser();
  if (!user) {
    ElMessage({
      message: '请先登录后再点赞',
      type: 'warning',
      duration: 2000
    });
    return;
  }
  
  animatingReviews.value.add(review.id);
  
  const result = toggleLike(review.id, user.id);
  
  if (result.success) {
    if (result.review && result.review.likes) {
      review.likes = {
        count: result.review.likes.count,
        users: [...result.review.likes.users]
      };
    }
  }
  
  setTimeout(() => {
    animatingReviews.value.delete(review.id);
  }, 300);
}

// 处理图片加载错误
const handleImageError = (event, type, index) => {
  if (type === 'avatar') {
    event.target.src = DEFAULT_AVATAR_IMAGE;
  } else {
    event.target.src = DEFAULT_PROPERTY_IMAGE;
  }
}

// 处理入住日期变化
const handleCheckInChange = (value) => {
  checkInDate.value = value;
  
  // 如果退房日期早于或等于新的入住日期，则清空退房日期
  if (checkOutDate.value && new Date(checkOutDate.value) <= new Date(checkInDate.value)) {
    checkOutDate.value = '';
  }
}

// 处理退房日期变化
const handleCheckOutChange = (value) => {
  checkOutDate.value = value;
}

// 处理预订按钮点击
const handleBook = () => {
  if (!checkInDate.value) {
    ElMessage({
      message: '请选择入住日期',
      type: 'warning',
      duration: 2000
    })
    return
  }
  
  if (!checkOutDate.value) {
    ElMessage({
      message: '请选择退房日期',
      type: 'warning',
      duration: 2000
    })
    return
  }
  
  if (stayDays.value === 0) {
    ElMessage({
      message: '退房日期必须晚于入住日期',
      type: 'warning',
      duration: 2000
    })
    return
  }
  
  const user = getCurrentUser()
  if (!user) {
    ElMessage({
      message: '请先登录后再预订',
      type: 'warning',
      duration: 2000
    })
    
    setTimeout(() => {
      router.push({
        path: '/login',
        query: { redirect: `/property/${property.value.id}` }
      })
    }, 500)
    return
  }
  
  bookingDialogVisible.value = true
}

// 处理确认预订
const handleConfirmBooking = async () => {
  creatingOrder.value = true
  
  const user = getCurrentUser()
  
  const orderData = {
    propertyId: property.value.id,
    propertyTitle: property.value.title,
    propertyImage: property.value.images[0] || '',
    location: property.value.location,
    price: property.value.price,
    checkInDate: checkInDate.value,
    checkOutDate: checkOutDate.value,
    guests: guests.value,
    stayDays: stayDays.value,
    totalPrice: totalPrice.value
  }
  
  setTimeout(() => {
    const result = createOrder(orderData, user.id)
    
    creatingOrder.value = false
    
    if (result.success) {
      bookingDialogVisible.value = false
      
      ElMessage({
        message: '订单创建成功，请完成支付',
        type: 'success',
        duration: 2000
      })
      
      setTimeout(() => {
        router.push(`/pay/${result.order.id}`)
      }, 500)
    } else {
      ElMessage({
        message: result.message || '订单创建失败',
        type: 'error',
        duration: 2000
      })
    }
  }, 500)
}

// 处理收藏切换
const handleShare = () => {
  sharePanelVisible.value = true;
}

const handleToggleFavorite = () => {
  if (!property.value) return;
  
  isAnimating.value = true;
  
  const result = toggleFavorite(property.value.id);
  isFavorited.value = result.isFavorite;
  
  if (result.isFavorite) {
    ElMessage({
      message: '收藏成功！',
      type: 'success',
      duration: 2000
    });
  } else {
    ElMessage({
      message: '已取消收藏',
      type: 'info',
      duration: 2000
    });
  }
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 400);
}

// 组件挂载时加载数据
onMounted(() => {
  loadProperty();
  loadReviews();
})
</script>

<style scoped>
.property-detail {
  background-color: #f9f9f9;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 1rem;
  font-size: 1.2rem;
  color: #666;
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

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
}

.error-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.error-state p {
  font-size: 1rem;
  color: #666;
  margin: 0;
  max-width: 400px;
}

.back-home-btn {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
}

.back-home-btn:hover {
  background-color: #ff474c;
}

.image-carousel {
  width: 100%;
  background-color: white;
  padding: 2rem 0;
}

.main-image {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.image {
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: 12px;
}

.thumbnail-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  padding: 0 1rem;
  overflow-x: auto;
}

.thumbnail {
  flex: 0 0 100px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumbnail.active {
  border-color: #ff5a5f;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 2rem 0;
}

.info-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  padding-right: 1rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  font-weight: 600;
}

.star {
  color: #ff5a5f;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-btn:hover {
  border-color: #ff5a5f;
  background-color: #fff5f5;
}

.share-icon {
  font-size: 1rem;
}

.share-label {
  font-size: 0.9rem;
  color: #666;
}

.share-btn:hover .share-label {
  color: #ff5a5f;
}

.favorite-btn:hover {
  border-color: #ff5a5f;
}

.favorite-btn.active {
  border-color: #ff5a5f;
  background-color: #fff5f5;
}

.heart-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.favorite-label {
  font-size: 0.9rem;
  color: #666;
  transition: color 0.2s ease;
}

.favorite-btn.active .favorite-label {
  color: #ff5a5f;
}

.favorite-btn.animating .heart-icon {
  animation: heartPop 0.4s ease;
}

@keyframes heartPop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.4);
  }
  50% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1.35);
  }
  100% {
    transform: scale(1);
  }
}

.location {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 1.5rem 0;
}

.property-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.info-icon {
  font-size: 1.2rem;
}

.host-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.host-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
}

.host-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.host-details {
  flex: 1;
}

.host-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.host-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.host-verified {
  font-size: 0.8rem;
  color: #666;
}

.description h2,
.amenities h2,
.rules h2,
.checkin-checkout h2,
.reviews h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.description p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.amenity-icon {
  color: #ff5a5f;
}

.rules ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rules li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.rule-icon {
  margin-top: 2px;
}

.time-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.time-label {
  font-weight: 600;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1.5rem;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.reviews-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.reviews-empty .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reviews-empty h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.reviews-empty p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}

.review-date {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.review-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
}

.review-footer {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.like-btn:hover:not(:disabled) {
  border-color: #ff5a5f;
  background: #fff7f7;
}

.like-btn.liked {
  border-color: #ff5a5f;
  background: #fff7f7;
}

.like-btn.liked .like-icon {
  color: #ff5a5f;
}

.like-btn.animating .like-icon {
  animation: bounce 0.3s ease;
}

.like-icon {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.like-count {
  font-size: 0.85rem;
  color: #666;
}

.like-btn.liked .like-count {
  color: #ff5a5f;
}

@keyframes bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

/* 侧边栏 */
.sidebar {
  position: sticky;
  top: 100px;
  align-self: start;
}

.booking-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ff5a5f;
}

.price-unit {
  font-size: 1rem;
  color: #666;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.date-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input label {
  font-size: 0.8rem;
  font-weight: 600;
}

.date-field {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;
}

.date-field:focus {
  border-color: #ff5a5f;
}

.guests-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.guests-input label {
  font-size: 0.8rem;
  font-weight: 600;
}

.guest-field {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;
}

.guest-field:focus {
  border-color: #ff5a5f;
}

.book-btn {
  width: 100%;
  padding: 1rem;
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 1rem;
}

.book-btn:hover {
  background-color: #ff474c;
}

.total-price {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.total-label {
  font-size: 1rem;
  font-weight: 600;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ff5a5f;
}

.total-nights {
  font-size: 0.9rem;
  color: #666;
}

.cancellation {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #666;
  justify-content: center;
}

.cancellation-icon {
  color: #ff5a5f;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .image {
    height: 300px;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .title {
    font-size: 1.5rem;
    padding-right: 0;
  }
  
  .info-section {
    padding: 1.5rem;
  }
  
  .property-info {
    gap: 1rem;
  }
  
  .amenities-grid {
    grid-template-columns: 1fr;
  }
  
  .time-info {
    grid-template-columns: 1fr;
  }
  
  .thumbnail {
    flex: 0 0 80px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .image-carousel {
    padding: 1rem 0;
  }
  
  .image {
    height: 250px;
  }
  
  .title {
    font-size: 1.3rem;
  }
  
  .info-section {
    padding: 1rem;
  }
  
  .booking-card {
    padding: 1.25rem;
  }
}
</style>

<style>
.booking-dialog-content {
  padding: 0.5rem 0;
}

.booking-dialog-content .booking-property {
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 1rem;
}

.booking-dialog-content .booking-property .property-img {
  width: 100px;
  height: 75px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.booking-dialog-content .booking-property .property-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-dialog-content .booking-property .property-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
}

.booking-dialog-content .booking-property .property-title {
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

.booking-dialog-content .booking-property .property-loc {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.booking-dialog-content .booking-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.booking-dialog-content .booking-info .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-dialog-content .booking-info .info-label {
  font-size: 0.9rem;
  color: #666;
}

.booking-dialog-content .booking-info .info-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.booking-dialog-content .booking-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.booking-dialog-content .booking-total .total-label {
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

.booking-dialog-content .booking-total .total-price {
  font-size: 1.4rem;
  color: #ff5a5f;
  font-weight: 700;
}

.booking-dialog-content .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
