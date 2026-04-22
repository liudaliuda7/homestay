<template>
  <div class="membership-page">
    <div class="membership-header">
      <div class="header-bg" :style="headerBgStyle">
        <div class="header-content">
          <div class="level-badge">
            <span class="level-icon">{{ levelIcon }}</span>
          </div>
          <div class="level-info">
            <div class="level-label">当前等级</div>
            <div class="level-name">{{ levelLabel }}</div>
            <div class="level-total-spent">累计消费 ¥{{ membership.totalSpent.toFixed(0) }}</div>
          </div>
        </div>
        
        <div class="progress-section" v-if="!progress.isMaxLevel">
          <div class="progress-header">
            <span class="progress-label">距离 {{ nextLevelLabel }}</span>
            <span class="progress-remaining">还需消费 ¥{{ progress.remaining.toFixed(0) }}</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress.progress + '%' }"></div>
            </div>
            <div class="progress-milestones">
              <div class="milestone" v-for="(level, index) in allLevels" :key="level" 
                   :class="{ 'reached': isLevelReached(level), 'current': level === membership.level }">
                <span class="milestone-icon">{{ getMilestoneIcon(level) }}</span>
                <span class="milestone-label">{{ getLevelThreshold(level) === 0 ? '入门' : '¥' + getLevelThreshold(level) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="max-level-badge" v-else>
          <span class="max-icon">👑</span>
          <span class="max-text">已达到最高等级</span>
        </div>
      </div>
    </div>
    
    <div class="tabs-wrapper">
      <div class="main-tabs">
        <button 
          v-for="tab in mainTabs" 
          :key="tab.value"
          class="main-tab-btn"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>
      
      <transition name="fade" mode="out-in">
        <div class="tab-content" :key="currentTab">
          
          <div v-if="currentTab === 'overview'" class="tab-panel">
            <div class="points-section">
              <div class="points-card">
                <div class="points-header">
                  <div class="points-title">
                    <span class="points-icon">💰</span>
                    <span>积分余额</span>
                  </div>
                  <div class="points-multiplier">
                    <span class="multiplier-label">积分倍率</span>
                    <span class="multiplier-value">{{ pointsMultiplier }}倍</span>
                  </div>
                </div>
                <div class="points-value">{{ totalPoints }}</div>
                <div class="points-tips">
                  <span>消费 ¥1 积 1 分（会员倍率）</span>
                  <span class="points-expire-tip">每年年底清零上一年积分</span>
                </div>
              </div>
            </div>
            
            <div class="benefits-section">
              <div class="section-header">
                <span class="section-icon">🎁</span>
                <span class="section-title">会员权益</span>
                <span class="section-count">共 {{ allBenefits.length }} 项</span>
              </div>
              
              <div class="benefits-grid">
                <div v-for="benefit in allBenefits" :key="benefit.id" class="benefit-card">
                  <div class="benefit-icon">{{ benefit.icon }}</div>
                  <div class="benefit-content">
                    <div class="benefit-name">{{ benefit.name }}</div>
                    <div class="benefit-desc">{{ benefit.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="currentTab === 'history'" class="tab-panel">
            <div class="history-section">
              <div class="section-header">
                <span class="section-icon">📊</span>
                <span class="section-title">积分记录</span>
              </div>
              
              <div class="year-filter">
                <button 
                  v-for="year in availableYears" 
                  :key="year"
                  class="year-btn"
                  :class="{ active: selectedYear === year }"
                  @click="selectedYear = year"
                >
                  {{ year }}年
                </button>
                <button class="year-btn" :class="{ active: selectedYear === null }" @click="selectedYear = null">
                  全部
                </button>
              </div>
              
              <div class="history-list" v-if="filteredHistory.length > 0">
                <div v-for="record in filteredHistory" :key="record.id" class="history-item">
                  <div class="history-left">
                    <div class="history-icon" :class="record.type">
                      {{ getHistoryIcon(record) }}
                    </div>
                    <div class="history-info">
                      <div class="history-source">{{ getHistorySourceLabel(record) }}</div>
                      <div class="history-desc">{{ record.description }}</div>
                      <div class="history-date">{{ formatDate(record.createdAt) }}</div>
                    </div>
                  </div>
                  <div class="history-points" :class="record.type">
                    {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                  </div>
                </div>
              </div>
              
              <div class="history-empty" v-else>
                <div class="empty-icon">📋</div>
                <p class="empty-text">暂无积分记录</p>
                <p class="empty-desc">消费或完成任务后会在这里显示</p>
              </div>
            </div>
          </div>
          
          <div v-else-if="currentTab === 'levelHistory'" class="tab-panel">
            <div class="level-history-section">
              <div class="section-header">
                <span class="section-icon">📜</span>
                <span class="section-title">等级历史</span>
              </div>
              
              <div class="level-timeline" v-if="levelHistory.length > 0">
                <div v-for="(item, index) in levelHistory" :key="index" class="timeline-item">
                  <div class="timeline-point" :class="{ 'latest': index === 0 }">
                    <span class="timeline-icon">{{ getMilestoneIcon(item.level) }}</span>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-level">{{ MEMBERSHIP_LEVEL_LABELS[item.level] }}</div>
                    <div class="timeline-date">{{ formatDate(item.date) }}</div>
                    <div class="timeline-reason">{{ getLevelUpReason(item.reason) }}</div>
                  </div>
                </div>
              </div>
              
              <div class="history-empty" v-else>
                <div class="empty-icon">📋</div>
                <p class="empty-text">暂无等级历史</p>
                <p class="empty-desc">消费升级后会在这里显示</p>
              </div>
            </div>
          </div>
          
          <div v-else-if="currentTab === 'compare'" class="tab-panel">
            <div class="compare-section">
              <div class="section-header">
                <span class="section-icon">📊</span>
                <span class="section-title">会员等级系统</span>
              </div>
              
              <div class="levels-table-wrapper">
                <table class="levels-table">
                  <thead>
                    <tr>
                      <th class="col-level">等级</th>
                      <th class="col-icon">图标</th>
                      <th class="col-threshold">升级门槛</th>
                      <th class="col-discount">房价折扣</th>
                      <th class="col-points">积分倍率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="level in allLevels" :key="level" 
                        :class="{ 'current-level': level === membership.level }">
                      <td class="col-level">
                        <span class="level-name-cell">{{ MEMBERSHIP_LEVEL_LABELS[level] }}</span>
                        <span v-if="level === membership.level" class="current-badge">当前</span>
                      </td>
                      <td class="col-icon">
                        <span class="level-icon-cell">{{ getMilestoneIcon(level) }}</span>
                      </td>
                      <td class="col-threshold">
                        {{ MEMBERSHIP_LEVEL_THRESHOLDS[level] === 0 
                          ? '注册即得' 
                          : '¥' + MEMBERSHIP_LEVEL_THRESHOLDS[level]
                        }}
                      </td>
                      <td class="col-discount">
                        <span :class="getDiscountClass(level)">
                          {{ getDiscountLabel(level) }}
                        </span>
                      </td>
                      <td class="col-points">
                        <span :class="getMultiplierClass(level)">
                          {{ getMultiplierLabel(level) }}倍
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="benefits-compare-section">
              <div class="section-header">
                <span class="section-icon">🎁</span>
                <span class="section-title">会员权益对比</span>
              </div>
              
              <div class="benefits-compare-table-wrapper">
                <table class="benefits-compare-table">
                  <thead>
                    <tr>
                      <th class="col-benefit">权益</th>
                      <th class="col-level-col">普通会员</th>
                      <th class="col-level-col">银卡会员</th>
                      <th class="col-level-col">金卡会员</th>
                      <th class="col-level-col">钻石会员</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in benefitsCompareList" :key="item.id">
                      <td class="col-benefit">
                        <span class="benefit-icon-compare">{{ item.icon }}</span>
                        <span class="benefit-name-compare">{{ item.name }}</span>
                      </td>
                      <td class="col-level-col">
                        <span v-if="item.levels.includes(MEMBERSHIP_LEVELS.NORMAL)" 
                              class="check-icon">✓</span>
                        <span v-else class="cross-icon">—</span>
                      </td>
                      <td class="col-level-col" :class="{ 'has-benefit': item.levels.includes(membership.level) }">
                        <span v-if="item.levels.includes(MEMBERSHIP_LEVELS.SILVER)" 
                              class="check-icon">✓</span>
                        <span v-else class="cross-icon">—</span>
                      </td>
                      <td class="col-level-col" :class="{ 'has-benefit': item.levels.includes(membership.level) }">
                        <span v-if="item.levels.includes(MEMBERSHIP_LEVELS.GOLD)" 
                              class="check-icon">✓</span>
                        <span v-else class="cross-icon">—</span>
                      </td>
                      <td class="col-level-col" :class="{ 'has-benefit': item.levels.includes(membership.level) }">
                        <span v-if="item.levels.includes(MEMBERSHIP_LEVELS.DIAMOND)" 
                              class="check-icon">✓</span>
                        <span v-else class="cross-icon">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getUserMembership,
  getLevelProgress,
  getBenefits,
  getTotalPoints,
  getPointsHistory,
  getLevelHistory,
  getDiscountRate,
  getPointsMultiplier,
  MEMBERSHIP_LEVELS,
  MEMBERSHIP_LEVEL_LABELS,
  MEMBERSHIP_LEVEL_ICONS,
  MEMBERSHIP_LEVEL_COLORS,
  MEMBERSHIP_LEVEL_THRESHOLDS,
  MEMBERSHIP_LEVEL_BENEFITS,
  MEMBERSHIP_EVENT,
  seedSampleMembership
} from '../data/membership'
import { getCurrentUser } from '../data/user'

const user = ref(null)
const updateCount = ref(0)
const selectedYear = ref(null)
const currentTab = ref('overview')

const mainTabs = [
  { value: 'overview', label: '会员中心', icon: '👑' },
  { value: 'history', label: '积分记录', icon: '📊' },
  { value: 'levelHistory', label: '等级历史', icon: '📜' },
  { value: 'compare', label: '等级对比', icon: '📋' }
]

const defaultMembership = {
  level: MEMBERSHIP_LEVELS.NORMAL,
  totalSpent: 0,
  joinDate: new Date().toISOString(),
  lastUpgradeDate: new Date().toISOString(),
  monthlyCouponIssued: {},
  pointsHistory: [],
  levelHistory: []
}

const defaultProgress = {
  currentLevel: MEMBERSHIP_LEVELS.NORMAL,
  currentSpent: 0,
  isMaxLevel: false,
  progress: 0,
  nextLevel: MEMBERSHIP_LEVELS.SILVER,
  nextThreshold: 1000,
  remaining: 1000
}

const benefitsCompareList = computed(() => {
  return [
    {
      id: 'discount',
      name: '房价折扣',
      icon: '🏨',
      levels: [MEMBERSHIP_LEVELS.SILVER, MEMBERSHIP_LEVELS.GOLD, MEMBERSHIP_LEVELS.DIAMOND]
    },
    {
      id: 'points_multiplier',
      name: '积分倍率',
      icon: '💰',
      levels: [MEMBERSHIP_LEVELS.SILVER, MEMBERSHIP_LEVELS.GOLD, MEMBERSHIP_LEVELS.DIAMOND]
    },
    {
      id: 'monthly_coupon',
      name: '月度优惠券',
      icon: '🎫',
      levels: [MEMBERSHIP_LEVELS.SILVER, MEMBERSHIP_LEVELS.GOLD, MEMBERSHIP_LEVELS.DIAMOND]
    },
    {
      id: 'priority_customer',
      name: '优先客服',
      icon: '👨‍💼',
      levels: [MEMBERSHIP_LEVELS.SILVER, MEMBERSHIP_LEVELS.GOLD, MEMBERSHIP_LEVELS.DIAMOND]
    },
    {
      id: 'birthday_gift',
      name: '生日特权',
      icon: '🎂',
      levels: [MEMBERSHIP_LEVELS.GOLD, MEMBERSHIP_LEVELS.DIAMOND]
    },
    {
      id: 'flex_cancel',
      name: '灵活取消',
      icon: '🔄',
      levels: [MEMBERSHIP_LEVELS.GOLD, MEMBERSHIP_LEVELS.DIAMOND]
    },
    {
      id: 'priority_event',
      name: '专属活动',
      icon: '🎉',
      levels: [MEMBERSHIP_LEVELS.DIAMOND]
    },
    {
      id: 'exclusive_gift',
      name: '专属礼品',
      icon: '🎁',
      levels: [MEMBERSHIP_LEVELS.DIAMOND]
    }
  ]
})

const handleMembershipUpdate = () => {
  updateCount.value++
}

const allLevels = [
  MEMBERSHIP_LEVELS.NORMAL,
  MEMBERSHIP_LEVELS.SILVER,
  MEMBERSHIP_LEVELS.GOLD,
  MEMBERSHIP_LEVELS.DIAMOND
]

const membership = computed(() => {
  updateCount.value
  if (!user.value) return { ...defaultMembership }
  return getUserMembership(user.value.id)
})

const progress = computed(() => {
  updateCount.value
  if (!user.value) return { ...defaultProgress }
  return getLevelProgress(user.value.id)
})

const levelIcon = computed(() => {
  if (!membership.value) return ''
  return MEMBERSHIP_LEVEL_ICONS[membership.value.level] || ''
})

const levelLabel = computed(() => {
  if (!membership.value) return ''
  return MEMBERSHIP_LEVEL_LABELS[membership.value.level] || ''
})

const nextLevelLabel = computed(() => {
  if (!progress.value || progress.value.isMaxLevel) return ''
  return MEMBERSHIP_LEVEL_LABELS[progress.value.nextLevel] || ''
})

const headerBgStyle = computed(() => {
  if (!membership.value) return {}
  const colors = MEMBERSHIP_LEVEL_COLORS[membership.value.level]
  return {
    background: colors?.gradient || 'linear-gradient(135deg, #666 0%, #999 100%)'
  }
})

const discountRate = computed(() => {
  if (!membership.value) return 1
  return getDiscountRate(membership.value.level)
})

const pointsMultiplier = computed(() => {
  if (!membership.value) return 1
  return getPointsMultiplier(membership.value.level)
})

const allBenefits = computed(() => {
  if (!membership.value) return []
  return getBenefits(membership.value.level)
})

const totalPoints = computed(() => {
  updateCount.value
  if (!user.value) return 0
  return getTotalPoints(user.value.id)
})

const pointsHistory = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getPointsHistory(user.value.id, selectedYear.value)
})

const filteredHistory = computed(() => {
  return pointsHistory.value
})

const availableYears = computed(() => {
  if (!pointsHistory.value.length) return []
  const years = [...new Set(pointsHistory.value.map(h => h.year))]
  return years.sort((a, b) => b - a)
})

const levelHistory = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getLevelHistory(user.value.id)
})

const isLevelReached = (level) => {
  if (!membership.value) return false
  const currentIndex = allLevels.indexOf(membership.value.level)
  const levelIndex = allLevels.indexOf(level)
  return levelIndex <= currentIndex
}

const getMilestoneIcon = (level) => {
  return MEMBERSHIP_LEVEL_ICONS[level] || '🎁'
}

const getLevelThreshold = (level) => {
  return MEMBERSHIP_LEVEL_THRESHOLDS[level] || 0
}

const getDiscountLabel = (level) => {
  const rate = getDiscountRate(level)
  if (rate === 1) return '无'
  return (rate * 100) + '折'
}

const getMultiplierLabel = (level) => {
  return getPointsMultiplier(level)
}

const getDiscountClass = (level) => {
  const rate = getDiscountRate(level)
  if (rate < 1) return 'has-benefit'
  return ''
}

const getMultiplierClass = (level) => {
  const multiplier = getPointsMultiplier(level)
  if (multiplier > 1) return 'has-benefit'
  return ''
}

const getHistoryIcon = (record) => {
  const icons = {
    consumption: '🛒',
    sign_in: '📅',
    sharing: '📤',
    review: '✍️',
    invite: '👥',
    exchange: '🎁',
    expire: '⏰'
  }
  return icons[record.source] || (record.type === 'income' ? '💰' : '💸')
}

const getHistorySourceLabel = (record) => {
  const labels = {
    consumption: '消费积分',
    sign_in: '签到奖励',
    sharing: '分享奖励',
    review: '评价奖励',
    invite: '邀请奖励',
    exchange: '积分兑换',
    expire: '积分过期'
  }
  return labels[record.source] || (record.type === 'income' ? '获得积分' : '消耗积分')
}

const getLevelUpReason = (reason) => {
  const reasons = {
    new_user: '新用户注册',
    spent_upgrade: '消费升级'
  }
  return reasons[reason] || reason
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    ElMessage.warning('请先登录')
    return
  }
  user.value = currentUser
  
  seedSampleMembership(user.value.id)
  
  if (typeof window !== 'undefined') {
    window.addEventListener(MEMBERSHIP_EVENT, handleMembershipUpdate)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(MEMBERSHIP_EVENT, handleMembershipUpdate)
  }
})
</script>

<style scoped>
.membership-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding-bottom: 2rem;
}

.membership-header {
  padding: 1rem;
}

.header-bg {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 16px;
  padding: 2rem;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.level-badge {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.level-icon {
  font-size: 2.5rem;
}

.level-info {
  flex: 1;
}

.level-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.level-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.level-total-spent {
  font-size: 0.95rem;
  opacity: 0.9;
}

.progress-section {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-remaining {
  font-size: 0.9rem;
  opacity: 0.95;
}

.progress-bar-wrapper {
  position: relative;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-milestones {
  display: flex;
  justify-content: space-between;
}

.milestone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.milestone.reached {
  opacity: 1;
}

.milestone.current {
  opacity: 1;
  transform: scale(1.1);
}

.milestone-icon {
  font-size: 1.25rem;
}

.milestone-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

.max-level-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.max-icon {
  font-size: 1.5rem;
}

.max-text {
  font-size: 1rem;
  font-weight: 500;
}

.tabs-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.main-tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  gap: 0.25rem;
}

.main-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  flex-shrink: 0;
}

.main-tab-btn:hover {
  background: #f5f5f5;
}

.main-tab-btn.active {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
}

.tab-icon {
  font-size: 1rem;
}

.tab-label {
  font-size: 0.95rem;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.tab-panel {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.points-section {
  margin-bottom: 1.5rem;
}

.points-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.points-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.points-icon {
  font-size: 1.25rem;
}

.points-multiplier {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.multiplier-label {
  font-size: 0.85rem;
  color: #666;
}

.multiplier-value {
  font-size: 1rem;
  font-weight: 700;
  color: #ff5a5f;
}

.points-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.points-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #999;
}

.points-expire-tip {
  color: #fa8c16;
}

.benefits-section,
.history-section,
.level-history-section,
.compare-section,
.benefits-compare-section {
  margin-bottom: 1.5rem;
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

.section-count {
  margin-left: auto;
  font-size: 0.85rem;
  color: #999;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.benefit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.benefit-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff5f5;
  border-radius: 12px;
  flex-shrink: 0;
}

.benefit-content {
  flex: 1;
  min-width: 0;
}

.benefit-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.benefit-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.year-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.year-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.2s ease;
}

.year-btn:hover {
  border-color: #ff5a5f;
  color: #ff5a5f;
}

.year-btn.active {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  border-color: #ff5a5f;
}

.history-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.history-icon.income {
  background: #f6ffed;
}

.history-icon.expense {
  background: #fff2f0;
}

.history-info {
  min-width: 0;
}

.history-source {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.125rem;
}

.history-desc {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.history-date {
  font-size: 0.75rem;
  color: #999;
}

.history-points {
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
}

.history-points.income {
  color: #52c41a;
}

.history-points.expense {
  color: #ff4d4f;
}

.history-empty,
.benefits-empty {
  padding: 3rem 1rem;
  text-align: center;
  background: white;
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

.level-timeline {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 20px;
  top: 60px;
  bottom: 0;
  width: 2px;
  background: #e8e8e8;
}

.timeline-point {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.timeline-point.latest {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
}

.timeline-icon {
  font-size: 1.1rem;
}

.timeline-content {
  flex: 1;
  padding-top: 0.25rem;
}

.timeline-level {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.timeline-date {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.timeline-reason {
  font-size: 0.8rem;
  color: #999;
}

.levels-table-wrapper,
.benefits-compare-table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.levels-table,
.benefits-compare-table {
  width: 100%;
  border-collapse: collapse;
}

.levels-table thead,
.benefits-compare-table thead {
  background: #fafafa;
}

.levels-table th,
.levels-table td,
.benefits-compare-table th,
.benefits-compare-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.levels-table th,
.benefits-compare-table th {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.levels-table td,
.benefits-compare-table td {
  font-size: 0.95rem;
  color: #666;
}

.levels-table tr.current-level {
  background: #fff5f5;
}

.col-level {
  text-align: left !important;
}

.level-name-cell {
  font-weight: 600;
  color: #333;
}

.current-badge {
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  color: white;
  font-size: 0.75rem;
  border-radius: 10px;
}

.level-icon-cell {
  font-size: 1.5rem;
}

.has-benefit {
  color: #ff5a5f;
  font-weight: 600;
}

.col-benefit {
  text-align: left !important;
}

.benefit-icon-compare {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.benefit-name-compare {
  font-weight: 500;
}

.check-icon {
  color: #52c41a;
  font-weight: 700;
  font-size: 1.1rem;
}

.cross-icon {
  color: #d9d9d9;
}

.col-level-col.has-benefit {
  background: #fff5f5;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .progress-milestones {
    display: none;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .history-desc {
    max-width: 150px;
  }
  
  .points-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .points-multiplier {
    width: 100%;
    justify-content: space-between;
  }
  
  .points-tips {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .main-tabs {
    padding: 0.25rem;
  }
  
  .main-tab-btn {
    padding: 0.625rem 1rem;
  }
  
  .levels-table-wrapper,
  .benefits-compare-table-wrapper {
    margin: 0 -1rem;
    border-radius: 0;
  }
  
  .levels-table th,
  .levels-table td,
  .benefits-compare-table th,
  .benefits-compare-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .header-bg {
    padding: 1.5rem;
  }
  
  .level-name {
    font-size: 1.5rem;
  }
  
  .points-value {
    font-size: 2rem;
  }
}
</style>
