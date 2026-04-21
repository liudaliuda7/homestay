<template>
  <div class="notification-dropdown" ref="dropdownRef">
    <div class="dropdown-header">
      <span class="header-title">消息通知</span>
      <button 
        class="mark-all-btn"
        v-if="unreadCount > 0"
        @click="handleMarkAllRead"
      >
        全部已读
      </button>
    </div>
    
    <div class="dropdown-body">
      <div class="empty-state" v-if="notifications.length === 0">
        <span class="empty-icon">🔔</span>
        <span class="empty-text">暂无消息</span>
      </div>
      
      <div 
        v-for="notification in recentNotifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.isRead }"
        @click="handleNotificationClick(notification)"
      >
        <div class="item-icon">
          {{ getNotificationIcon(notification.type) }}
        </div>
        <div class="item-content">
          <div class="item-title">
            {{ notification.title }}
            <span class="unread-dot" v-if="!notification.isRead"></span>
          </div>
          <div class="item-preview">
            {{ getPreview(notification.content) }}
          </div>
          <div class="item-time">
            {{ formatTime(notification.createdAt) }}
          </div>
        </div>
        <button 
          class="mark-read-btn"
          v-if="!notification.isRead"
          @click.stop="handleMarkRead(notification.id)"
        >
          已读
        </button>
      </div>
    </div>
    
    <div class="dropdown-footer">
      <button class="view-all-btn" @click="handleViewAll">
        查看全部消息
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationById,
  formatNotificationTime,
  getNotificationIcon,
  NOTIFICATION_TYPES,
  NOTIFICATION_EVENT
} from '../data/notifications';
import { getCurrentUser } from '../data/user';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'close']);

const router = useRouter();
const dropdownRef = ref(null);
const notifications = ref([]);

const currentUser = computed(() => getCurrentUser());

const unreadCount = computed(() => {
  if (!currentUser.value) return 0;
  return getUnreadCount(currentUser.value.id);
});

const recentNotifications = computed(() => {
  return notifications.value.slice(0, 5);
});

const loadNotifications = () => {
  if (!currentUser.value) {
    notifications.value = [];
    return;
  }
  notifications.value = getUserNotifications(currentUser.value.id);
};

const getPreview = (content) => {
  if (!content) return '';
  return content.length > 50 ? content.substring(0, 50) + '...' : content;
};

const formatTime = (createdAt) => {
  return formatNotificationTime(createdAt);
};

const handleNotificationClick = (notification) => {
  if (!notification.isRead) {
    markAsRead(notification.id);
    loadNotifications();
  }
  
  emit('close');
  
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
    default:
      router.push('/user/notifications');
      break;
  }
};

const handleMarkRead = (notificationId) => {
  const result = markAsRead(notificationId);
  if (result.success) {
    loadNotifications();
    ElMessage({
      message: '已标记为已读',
      type: 'success',
      duration: 1500
    });
  }
};

const handleMarkAllRead = () => {
  if (!currentUser.value) return;
  
  const result = markAllAsRead(currentUser.value.id);
  if (result.success) {
    loadNotifications();
    ElMessage({
      message: '全部已标记为已读',
      type: 'success',
      duration: 1500
    });
  }
};

const handleViewAll = () => {
  emit('close');
  router.push('/user/notifications');
};

const handleNotificationUpdate = () => {
  loadNotifications();
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

defineExpose({
  loadNotifications
});
</script>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  max-height: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.header-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.mark-all-btn {
  background: none;
  border: none;
  color: #ff5a5f;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.mark-all-btn:hover {
  background-color: #fff5f5;
}

.dropdown-body {
  flex: 1;
  overflow-y: auto;
  max-height: 360px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 8px;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.4;
}

.empty-text {
  font-size: 0.85rem;
  color: #999;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f8f8f8;
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #fafafa;
}

.notification-item.unread {
  background-color: #fffbfb;
}

.notification-item.unread:hover {
  background-color: #fff5f5;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-right: 12px;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ff5a5f;
  flex-shrink: 0;
}

.item-preview {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
}

.item-time {
  font-size: 0.7rem;
  color: #999;
}

.mark-read-btn {
  background: none;
  border: 1px solid #e0e0e0;
  color: #666;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.mark-read-btn:hover {
  border-color: #ff5a5f;
  color: #ff5a5f;
  background-color: #fff5f5;
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.view-all-btn {
  width: 100%;
  background: none;
  border: none;
  color: #ff5a5f;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background-color: #fff5f5;
}
</style>
