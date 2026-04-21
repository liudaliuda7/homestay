<template>
  <div class="points-page">
    <div class="points-header">
      <div class="header-bg">
        <div class="header-content">
          <div class="points-info">
            <div class="points-label">我的积分</div>
            <div class="points-value">{{ pointsSummary.balance }}</div>
            <div class="points-tips">今日已赚 {{ pointsSummary.todayEarned }} 积分</div>
          </div>
          <div class="sign-in-section">
            <button 
              class="sign-in-btn" 
              :class="{ signed: signInStatus.hasSigned }"
              @click="handleSignIn"
              :disabled="signInStatus.hasSigned"
            >
              <span v-if="!signInStatus.hasSigned" class="sign-text">立即签到</span>
              <span v-else class="signed-text">已签到</span>
              <span class="sign-days" v-if="signInStatus.consecutiveDays > 0">
                连续{{ signInStatus.consecutiveDays }}天
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="points-stats">
      <div class="stat-item">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">{{ pointsSummary.totalEarned }}</div>
          <div class="stat-label">累计获得</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">🎁</div>
        <div class="stat-info">
          <div class="stat-value">{{ pointsSummary.totalSpent }}</div>
          <div class="stat-label">已消耗</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-value">{{ pointsSummary.monthEarned }}</div>
          <div class="stat-label">本月获得</div>
        </div>
      </div>
    </div>
    
    <div class="points-tasks">
      <div class="section-header">
        <span class="section-icon">🎯</span>
        <span class="section-title">赚积分任务</span>
      </div>
      <div class="task-list">
        <div class="task-item">
          <div class="task-icon">📅</div>
          <div class="task-info">
            <div class="task-name">每日签到</div>
            <div class="task-desc">连续签到可获得额外奖励</div>
          </div>
          <div class="task-reward">
            <span class="reward-value">+10积分</span>
            <span class="reward-bonus" v-if="signInStatus.consecutiveDays > 0">
              额外+{{ Math.min(signInStatus.consecutiveDays * 2, 10) }}
            </span>
          </div>
        </div>
        <div class="task-item">
          <div class="task-icon">💰</div>
          <div class="task-info">
            <div class="task-name">消费返积分</div>
            <div class="task-desc">每消费1元获得1积分</div>
          </div>
          <div class="task-reward">
            <span class="reward-value">无上限</span>
          </div>
        </div>
        <div class="task-item">
          <div class="task-icon">🔗</div>
          <div class="task-info">
            <div class="task-name">分享房源</div>
            <div class="task-desc">分享房源到社交平台</div>
          </div>
          <div class="task-reward">
            <span class="reward-value">+5积分/次</span>
          </div>
        </div>
        <div class="task-item">
          <div class="task-icon">💬</div>
          <div class="task-info">
            <div class="task-name">发表评价</div>
            <div class="task-desc">完成订单后评价房源</div>
          </div>
          <div class="task-reward">
            <span class="reward-value">+20积分/次</span>
          </div>
        </div>
        <div class="task-item">
          <div class="task-icon">👥</div>
          <div class="task-info">
            <div class="task-name">邀请好友</div>
            <div class="task-desc">邀请好友注册并完成首单</div>
          </div>
          <div class="task-reward">
            <span class="reward-value">+100积分/人</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="points-history">
      <div class="section-header">
        <span class="section-icon">📊</span>
        <span class="section-title">积分明细</span>
      </div>
      
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.value"
          class="tab-btn"
          :class="{ active: currentFilter === tab.value }"
          @click="currentFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="history-list" v-if="filteredHistory.length > 0">
        <div v-for="record in filteredHistory" :key="record.id" class="history-item">
          <div class="history-icon" :class="{ 'income': record.isIncome, 'expense': !record.isIncome }">
            {{ getTypeIcon(record.type) }}
          </div>
          <div class="history-info">
            <div class="history-title">{{ getTypeLabel(record.type) }}</div>
            <div class="history-desc">{{ record.description }}</div>
            <div class="history-time">{{ formatTime(record.createdAt) }}</div>
          </div>
          <div class="history-amount" :class="{ 'income': record.isIncome, 'expense': !record.isIncome }">
            <span v-if="record.isIncome">+{{ record.amount }}</span>
            <span v-else>-{{ record.amount }}</span>
          </div>
        </div>
      </div>
      
      <div class="history-empty" v-else>
        <div class="empty-icon">📊</div>
        <p class="empty-text">暂无积分记录</p>
        <p class="empty-desc">完成任务即可获得积分</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getPointsSummary,
  checkSignIn,
  signIn,
  getPointsHistory,
  POINTS_TYPES,
  POINTS_TYPE_LABELS,
  POINTS_TYPE_ICONS,
  POINTS_EVENT,
  formatPointsTime
} from '../data/points'
import { getCurrentUser } from '../data/user'

const router = useRouter()

const user = ref(null)
const currentFilter = ref('all')
const updateCount = ref(0)

const handlePointsUpdate = () => {
  updateCount.value++
}

const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 'income', label: '获得' },
  { value: 'expense', label: '消耗' }
]

const pointsSummary = computed(() => {
  updateCount.value
  if (!user.value) {
    return {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      todayEarned: 0,
      monthEarned: 0
    }
  }
  return getPointsSummary(user.value.id)
})

const signInStatus = computed(() => {
  updateCount.value
  if (!user.value) {
    return {
      hasSigned: false,
      consecutiveDays: 0
    }
  }
  return checkSignIn(user.value.id)
})

const pointsHistory = computed(() => {
  updateCount.value
  if (!user.value) return []
  return getPointsHistory(user.value.id, null, 50)
})

const filteredHistory = computed(() => {
  if (currentFilter.value === 'all') {
    return pointsHistory.value
  } else if (currentFilter.value === 'income') {
    return pointsHistory.value.filter(r => r.isIncome)
  } else {
    return pointsHistory.value.filter(r => !r.isIncome)
  }
})

const getTypeLabel = (type) => {
  return POINTS_TYPE_LABELS[type] || type
}

const getTypeIcon = (type) => {
  return POINTS_TYPE_ICONS[type] || '💰'
}

const formatTime = (time) => {
  return formatPointsTime(time)
}

const handleSignIn = () => {
  if (!user.value) return
  
  const result = signIn(user.value.id)
  
  if (result.success) {
    ElMessage.success({
      message: result.message,
      duration: 2000
    })
    updateCount.value++
  } else {
    ElMessage.warning({
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
    window.addEventListener(POINTS_EVENT, handlePointsUpdate)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(POINTS_EVENT, handlePointsUpdate)
  }
})
</script>

<style scoped>
.points-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding-bottom: 2rem;
}

.points-header {
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

.points-info {
  color: white;
}

.points-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.points-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.points-tips {
  font-size: 0.85rem;
  opacity: 0.9;
}

.sign-in-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.sign-in-btn {
  padding: 0.875rem 2rem;
  background-color: white;
  color: #ff5a5f;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sign-in-btn:hover:not(.signed) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.sign-in-btn.signed {
  background-color: rgba(255, 255, 255, 0.9);
  cursor: default;
}

.sign-text,
.signed-text {
  font-size: 1rem;
}

.sign-days {
  font-size: 0.75rem;
  color: #666;
}

.points-stats {
  max-width: 1200px;
  margin: -1rem auto 0;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.points-tasks,
.points-history {
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.task-icon {
  font-size: 1.5rem;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.task-desc {
  font-size: 0.85rem;
  color: #666;
}

.task-reward {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.reward-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ff5a5f;
}

.reward-bonus {
  font-size: 0.75rem;
  color: #fa8c16;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-btn {
  padding: 0.5rem 1.25rem;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: #ff5a5f;
  color: #ff5a5f;
}

.tab-btn.active {
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  border-color: transparent;
  color: white;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.history-icon.income {
  background-color: #f6ffed;
}

.history-icon.expense {
  background-color: #fff2f0;
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.history-desc {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.history-time {
  font-size: 0.75rem;
  color: #999;
}

.history-amount {
  font-size: 1.1rem;
  font-weight: 600;
}

.history-amount.income {
  color: #52c41a;
}

.history-amount.expense {
  color: #ff4d4f;
}

.history-empty {
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .points-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    justify-content: center;
  }
  
  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .tab-btn {
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .points-header {
    padding: 1.5rem 0;
  }
  
  .points-value {
    font-size: 2rem;
  }
  
  .sign-in-btn {
    padding: 0.75rem 1.5rem;
  }
  
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .task-reward {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    gap: 1rem;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .history-amount {
    width: 100%;
    text-align: right;
  }
}
</style>
