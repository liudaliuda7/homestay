<template>
  <div class="invite-page">
    <div class="invite-header">
      <div class="header-bg">
        <div class="header-content">
          <h2 class="invite-title">邀请好友</h2>
          <p class="invite-subtitle">邀请好友注册并完成首单，双方均可获得奖励</p>
        </div>
      </div>
    </div>
    
    <div class="invite-stats">
      <div class="stat-item">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">已邀请</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.firstOrder }}</div>
        <div class="stat-label">已首单</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.completed }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ earnedRewards.length }}</div>
        <div class="stat-label">已获奖励</div>
      </div>
    </div>
    
    <div class="invite-code-section">
      <div class="section-header">
        <span class="section-icon">🔑</span>
        <span class="section-title">我的邀请码</span>
      </div>
      <div class="invite-code-box">
        <div class="code-display">
          <span class="code-text">{{ inviteCode }}</span>
        </div>
        <button class="copy-btn" @click="copyInviteCode">
          <span class="copy-icon">📋</span>
          复制
        </button>
      </div>
    </div>
    
    <div class="invite-link-section">
      <div class="section-header">
        <span class="section-icon">🔗</span>
        <span class="section-title">邀请链接</span>
      </div>
      <div class="invite-link-box">
        <div class="link-display">
          <span class="link-text">{{ inviteLink }}</span>
        </div>
        <button class="copy-btn" @click="copyInviteLink">
          <span class="copy-icon">📋</span>
          复制链接
        </button>
      </div>
    </div>
    
    <div class="invite-qrcode-section" v-if="showQRCode">
      <div class="section-header">
        <span class="section-icon">📱</span>
        <span class="section-title">扫码注册</span>
      </div>
      <div class="qrcode-container">
        <div class="qrcode-box">
          <div class="qrcode-placeholder">
            <span class="qrcode-icon">📱</span>
            <span class="qrcode-text">扫码即可注册</span>
          </div>
        </div>
        <p class="qrcode-desc">好友扫描二维码即可注册，双方均可获得奖励</p>
      </div>
    </div>
    
    <div class="reward-progress-section">
      <div class="section-header">
        <span class="section-icon">🎁</span>
        <span class="section-title">奖励进度</span>
      </div>
      <div class="reward-list">
        <div 
          v-for="config in rewardConfigs" 
          :key="config.id"
          class="reward-item"
          :class="{ 
            'earned': isRewardEarned(config.id),
            'eligible': isRewardEligible(config.id) && !isRewardEarned(config.id)
          }"
        >
          <div class="reward-info">
            <div class="reward-name">{{ config.rewardName }}</div>
            <div class="reward-desc">{{ config.description }}</div>
          </div>
          <div class="reward-progress">
            <div class="progress-info">
              <span class="current-count">{{ stats.firstOrder }}</span>
              <span class="separator">/</span>
              <span class="required-count">{{ config.inviteCount }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: Math.min((stats.firstOrder / config.inviteCount) * 100, 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="reward-status">
            <span v-if="isRewardEarned(config.id)" class="status-earned">已领取</span>
            <span v-else-if="isRewardEligible(config.id)" class="status-eligible">
              <button class="claim-btn" @click="claimReward(config)">领取</button>
            </span>
            <span v-else class="status-pending">进行中</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="invite-list-section">
      <div class="section-header">
        <span class="section-icon">👥</span>
        <span class="section-title">我的邀请好友</span>
        <span class="section-count">({{ invitations.length }})</span>
      </div>
      <div class="invite-list" v-if="invitations.length > 0">
        <div v-for="invitation in invitations" :key="invitation.id" class="invite-item">
          <div class="invite-avatar">
            <span class="avatar-placeholder">👤</span>
          </div>
          <div class="invite-details">
            <div class="invite-name">{{ invitation.inviteeName }}</div>
            <div class="invite-time">{{ formatTime(invitation.createdAt) }}</div>
          </div>
          <div class="invite-status" :class="`status-${invitation.status}`">
            {{ getStatusLabel(invitation.status) }}
          </div>
        </div>
      </div>
      <div class="invite-empty" v-else>
        <div class="empty-icon">👥</div>
        <p class="empty-text">还没有邀请好友</p>
        <p class="empty-desc">快去邀请好友吧，双方均可获得奖励</p>
      </div>
    </div>
    
    <div class="ranking-section">
      <div class="section-header">
        <span class="section-icon">🏆</span>
        <span class="section-title">邀请排行榜</span>
      </div>
      <div class="ranking-list" v-if="ranking.length > 0">
        <div 
          v-for="(item, index) in ranking" 
          :key="item.inviterId"
          class="ranking-item"
          :class="`rank-${item.rank}`"
        >
          <div class="ranking-number" :class="`rank-${item.rank}`">
            <span v-if="item.rank <= 3" class="top-icon">{{ getTopIcon(item.rank) }}</span>
            <span v-else>{{ item.rank }}</span>
          </div>
          <div class="ranking-avatar">
            <span class="avatar-placeholder">👤</span>
          </div>
          <div class="ranking-info">
            <div class="ranking-name">用户 {{ item.inviterId }}</div>
            <div class="ranking-stats">
              <span>邀请 {{ item.inviteeCount }} 人</span>
              <span>·</span>
              <span>首单 {{ item.firstOrderCount }} 人</span>
            </div>
          </div>
          <div class="ranking-badge" v-if="item.rank <= 3">
            {{ getBadgeText(item.rank) }}
          </div>
        </div>
      </div>
      <div class="ranking-empty" v-else>
        <p class="empty-text">暂无排行榜数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getInviteCodeInfo,
  generateInviteLink,
  getInvitationsByInviter,
  getInvitationStats,
  getInvitationRanking,
  INVITATION_STATUS_LABELS,
  INVITATION_REWARD_CONFIGS,
  checkRewardEligibility,
  claimReward,
  getEarnedRewards,
  formatInvitationTime,
  INVITATION_EVENT
} from '../data/invitations'
import { addInvitingPoints } from '../data/points'
import { getCurrentUser } from '../data/user'

const router = useRouter()

const user = ref(null)
const showQRCode = ref(true)
const updateCount = ref(0)

const handleInvitationUpdate = () => {
  updateCount.value++
}

const inviteCode = computed(() => {
  updateCount.value
  if (!user.value) return ''
  const codeInfo = getInviteCodeInfo(user.value.id)
  return codeInfo?.code || ''
})

const inviteLink = computed(() => {
  updateCount.value
  if (!user.value) return ''
  return generateInviteLink(user.value.id)
})

const invitations = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getInvitationsByInviter(user.value.id)
})

const stats = computed(() => {
  updateCount.value
  if (!user.value) {
    return { total: 0, registered: 0, firstOrder: 0, completed: 0 }
  }
  return getInvitationStats(user.value.id)
})

const rewardConfigs = computed(() => INVITATION_REWARD_CONFIGS)

const earnedRewards = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getEarnedRewards(user.value.id)
})

const ranking = computed(() => getInvitationRanking(10))

const eligibleRewards = computed(() => {
  updateCount.value
  if (!user.value) return []
  return checkRewardEligibility(user.value.id)
})

const isRewardEarned = (configId) => {
  return earnedRewards.value.some(r => r.configId === configId)
}

const isRewardEligible = (configId) => {
  return eligibleRewards.value.some(r => r.id === configId)
}

const getStatusLabel = (status) => {
  return INVITATION_STATUS_LABELS[status] || status
}

const getTopIcon = (rank) => {
  const icons = ['🥇', '🥈', '🥉']
  return icons[rank - 1] || rank
}

const getBadgeText = (rank) => {
  const badges = ['冠军', '亚军', '季军']
  return badges[rank - 1] || ''
}

const formatTime = (time) => {
  return formatInvitationTime(time)
}

const copyInviteCode = () => {
  if (!inviteCode.value) return
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(inviteCode.value)
    ElMessage.success('邀请码已复制到剪贴板')
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = inviteCode.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('邀请码已复制到剪贴板')
  }
}

const copyInviteLink = () => {
  if (!inviteLink.value) return
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(inviteLink.value)
    ElMessage.success('邀请链接已复制到剪贴板')
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = inviteLink.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('邀请链接已复制到剪贴板')
  }
}

const handleClaimReward = (config) => {
  if (!user.value) return
  
  const result = claimReward(user.value.id, config.id)
  
  if (result.success) {
    ElMessage.success({
      message: result.message,
      duration: 2000
    })
    
    if (config.rewardType === 'points') {
      addInvitingPoints(user.value.id, 0, `领取奖励: ${config.rewardName}`)
    }
    
    updateCount.value++
  } else {
    ElMessage.error({
      message: result.message,
      duration: 2000
    })
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
    window.addEventListener(INVITATION_EVENT, handleInvitationUpdate)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(INVITATION_EVENT, handleInvitationUpdate)
  }
})
</script>

<style scoped>
.invite-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding-bottom: 2rem;
}

.invite-header {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  padding: 2rem 0;
}

.header-bg {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  text-align: center;
  color: white;
}

.invite-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.invite-subtitle {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

.invite-stats {
  max-width: 1200px;
  margin: -1rem auto 0;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-item {
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff5a5f;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.invite-code-section,
.invite-link-section,
.invite-qrcode-section,
.reward-progress-section,
.invite-list-section,
.ranking-section {
  max-width: 1200px;
  margin: 1.5rem auto 0;
  padding: 0 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.section-icon {
  font-size: 1.2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.section-count {
  font-size: 0.85rem;
  color: #999;
  margin-left: 0.25rem;
}

.invite-code-box,
.invite-link-box {
  display: flex;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.code-display,
.link-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 0.75rem;
}

.code-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff5a5f;
  letter-spacing: 4px;
  font-family: monospace;
}

.link-text {
  font-size: 0.85rem;
  color: #666;
  word-break: break-all;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);
}

.copy-icon {
  font-size: 1rem;
}

.qrcode-container {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.qrcode-box {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.qrcode-placeholder {
  width: 160px;
  height: 160px;
  background-color: #f5f5f5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px dashed #ddd;
}

.qrcode-placeholder .qrcode-icon {
  font-size: 3rem;
}

.qrcode-placeholder .qrcode-text {
  font-size: 0.85rem;
  color: #999;
}

.qrcode-desc {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.reward-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.reward-item.eligible {
  border: 2px solid #ff5a5f;
  background-color: #fff5f5;
}

.reward-item.earned {
  opacity: 0.7;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.reward-desc {
  font-size: 0.85rem;
  color: #666;
}

.reward-progress {
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.current-count {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff5a5f;
}

.separator {
  font-size: 0.9rem;
  color: #999;
}

.required-count {
  font-size: 0.9rem;
  color: #666;
}

.progress-bar {
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff5a5f 0%, #ff7a7f 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.reward-status {
  min-width: 80px;
  text-align: right;
}

.status-earned {
  font-size: 0.85rem;
  color: #52c41a;
  font-weight: 500;
}

.status-eligible {
  font-size: 0.85rem;
}

.status-pending {
  font-size: 0.85rem;
  color: #999;
}

.claim-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.claim-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);
}

.invite-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invite-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.invite-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  font-size: 1.5rem;
}

.invite-details {
  flex: 1;
}

.invite-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.invite-time {
  font-size: 0.8rem;
  color: #999;
}

.invite-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending {
  background-color: #f5f5f5;
  color: #666;
}

.status-registered {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-first_order {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.invite-empty,
.ranking-empty {
  background-color: white;
  border-radius: 12px;
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
  margin: 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ranking-item.rank-1 {
  background: linear-gradient(135deg, #fff7e6 0%, #fff 100%);
  border: 1px solid #fa8c16;
}

.ranking-item.rank-2 {
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
  border: 1px solid #bfbfbf;
}

.ranking-item.rank-3 {
  background: linear-gradient(135deg, #fff2e8 0%, #fff 100%);
  border: 1px solid #d97706;
}

.ranking-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  background-color: #f5f5f5;
  color: #666;
}

.ranking-number.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
  color: #8b4513;
}

.ranking-number.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%);
  color: #333;
}

.ranking-number.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
  color: #fff;
}

.top-icon {
  font-size: 1.2rem;
}

.ranking-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.ranking-stats {
  font-size: 0.8rem;
  color: #666;
  display: flex;
  gap: 0.5rem;
}

.ranking-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.rank-1 .ranking-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
  color: #8b4513;
}

.rank-2 .ranking-badge {
  background: linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%);
  color: #333;
}

.rank-3 .ranking-badge {
  background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
  color: #fff;
}

@media (max-width: 768px) {
  .invite-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .invite-code-box,
  .invite-link-box {
    flex-direction: column;
  }
  
  .copy-btn {
    width: 100%;
    justify-content: center;
  }
  
  .reward-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .reward-progress {
    width: 100%;
    min-width: auto;
  }
  
  .reward-status {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .invite-header {
    padding: 1.5rem 0;
  }
  
  .invite-title {
    font-size: 1.25rem;
  }
  
  .invite-subtitle {
    font-size: 0.85rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .code-text {
    font-size: 1.25rem;
  }
}
</style>
