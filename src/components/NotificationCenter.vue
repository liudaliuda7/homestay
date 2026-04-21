<template>
  <div class="content-section">
    <div class="section-header">
      <div class="header-left">
        <h2>消息中心</h2>
        <p>查看和管理您的所有消息</p>
      </div>
      <div class="header-right">
        <button 
          class="action-btn"
          v-if="hasUnread"
          @click="handleMarkAllRead"
        >
          全部已读
        </button>
        <button 
          class="action-btn"
          v-if="hasRead"
          @click="handleClearRead"
        >
          清空已读
        </button>
      </div>
    </div>
    
    <div class="tab-container">
      <div class="tab-header">
        <div 
          v-for="filter in filterOptions"
          :key="filter.value"
          class="tab-item"
          :class="{ active: currentFilter === filter.value }"
          @click="handleFilterChange(filter.value)"
        >
          <span class="tab-icon">{{ filter.icon }}</span>
          <span class="tab-text">{{ filter.label }}</span>
          <span 
            v-if="filter.value === null && unreadCount > 0" 
            class="tab-badge"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </div>
      </div>
      
      <div class="tab-content">
        <div class="empty-state" v-if="filteredNotifications.length === 0">
          <span class="empty-icon">🔔</span>
          <span class="empty-text">
            {{ currentFilter ? '暂无该类型消息' : '暂无消息' }}
          </span>
        </div>
        
        <div 
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="notification-card"
          :class="{ 
            unread: !notification.isRead,
            hovered: hoveredId === notification.id
          }"
          @mouseenter="hoveredId = notification.id"
          @mouseleave="hoveredId = null"
          @click="handleNotificationClick(notification)"
        >
          <div class="card-indicator" v-if="!notification.isRead"></div>
          
          <div class="card-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          
          <div class="card-content">
            <div class="card-header">
              <div class="card-header-left">
                <span class="card-title">{{ notification.title }}</span>
                <span class="card-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <div class="card-actions" v-if="hoveredId === notification.id">
                <button 
                  class="action-link"
                  v-if="!notification.isRead"
                  @click.stop="handleMarkRead(notification.id)"
                >
                  标记已读
                </button>
                <button 
                  class="action-link delete"
                  @click.stop="handleDelete(notification.id)"
                >
                  删除
                </button>
              </div>
            </div>
            <div class="card-body">
              {{ notification.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  formatNotificationTime,
  getNotificationIcon,
  NOTIFICATION_TYPES,
  NOTIFICATION_EVENT
} from '../data/notifications';
import { getCurrentUser } from '../data/user';

const router = useRouter();
const route = useRoute();

const notifications = ref([]);
const currentFilter = ref(null);
const hoveredId = ref(null);

const currentUser = computed(() => getCurrentUser());

const filterOptions = [
  { label: '全部消息', value: null, icon: '📬' },
  { label: '订单消息', value: NOTIFICATION_TYPES.ORDER, icon: '📋' },
  { label: '评论消息', value: NOTIFICATION_TYPES.REVIEW, icon: '💬' },
  { label: '系统消息', value: NOTIFICATION_TYPES.SYSTEM, icon: '🔔' }
];

const unreadCount = computed(() => {
  if (!currentUser.value) return 0;
  return getUnreadCount(currentUser.value.id);
});

const hasUnread = computed(() => unreadCount.value > 0);

const hasRead = computed(() => {
  return notifications.value.some(n => n.isRead);
});

const filteredNotifications = computed(() => {
  if (currentFilter.value === null) {
    return notifications.value;
  }
  return notifications.value.filter(n => n.type === currentFilter.value);
});

const loadNotifications = () => {
  if (!currentUser.value) {
    notifications.value = [];
    return;
  }
  notifications.value = getUserNotifications(currentUser.value.id, currentFilter.value);
};

const handleNotificationUpdate = () => {
  loadNotifications();
};

const formatTime = (createdAt) => {
  return formatNotificationTime(createdAt);
};

const handleFilterChange = (value) => {
  currentFilter.value = value;
  if (currentUser.value) {
    notifications.value = getUserNotifications(currentUser.value.id, value);
  }
};

const handleNotificationClick = (notification) => {
  if (!notification.isRead) {
    markAsRead(notification.id);
  }
  
  switch (notification.type) {
    case NOTIFICATION_TYPES.ORDER:
      if (notification.data && notification.data.orderId) {
        router.push('/user/order');
      }
      break;
    case NOTIFICATION_TYPES.REVIEW:
      if (notification.data && notification.data.propertyId) {
        router.push(`/property/${notification.data.propertyId}`);
      }
      break;
  }
};

const handleMarkRead = (notificationId) => {
  const result = markAsRead(notificationId);
  if (result.success) {
    ElMessage({
      message: '已标记为已读',
      type: 'success',
      duration: 1500
    });
  }
};

const handleMarkAllRead = async () => {
  if (!currentUser.value) return;
  
  try {
    await ElMessageBox.confirm('确定要将所有消息标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });
    
    const result = markAllAsRead(currentUser.value.id);
    if (result.success) {
      ElMessage({
        message: '已全部标记为已读',
        type: 'success',
        duration: 1500
      });
    }
  } catch {
    
  }
};

const handleDelete = async (notificationId) => {
  if (!currentUser.value) return;
  
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const result = deleteNotification(notificationId, currentUser.value.id);
    if (result.success) {
      ElMessage({
        message: '删除成功',
        type: 'success',
        duration: 1500
      });
    }
  } catch {
    
  }
};

const handleClearRead = async () => {
  if (!currentUser.value) return;
  
  try {
    await ElMessageBox.confirm('确定要清空所有已读消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const result = clearReadNotifications(currentUser.value.id);
    if (result.success) {
      ElMessage({
        message: '已清空已读消息',
        type: 'success',
        duration: 1500
      });
    }
  } catch {
    
  }
};

onMounted(() => {
  loadNotifications();
  if (typeof window !== 'undefined') {
    window.addEventListener(NOTIFICATION_EVENT, handleNotificationUpdate);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener(NOTIFICATION_EVENT, handleNotificationUpdate);
  }
});
</script>

<style scoped>
.content-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-left h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.header-left p {
  color: #666;
  margin: 0;
  font-size: 0.85rem;
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  background: none;
  border: 1px solid #e0e0e0;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #ff5a5f;
  color: #ff5a5f;
  background-color: #fff5f5;
}

.tab-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tab-header {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0;
  flex-wrap: wrap;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 0.9rem;
  color: #666;
  border-radius: 8px 8px 0 0;
}

.tab-item:hover {
  background-color: #fafafa;
  color: #333;
}

.tab-item.active {
  color: #ff5a5f;
  border-bottom-color: #ff5a5f;
  background-color: #fff5f5;
}

.tab-icon {
  font-size: 1rem;
}

.tab-text {
  font-weight: 500;
}

.tab-badge {
  background: #ff5a5f;
  color: white;
  font-size: 0.7rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.4;
}

.empty-text {
  font-size: 0.9rem;
  color: #999;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  padding: 1.25rem;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid transparent;
}

.notification-card:hover {
  background: #f5f5f5;
}

.notification-card.unread {
  background: #fffbfb;
  border-left-color: #ff5a5f;
}

.notification-card.unread:hover {
  background: #fff5f5;
}

.card-indicator {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff5a5f;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-right: 1rem;
}

.notification-card.unread .card-icon {
  background: #ffe5e5;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.card-header-left {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.notification-card.unread .card-title {
  font-weight: 700;
}

.card-time {
  font-size: 0.75rem;
  color: #999;
  flex-shrink: 0;
}

.card-body {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-actions {
  display: flex;
  gap: 1rem;
}

.action-link {
  background: none;
  border: none;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.action-link:hover {
  color: #ff5a5f;
}

.action-link.delete:hover {
  color: #ff474c;
}

@media (max-width: 1024px) {
  .tab-header {
    overflow-x: auto;
    padding-bottom: 0;
    flex-wrap: nowrap;
    scrollbar-width: none;
  }
  
  .tab-header::-webkit-scrollbar {
    display: none;
  }
  
  .tab-item {
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-right {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
    text-align: center;
  }
  
  .notification-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .card-icon {
    margin-right: 0;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .card-header-left {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }
  
  .card-indicator {
    top: 1rem;
    right: 1rem;
  }
  
  .tab-item {
    padding: 0.75rem 1rem;
  }
}
</style>
