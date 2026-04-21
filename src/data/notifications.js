const STORAGE_KEY = 'homestay_notifications';
const EXPIRE_DAYS = 7;

export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  REVIEW: 'review',
  SYSTEM: 'system',
  ANNOUNCEMENT: 'announcement'
};

export const ORDER_NOTIFICATION_SUBTYPES = {
  CREATE: 'create',
  PAY: 'pay',
  CANCEL: 'cancel',
  REMINDER: 'reminder'
};

export const REVIEW_NOTIFICATION_SUBTYPES = {
  LIKE: 'like',
  REPLY: 'reply'
};

export const ANNOUNCEMENT_TYPES = {
  ACTIVITY: 'activity',
  MAINTENANCE: 'maintenance',
  UPDATE: 'update'
};

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getNotificationsData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    const now = new Date().getTime();
    
    if (parsed.expireTime && now > parsed.expireTime) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (e) {
    return null;
  }
};

const getNotifications = () => {
  const data = getNotificationsData();
  return data && data.items ? data.items : [];
};

const saveNotifications = (notifications) => {
  const data = {
    items: notifications,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getNextNotificationId = () => {
  const notifications = getNotifications();
  return notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
};

const createNotification = (notificationData) => {
  const notifications = getNotifications();
  
  const now = new Date();
  
  const newNotification = {
    id: getNextNotificationId(),
    type: notificationData.type,
    subtype: notificationData.subtype || null,
    title: notificationData.title,
    content: notificationData.content,
    userId: notificationData.userId,
    isRead: false,
    data: notificationData.data || {},
    createdAt: now.toISOString(),
    readAt: null,
    validUntil: notificationData.validUntil || null
  };
  
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  
  return {
    success: true,
    message: '通知创建成功',
    notification: newNotification
  };
};

export const createOrderNotification = (order, subtype, userId) => {
  let title = '';
  let content = '';
  const data = {
    orderId: order.id,
    orderNo: order.orderNo,
    propertyTitle: order.propertyTitle,
    checkInDate: order.checkInDate,
    checkOutDate: order.checkOutDate,
    totalPrice: order.totalPrice
  };
  
  switch (subtype) {
    case ORDER_NOTIFICATION_SUBTYPES.CREATE:
      title = '订单创建成功';
      content = `您的订单 ${order.orderNo} 已创建成功，请在30分钟内完成支付。房源：${order.propertyTitle}，入住日期：${order.checkInDate}，金额：¥${order.totalPrice}`;
      break;
    case ORDER_NOTIFICATION_SUBTYPES.PAY:
      title = '支付成功';
      content = `您的订单 ${order.orderNo} 已支付成功！房源：${order.propertyTitle}，入住日期：${order.checkInDate} 至 ${order.checkOutDate}，金额：¥${order.totalPrice}`;
      break;
    case ORDER_NOTIFICATION_SUBTYPES.CANCEL:
      title = '订单已取消';
      content = `您的订单 ${order.orderNo} 已取消。房源：${order.propertyTitle}，入住日期：${order.checkInDate}`;
      break;
    case ORDER_NOTIFICATION_SUBTYPES.REMINDER:
      title = '入住提醒';
      content = `您预订的 ${order.propertyTitle} 将于明天（${order.checkInDate}）入住，请做好准备。订单号：${order.orderNo}`;
      break;
  }
  
  return createNotification({
    type: NOTIFICATION_TYPES.ORDER,
    subtype: subtype,
    title: title,
    content: content,
    userId: userId,
    data: data
  });
};

export const createReviewNotification = (review, property, subtype, userId) => {
  let title = '';
  let content = '';
  const data = {
    reviewId: review.id,
    propertyId: review.propertyId,
    propertyTitle: property?.title || '',
    content: review.content?.substring(0, 50) || ''
  };
  
  switch (subtype) {
    case REVIEW_NOTIFICATION_SUBTYPES.LIKE:
      title = '评论被点赞';
      content = `您在 "${data.propertyTitle}" 的评论获得了新的点赞！评论摘要：${data.content}...`;
      break;
    case REVIEW_NOTIFICATION_SUBTYPES.REPLY:
      title = '收到评论回复';
      content = `您在 "${data.propertyTitle}" 的评论收到了新的回复："${review.hostReply?.content || ''}"`;
      data.replyContent = review.hostReply?.content || '';
      break;
  }
  
  return createNotification({
    type: NOTIFICATION_TYPES.REVIEW,
    subtype: subtype,
    title: title,
    content: content,
    userId: userId,
    data: data
  });
};

export const createAnnouncement = (announcementData) => {
  const data = {
    announcementType: announcementData.announcementType
  };
  
  return createNotification({
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    subtype: announcementData.announcementType,
    title: announcementData.title,
    content: announcementData.content,
    userId: 0,
    data: data,
    validUntil: announcementData.validUntil || null
  });
};

export const createSystemNotification = (notificationData, userId) => {
  return createNotification({
    type: NOTIFICATION_TYPES.SYSTEM,
    title: notificationData.title,
    content: notificationData.content,
    userId: userId,
    data: notificationData.data || {}
  });
};

export const getUserNotifications = (userId, type = null) => {
  const notifications = getNotifications();
  const now = new Date().getTime();
  
  let userNotifications = notifications.filter(n => {
    if (n.type === NOTIFICATION_TYPES.ANNOUNCEMENT) {
      if (n.validUntil && new Date(n.validUntil).getTime() < now) {
        return false;
      }
      return true;
    }
    return n.userId === userId;
  });
  
  if (type) {
    userNotifications = userNotifications.filter(n => n.type === type);
  }
  
  return userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getUnreadCount = (userId) => {
  const notifications = getUserNotifications(userId);
  return notifications.filter(n => !n.isRead).length;
};

export const markAsRead = (notificationId) => {
  const notifications = getNotifications();
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex === -1) {
    return {
      success: false,
      message: '通知不存在'
    };
  }
  
  notifications[notificationIndex].isRead = true;
  notifications[notificationIndex].readAt = new Date().toISOString();
  
  saveNotifications(notifications);
  
  return {
    success: true,
    message: '已标记为已读',
    notification: notifications[notificationIndex]
  };
};

export const markAllAsRead = (userId) => {
  const notifications = getNotifications();
  const now = new Date().toISOString();
  
  for (let i = 0; i < notifications.length; i++) {
    const n = notifications[i];
    if (n.userId === userId && !n.isRead) {
      notifications[i].isRead = true;
      notifications[i].readAt = now;
    } else if (n.type === NOTIFICATION_TYPES.ANNOUNCEMENT && !n.isRead) {
      notifications[i].isRead = true;
      notifications[i].readAt = now;
    }
  }
  
  saveNotifications(notifications);
  
  return {
    success: true,
    message: '已全部标记为已读'
  };
};

export const deleteNotification = (notificationId, userId) => {
  const notifications = getNotifications();
  const notificationIndex = notifications.findIndex(n => 
    n.id === notificationId && (n.userId === userId || n.type === NOTIFICATION_TYPES.ANNOUNCEMENT)
  );
  
  if (notificationIndex === -1) {
    return {
      success: false,
      message: '通知不存在'
    };
  }
  
  notifications.splice(notificationIndex, 1);
  saveNotifications(notifications);
  
  return {
    success: true,
    message: '删除成功'
  };
};

export const clearReadNotifications = (userId) => {
  const notifications = getNotifications();
  
  const filteredNotifications = notifications.filter(n => {
    if (n.type === NOTIFICATION_TYPES.ANNOUNCEMENT) {
      return true;
    }
    return n.userId !== userId || !n.isRead;
  });
  
  saveNotifications(filteredNotifications);
  
  return {
    success: true,
    message: '已清空已读消息'
  };
};

export const getNotificationById = (notificationId) => {
  const notifications = getNotifications();
  return notifications.find(n => n.id === notificationId) || null;
};

export const formatNotificationTime = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return '刚刚';
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return created.toLocaleDateString('zh-CN');
  }
};

export const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ORDER:
      return '📋';
    case NOTIFICATION_TYPES.REVIEW:
      return '💬';
    case NOTIFICATION_TYPES.SYSTEM:
      return '🔔';
    case NOTIFICATION_TYPES.ANNOUNCEMENT:
      return '📢';
    default:
      return '📬';
  }
};

export const getNotificationTypeLabel = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ORDER:
      return '订单消息';
    case NOTIFICATION_TYPES.REVIEW:
      return '评论消息';
    case NOTIFICATION_TYPES.SYSTEM:
      return '系统消息';
    case NOTIFICATION_TYPES.ANNOUNCEMENT:
      return '系统公告';
    default:
      return '全部';
  }
};

import { getOrdersByUserId, ORDER_STATUS } from './orders';

export const checkAndSendCheckInReminders = (userId) => {
  const orders = getOrdersByUserId(userId);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const upcomingOrders = orders.filter(order => {
    return (
      order.status === ORDER_STATUS.PAID &&
      order.checkInDate === tomorrowStr
    );
  });
  
  const notifications = getNotifications();
  const todayStr = today.toISOString().split('T')[0];
  
  upcomingOrders.forEach(order => {
    const reminderExists = notifications.some(n => 
      n.type === NOTIFICATION_TYPES.ORDER &&
      n.subtype === ORDER_NOTIFICATION_SUBTYPES.REMINDER &&
      n.userId === userId &&
      n.data?.orderId === order.id &&
      n.createdAt?.startsWith(todayStr)
    );
    
    if (!reminderExists) {
      createOrderNotification(order, ORDER_NOTIFICATION_SUBTYPES.REMINDER, userId);
    }
  });
};

const SEED_FLAG = 'homestay_notifications_seeded_v1';

export const seedSampleNotifications = (userId) => {
  const seeded = localStorage.getItem(SEED_FLAG);
  if (seeded) return false;
  
  const now = new Date();
  
  createNotification({
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    subtype: ANNOUNCEMENT_TYPES.ACTIVITY,
    title: '🎉 春节特惠活动',
    content: '春节期间预订民宿享8折优惠！活动时间：2024年1月20日至2月20日。使用优惠码：SPRING2024。',
    userId: 0,
    data: { announcementType: ANNOUNCEMENT_TYPES.ACTIVITY },
    validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  createNotification({
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    subtype: ANNOUNCEMENT_TYPES.UPDATE,
    title: '✨ 系统功能更新',
    content: '民宿之家已更新至v2.0版本，新增消息通知系统、优化搜索体验、支持更多支付方式。',
    userId: 0,
    data: { announcementType: ANNOUNCEMENT_TYPES.UPDATE },
    validUntil: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  createNotification({
    type: NOTIFICATION_TYPES.SYSTEM,
    title: '🎁 新人优惠券已发放',
    content: '欢迎加入民宿之家！我们已为您发放了一张价值50元的新人优惠券，可在首次预订时使用。',
    userId: userId,
    data: {
      couponCode: 'NEWUSER50',
      couponAmount: 50,
      expireDays: 30
    }
  });
  
  localStorage.setItem(SEED_FLAG, 'true');
  return true;
};
