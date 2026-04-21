<template>
  <div class="share-panel-wrapper">
    <transition name="fade">
      <div v-if="visible" class="share-overlay" @click="handleOverlayClick">
        <transition name="slide-up">
          <div v-if="visible" class="share-panel" @click.stop>
            <div class="share-header">
              <h3 class="share-title">分享到</h3>
              <button class="close-btn" @click="close">
                <span class="close-icon">✕</span>
              </button>
            </div>
            
            <div class="share-platforms">
              <div 
                v-for="platform in platforms" 
                :key="platform.value"
                class="platform-item"
                @click="handleShare(platform.value)"
              >
                <div class="platform-icon" :class="`platform-${platform.value}`">
                  <span class="icon">{{ platform.icon }}</span>
                </div>
                <span class="platform-label">{{ platform.label }}</span>
              </div>
            </div>
            
            <div class="share-footer">
              <button class="poster-btn" @click="showPosterPreview">
                <span class="poster-icon">🖼️</span>
                生成分享海报
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
    
    <el-dialog
      v-model="posterVisible"
      title="分享海报"
      width="400px"
      center
      :close-on-click-modal="false"
    >
      <div class="poster-preview">
        <div class="poster-content" ref="posterRef">
          <div class="poster-image">
            <img :src="shareData.image || defaultPosterImage" :alt="shareData.title" />
          </div>
          <div class="poster-info">
            <h4 class="poster-title">{{ shareData.title }}</h4>
            <p class="poster-desc" v-if="shareData.description">{{ shareData.description }}</p>
            <div class="poster-price" v-if="shareData.price">
              <span class="price-value">¥{{ shareData.price }}</span>
              <span class="price-unit">/晚</span>
            </div>
          </div>
          <div class="poster-qrcode">
            <div class="qrcode-placeholder">
              <span class="qrcode-icon">📱</span>
              <span class="qrcode-text">扫码查看</span>
            </div>
            <div class="qrcode-info">
              <span class="app-name">民宿之家</span>
              <span class="invite-text" v-if="shareCode">邀请码: {{ shareCode }}</span>
            </div>
          </div>
          <div class="poster-footer">
            <span class="brand">🏠 民宿之家</span>
            <span class="slogan">发现全球独特的住宿体验</span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="posterVisible = false">关闭</el-button>
          <el-button type="primary" @click="savePoster">保存图片</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  SHARE_PLATFORMS, 
  SHARE_PLATFORM_LABELS, 
  SHARE_TYPES,
  shareToPlatform,
  createShare,
  generateShareUrl,
  generateShareCode
} from '../data/shares'
import { addSharingPoints } from '../data/points'
import { getCurrentUser } from '../data/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  shareData: {
    type: Object,
    default: () => ({})
  },
  shareType: {
    type: String,
    default: SHARE_TYPES.PROPERTY
  }
})

const emit = defineEmits(['update:visible', 'shared'])

const posterVisible = ref(false)
const posterRef = ref(null)

const defaultPosterImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20living%20room%20interior%20warm%20lighting&image_size=square_hd'

const user = computed(() => getCurrentUser())
const shareCode = computed(() => {
  if (user.value) {
    return generateShareCode(user.value.id)
  }
  return null
})

const platforms = [
  { value: SHARE_PLATFORMS.WECHAT, label: '微信', icon: '💬' },
  { value: SHARE_PLATFORMS.MOMENTS, label: '朋友圈', icon: '⭕' },
  { value: SHARE_PLATFORMS.WEIBO, label: '微博', icon: '📢' },
  { value: SHARE_PLATFORMS.QQ, label: 'QQ', icon: '🐧' },
  { value: SHARE_PLATFORMS.LINK, label: '复制链接', icon: '🔗' }
]

const shareUrl = computed(() => {
  return generateShareUrl(props.shareType, props.shareData.id || props.shareData.relatedId, shareCode.value)
})

const handleShare = (platform) => {
  const result = shareToPlatform(platform, {
    title: props.shareData.title,
    description: props.shareData.description || '',
    image: props.shareData.image,
    url: shareUrl.value
  })
  
  if (result.success) {
    if (user.value) {
      createShare({
        userId: user.value.id,
        type: props.shareType,
        platform: platform,
        relatedId: props.shareData.id || props.shareData.relatedId,
        title: props.shareData.title,
        image: props.shareData.image,
        description: props.shareData.description,
        shareUrl: shareUrl.value,
        shareCode: shareCode.value
      })
      
      if (platform === SHARE_PLATFORMS.LINK || platform === SHARE_PLATFORMS.WEIBO || platform === SHARE_PLATFORMS.QQ) {
        addSharingPoints(
          user.value.id,
          props.shareData.id || props.shareData.relatedId,
          props.shareData.title
        )
        ElMessage.success({
          message: `${result.message}，获得5积分！`,
          duration: 2000
        })
      } else {
        ElMessage.success({
          message: result.message,
          duration: 2000
        })
      }
    } else {
      ElMessage.success({
        message: result.message,
        duration: 2000
      })
    }
    
    emit('shared', { platform, shareData: props.shareData })
    close()
  } else {
    ElMessage.error({
      message: result.message,
      duration: 2000
    })
  }
}

const showPosterPreview = () => {
  posterVisible.value = true
}

const savePoster = () => {
  ElMessage.info({
    message: '海报保存功能需要canvas支持，当前为演示模式',
    duration: 2000
  })
  
  if (user.value) {
    createShare({
      userId: user.value.id,
      type: props.shareType,
      platform: SHARE_PLATFORMS.POSTER,
      relatedId: props.shareData.id || props.shareData.relatedId,
      title: props.shareData.title,
      image: props.shareData.image,
      description: props.shareData.description,
      shareUrl: shareUrl.value,
      shareCode: shareCode.value
    })
    
    addSharingPoints(
      user.value.id,
      props.shareData.id || props.shareData.relatedId,
      props.shareData.title
    )
  }
  
  posterVisible.value = false
  close()
}

const close = () => {
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  close()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.share-panel-wrapper {
  position: relative;
}

.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.share-panel {
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 16px 16px 0 0;
  padding: 1.5rem;
  animation: slideUp 0.3s ease;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.share-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 1.2rem;
  color: #999;
}

.close-btn:hover .close-icon {
  color: #333;
}

.share-platforms {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.platform-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.platform-item:hover {
  transform: translateY(-4px);
}

.platform-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  transition: all 0.2s ease;
}

.platform-item:hover .platform-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.platform-icon .icon {
  font-size: 1.8rem;
}

.platform-label {
  font-size: 0.8rem;
  color: #666;
}

.share-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}

.poster-btn {
  width: 100%;
  padding: 0.875rem;
  background-color: #f8f8f8;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.2s ease;
}

.poster-btn:hover {
  background-color: #f0f0f0;
}

.poster-icon {
  font-size: 1.2rem;
}

.poster-preview {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.poster-content {
  width: 280px;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.poster-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.poster-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-info {
  padding: 1rem;
  background-color: white;
}

.poster-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.poster-desc {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}

.poster-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.poster-price .price-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff5a5f;
}

.poster-price .price-unit {
  font-size: 0.8rem;
  color: #666;
}

.poster-qrcode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-top: 1px solid #f0f0f0;
}

.qrcode-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.qrcode-icon {
  font-size: 1.5rem;
}

.qrcode-text {
  font-size: 0.65rem;
  color: #999;
}

.qrcode-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.app-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.invite-text {
  font-size: 0.75rem;
  color: #ff5a5f;
}

.poster-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #333;
}

.poster-footer .brand {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.poster-footer .slogan {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .share-panel {
    border-radius: 12px 12px 0 0;
    padding: 1rem;
  }
  
  .share-platforms {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem;
  }
  
  .platform-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
  
  .platform-icon .icon {
    font-size: 1.5rem;
  }
}
</style>
