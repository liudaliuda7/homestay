<template>
  <div class="property-detail">
    <!-- 房源图片轮播 -->
    <div class="image-carousel">
      <div class="main-image">
        <img :src="currentImage" :alt="property.title" class="image" />
      </div>
      <div class="thumbnail-container">
        <div 
          v-for="(image, index) in property.images" 
          :key="index"
          class="thumbnail"
          :class="{ active: index === currentImageIndex }"
          @click="currentImageIndex = index"
        >
          <img :src="image" :alt="`${property.title} ${index + 1}`" />
        </div>
      </div>
    </div>
    
    <!-- 房源基本信息 -->
    <div class="container">
      <div class="main-content">
        <div class="info-section">
          <div class="header">
            <h1 class="title">{{ property.title }}</h1>
            <div class="rating">
              <span class="star">⭐</span>
              <span>{{ property.rating }}</span>
              <span>({{ property.reviews }}条评价)</span>
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
              <img :src="property.host.avatar" :alt="property.host.name" />
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
            <h2>用户评价 ({{ property.reviews }})</h2>
            <div class="review-list">
              <div v-for="review in propertyReviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <div class="review-user">
                    <img :src="review.user.avatar" :alt="review.user.name" class="user-avatar" />
                    <span class="user-name">{{ review.user.name }}</span>
                  </div>
                  <div class="review-rating">
                    <span class="star">⭐</span>
                    <span>{{ review.rating }}</span>
                  </div>
                </div>
                <div class="review-date">{{ review.date }}</div>
                <div class="review-content">{{ review.content }}</div>
              </div>
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
                <input 
                  type="date" 
                  class="date-field" 
                  v-model="checkInDate"
                  :min="minDate"
                  @change="handleCheckInChange"
                />
              </div>
              <div class="date-input">
                <label>退房日期</label>
                <input 
                  type="date" 
                  class="date-field" 
                  v-model="checkOutDate"
                  :min="checkInDate ? new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split('T')[0] : minDate"
                  @change="handleCheckOutChange"
                />
              </div>
            </div>
            <div class="guests-input">
              <label>房客数量</label>
              <input 
                type="number" 
                min="1" 
                :max="property.guests" 
                class="guest-field" 
                v-model="guests"
                @change="handleGuestsChange"
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
</template>

<script>
import { getPropertyById, getReviewsByPropertyId } from '../data/properties';

export default {
  name: 'PropertyDetail',
  data() {
    return {
      property: null,
      currentImageIndex: 0,
      propertyReviews: [],
      // 日期选择相关数据
      checkInDate: '',
      checkOutDate: '',
      guests: 1,
      minDate: new Date().toISOString().split('T')[0] // 最小可选日期为今天
    };
  },
  computed: {
    currentImage() {
      return this.property ? this.property.images[this.currentImageIndex] : '';
    },
    // 计算入住天数
    stayDays() {
      if (!this.checkInDate || !this.checkOutDate) return 0;
      
      const checkIn = new Date(this.checkInDate);
      const checkOut = new Date(this.checkOutDate);
      
      // 确保退房日期晚于入住日期
      if (checkOut <= checkIn) return 0;
      
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    },
    // 计算总价
    totalPrice() {
      if (!this.property || !this.stayDays) return 0;
      
      return this.property.price * this.stayDays;
    },
    // 计算每晚价格
    pricePerNight() {
      return this.property ? this.property.price : 0;
    }
  },
  created() {
    this.loadProperty();
    this.loadReviews();
  },
  methods: {
    loadProperty() {
      const id = parseInt(this.$route.params.id);
      this.property = getPropertyById(id);
    },
    loadReviews() {
      const id = parseInt(this.$route.params.id);
      this.propertyReviews = getReviewsByPropertyId(id);
    },
    // 处理入住日期变化
    handleCheckInChange(e) {
      this.checkInDate = e.target.value;
      
      // 如果退房日期早于或等于新的入住日期，则清空退房日期
      if (this.checkOutDate && new Date(this.checkOutDate) <= new Date(this.checkInDate)) {
        this.checkOutDate = '';
      }
    },
    // 处理退房日期变化
    handleCheckOutChange(e) {
      this.checkOutDate = e.target.value;
    },
    // 处理房客数量变化
    handleGuestsChange(e) {
      this.guests = parseInt(e.target.value);
    },
    // 处理预订按钮点击
    handleBook() {
      if (!this.checkInDate || !this.checkOutDate || this.stayDays === 0) {
        alert('请选择有效的入住和退房日期');
        return;
      }
      
      alert(`预订成功！\n入住日期：${this.checkInDate}\n退房日期：${this.checkOutDate}\n入住天数：${this.stayDays}晚\n房客数量：${this.guests}人\n总价：¥${this.totalPrice}`);
    }
  }
};
</script>

<style scoped>
.property-detail {
  background-color: #f9f9f9;
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

.title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
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
  
  .title {
    font-size: 1.5rem;
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
