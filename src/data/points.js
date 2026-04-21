const STORAGE_KEY = 'homestay_points';
const EXPIRE_DAYS = 365;

export const POINTS_EVENT = 'homestay_points_update';

const emitPointsUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(POINTS_EVENT));
  }
};

export const POINTS_TYPES = {
  CONSUMPTION: 'consumption',
  SHARING: 'sharing',
  INVITING: 'inviting',
  REVIEW: 'review',
  SIGN_IN: 'sign_in',
  REWARD: 'reward',
  EXCHANGE: 'exchange',
  SYSTEM: 'system'
};

export const POINTS_TYPE_LABELS = {
  [POINTS_TYPES.CONSUMPTION]: '消费积分',
  [POINTS_TYPES.SHARING]: '分享奖励',
  [POINTS_TYPES.INVITING]: '邀请奖励',
  [POINTS_TYPES.REVIEW]: '评价奖励',
  [POINTS_TYPES.SIGN_IN]: '签到奖励',
  [POINTS_TYPES.REWARD]: '活动奖励',
  [POINTS_TYPES.EXCHANGE]: '积分兑换',
  [POINTS_TYPES.SYSTEM]: '系统调整'
};

export const POINTS_TYPE_ICONS = {
  [POINTS_TYPES.CONSUMPTION]: '💰',
  [POINTS_TYPES.SHARING]: '🔗',
  [POINTS_TYPES.INVITING]: '👥',
  [POINTS_TYPES.REVIEW]: '💬',
  [POINTS_TYPES.SIGN_IN]: '📅',
  [POINTS_TYPES.REWARD]: '🎁',
  [POINTS_TYPES.EXCHANGE]: '🎫',
  [POINTS_TYPES.SYSTEM]: '⚙️'
};

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getPointsData = () => {
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

const getPointsRecords = () => {
  const data = getPointsData();
  return data && data.records ? data.records : [];
};

const getUserPointsInfo = () => {
  const data = getPointsData();
  return data && data.userPoints ? data.userPoints : {};
};

const savePointsData = (userPoints, records) => {
  const data = {
    userPoints: userPoints,
    records: records,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitPointsUpdate();
};

export const getUserPoints = (userId) => {
  const userPoints = getUserPointsInfo();
  return userPoints[userId] || {
    userId: userId,
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastSignIn: null,
    consecutiveSignIns: 0
  };
};

export const updateUserPoints = (userId, updates) => {
  const userPoints = getUserPointsInfo();
  const current = getUserPoints(userId);
  
  userPoints[userId] = {
    ...current,
    ...updates,
    userId: userId
  };
  
  const records = getPointsRecords();
  savePointsData(userPoints, records);
  
  return userPoints[userId];
};

export const addPoints = (userId, amount, type, description, relatedId = null) => {
  if (amount <= 0) {
    return {
      success: false,
      message: '积分数量必须大于0'
    };
  }
  
  const userPoints = getUserPoints(userId);
  const records = getPointsRecords();
  
  const newRecord = {
    id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
    userId: userId,
    amount: amount,
    type: type,
    description: description,
    relatedId: relatedId,
    createdAt: new Date().toISOString(),
    isIncome: true
  };
  
  records.unshift(newRecord);
  
  const updatedPoints = updateUserPoints(userId, {
    balance: userPoints.balance + amount,
    totalEarned: userPoints.totalEarned + amount
  });
  
  return {
    success: true,
    message: `获得 ${amount} 积分`,
    record: newRecord,
    points: updatedPoints
  };
};

export const spendPoints = (userId, amount, type, description, relatedId = null) => {
  if (amount <= 0) {
    return {
      success: false,
      message: '积分数量必须大于0'
    };
  }
  
  const userPoints = getUserPoints(userId);
  
  if (userPoints.balance < amount) {
    return {
      success: false,
      message: '积分不足'
    };
  }
  
  const records = getPointsRecords();
  
  const newRecord = {
    id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
    userId: userId,
    amount: amount,
    type: type,
    description: description,
    relatedId: relatedId,
    createdAt: new Date().toISOString(),
    isIncome: false
  };
  
  records.unshift(newRecord);
  
  const updatedPoints = updateUserPoints(userId, {
    balance: userPoints.balance - amount,
    totalSpent: userPoints.totalSpent + amount
  });
  
  return {
    success: true,
    message: `消耗 ${amount} 积分`,
    record: newRecord,
    points: updatedPoints
  };
};

export const getPointsHistory = (userId, type = null, limit = 50) => {
  let records = getPointsRecords()
    .filter(r => r.userId === userId);
  
  if (type) {
    records = records.filter(r => r.type === type);
  }
  
  return records.slice(0, limit);
};

export const getPointsSummary = (userId) => {
  const userPoints = getUserPoints(userId);
  const records = getPointsHistory(userId);
  
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const todayEarned = records
    .filter(r => r.isIncome && r.createdAt.startsWith(today))
    .reduce((sum, r) => sum + r.amount, 0);
  
  const monthEarned = records
    .filter(r => r.isIncome && r.createdAt.startsWith(thisMonth))
    .reduce((sum, r) => sum + r.amount, 0);
  
  return {
    ...userPoints,
    todayEarned,
    monthEarned
  };
};

export const checkSignIn = (userId) => {
  const userPoints = getUserPoints(userId);
  const today = new Date().toISOString().split('T')[0];
  
  return {
    hasSigned: userPoints.lastSignIn === today,
    consecutiveDays: userPoints.consecutiveSignIns
  };
};

export const signIn = (userId) => {
  const userPoints = getUserPoints(userId);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (userPoints.lastSignIn === today) {
    return {
      success: false,
      message: '今日已签到',
      consecutiveDays: userPoints.consecutiveSignIns
    };
  }
  
  let consecutiveDays = 1;
  if (userPoints.lastSignIn === yesterday) {
    consecutiveDays = userPoints.consecutiveSignIns + 1;
  }
  
  const basePoints = 10;
  const bonusPoints = Math.min((consecutiveDays - 1) * 2, 10);
  const totalPoints = basePoints + bonusPoints;
  
  const result = addPoints(
    userId,
    totalPoints,
    POINTS_TYPES.SIGN_IN,
    `每日签到奖励${consecutiveDays > 1 ? `（连续${consecutiveDays}天）` : ''}`
  );
  
  if (result.success) {
    updateUserPoints(userId, {
      lastSignIn: today,
      consecutiveSignIns: consecutiveDays
    });
    
    return {
      success: true,
      message: `签到成功！获得 ${totalPoints} 积分`,
      points: totalPoints,
      consecutiveDays: consecutiveDays,
      basePoints,
      bonusPoints
    };
  }
  
  return result;
};

export const calculateConsumptionPoints = (amount, memberLevel = 1) => {
  const multipliers = {
    1: 1,
    2: 1.2,
    3: 1.5,
    4: 2
  };
  
  const multiplier = multipliers[memberLevel] || 1;
  return Math.floor(amount * multiplier);
};

export const addConsumptionPoints = (userId, amount, orderId, memberLevel = 1) => {
  const points = calculateConsumptionPoints(amount, memberLevel);
  
  return addPoints(
    userId,
    points,
    POINTS_TYPES.CONSUMPTION,
    `订单消费奖励（¥${amount}）`,
    orderId
  );
};

export const addSharingPoints = (userId, propertyId, propertyTitle) => {
  const points = 5;
  
  return addPoints(
    userId,
    points,
    POINTS_TYPES.SHARING,
    `分享房源：${propertyTitle}`,
    propertyId
  );
};

export const addInvitingPoints = (userId, invitedUserId, invitedUserName) => {
  const points = 100;
  
  return addPoints(
    userId,
    points,
    POINTS_TYPES.INVITING,
    `邀请好友注册：${invitedUserName}`,
    invitedUserId
  );
};

export const addReviewPoints = (userId, reviewId, propertyTitle) => {
  const points = 20;
  
  return addPoints(
    userId,
    points,
    POINTS_TYPES.REVIEW,
    `发表评价：${propertyTitle}`,
    reviewId
  );
};

export const formatPointsTime = (createdAt) => {
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
