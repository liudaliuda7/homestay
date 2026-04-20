<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleDialogUpdate"
    title="发表评价"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div v-if="order" class="review-form">
      <div class="review-property">
        <div class="property-img">
          <img :src="order.propertyImage || defaultPropertyImage" :alt="order.propertyTitle" />
        </div>
        <div class="property-info">
          <h3 class="property-title">{{ order.propertyTitle }}</h3>
          <p class="property-loc">📍 {{ order.location }}</p>
          <p class="property-date">{{ order.checkInDate }} 至 {{ order.checkOutDate }}</p>
        </div>
      </div>
      
      <el-divider>评分</el-divider>
      
      <div class="rating-section">
        <div 
          v-for="dimension in RATING_DIMENSIONS" 
          :key="dimension.key"
          class="rating-item"
        >
          <span class="rating-label">
            <span class="rating-icon">{{ dimension.icon }}</span>
            <span>{{ dimension.label }}</span>
          </span>
          <el-rate 
            v-model="ratings[dimension.key]" 
            :colors="['#99A9BF', '#F7BA2A', '#FF5A5F']"
            :max="5"
            :low-threshold="2"
            :high-threshold="4"
          />
        </div>
        
        <div class="overall-rating">
          <span class="rating-label">总体评分</span>
          <span class="overall-score">{{ overallRating }}</span>
          <el-rate 
            :model-value="overallRating" 
            disabled
            :colors="['#99A9BF', '#F7BA2A', '#FF5A5F']"
            size="small"
          />
        </div>
      </div>
      
      <el-divider>评价内容</el-divider>
      
      <div class="content-section">
        <el-input
          v-model="content"
          type="textarea"
          :rows="5"
          placeholder="请分享您的住宿体验（至少20字，最多500字）"
          maxlength="500"
          show-word-limit
        />
        <p v-if="contentError" class="error-msg">{{ contentError }}</p>
      </div>
      
      <el-divider>图片上传（可选）</el-divider>
      
      <div class="upload-section">
        <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :limit="9"
          :on-change="handleImageChange"
          :on-remove="handleImageRemove"
          :file-list="fileList"
        >
          <el-icon class="upload-icon"><Plus /></el-icon>
        </el-upload>
        <p class="upload-tip">最多可上传9张图片，支持jpg、png格式</p>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button 
        type="danger" 
        :loading="submitting"
        @click="submitReview"
      >
        提交评价
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { 
  RATING_DIMENSIONS, 
  createReview, 
  checkOrderCanReview 
} from '../data/reviews'
import { getCurrentUser } from '../data/user'

const DEFAULT_PROPERTY_IMAGE = 'https://picsum.photos/seed/default-property/400/300'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const defaultPropertyImage = DEFAULT_PROPERTY_IMAGE

const ratings = reactive({
  location: 5,
  cleanliness: 5,
  service: 5,
  facilities: 5,
  value: 5
})

const content = ref('')
const contentError = ref('')
const fileList = ref([])
const images = ref([])
const submitting = ref(false)

const overallRating = computed(() => {
  const sum = ratings.location + ratings.cleanliness + ratings.service + ratings.facilities + ratings.value
  return Math.round((sum / 5) * 10) / 10
})

watch(() => props.visible, (val) => {
  if (val && props.order) {
    const reviewCheck = checkOrderCanReview(props.order)
    if (!reviewCheck.canReview) {
      ElMessage({
        message: reviewCheck.reason,
        type: 'warning',
        duration: 2000
      })
      emit('update:visible', false)
      return
    }
    
    ratings.location = 5
    ratings.cleanliness = 5
    ratings.service = 5
    ratings.facilities = 5
    ratings.value = 5
    content.value = ''
    contentError.value = ''
    fileList.value = []
    images.value = []
  }
})

const handleImageChange = (file) => {
  if (fileList.value.length > 9) {
    ElMessage({
      message: '最多只能上传9张图片',
      type: 'warning',
      duration: 2000
    })
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    images.value.push(e.target.result)
  }
  if (file.raw) {
    reader.readAsDataURL(file.raw)
  }
}

const handleImageRemove = (file, files) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    images.value.splice(index, 1)
  }
}

const validateForm = () => {
  contentError.value = ''
  
  for (const key in ratings) {
    if (ratings[key] === 0) {
      const dimension = RATING_DIMENSIONS.find(d => d.key === key)
      contentError.value = `请为${dimension?.label || '评分项'}评分`
      return false
    }
  }
  
  if (!content.value || content.value.trim().length === 0) {
    contentError.value = '请输入评价内容'
    return false
  }
  
  if (content.value.trim().length < 20) {
    contentError.value = `评价内容至少20字（当前${content.value.trim().length}字）`
    return false
  }
  
  if (content.value.trim().length > 500) {
    contentError.value = '评价内容不能超过500字'
    return false
  }
  
  return true
}

const submitReview = () => {
  if (!validateForm()) {
    return
  }
  
  submitting.value = true
  
  const user = getCurrentUser()
  if (!user) {
    ElMessage({
      message: '请先登录',
      type: 'warning',
      duration: 2000
    })
    submitting.value = false
    return
  }
  
  setTimeout(() => {
    const result = createReview({
      propertyId: props.order.propertyId,
      orderId: props.order.id,
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
      overallRating: overallRating.value,
      ratings: {
        location: ratings.location,
        cleanliness: ratings.cleanliness,
        service: ratings.service,
        facilities: ratings.facilities,
        value: ratings.value
      },
      content: content.value.trim(),
      images: images.value.length > 0 ? images.value.slice(0, 4) : []
    })
    
    submitting.value = false
    
    if (result.success) {
      ElMessage({
        message: '评价发表成功！',
        type: 'success',
        duration: 2000
      })
      
      emit('update:visible', false)
      emit('success', result.review)
    } else {
      ElMessage({
        message: result.message || '评价发表失败',
        type: 'error',
        duration: 2000
      })
    }
  }, 500)
}

const handleClose = () => {
  if (submitting.value) return
  
  if (content.value.trim() || fileList.value.length > 0) {
    ElMessage({
      message: '您有未保存的评价内容，确定要关闭吗？',
      type: 'warning',
      duration: 2000
    })
  }
  
  emit('update:visible', false)
}

const handleDialogUpdate = (val) => {
  emit('update:visible', val)
}
</script>

<style scoped>
.review-form {
  padding: 0.5rem 0;
}

.review-property {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #fafafa;
  border-radius: 8px;
}

.property-img {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.property-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.property-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
}

.property-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.property-loc, .property-date {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #333;
}

.rating-icon {
  font-size: 1.1rem;
}

.overall-rating {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #fff7f7;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.overall-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff5a5f;
  margin-right: 0.5rem;
}

.content-section {
  margin-bottom: 0.5rem;
}

.error-msg {
  color: #ff5a5f;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.upload-section {
  margin-bottom: 0.5rem;
}

.upload-icon {
  font-size: 1.5rem;
  color: #999;
}

.upload-tip {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .review-property {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .property-img {
    width: 100%;
    height: 150px;
  }
  
  .rating-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .overall-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
