const STORAGE_KEY = 'homestay_membership';
const EXPIRE_DAYS = 365;

export const MEMBERSHIP_EVENT = 'homestay_membership_update';

const emitMembershipUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MEMBERSHIP_EVENT));
  }
};

export const MEMBERSHIP_LEVELS = {
  NORMAL: 'normal',
  SILVER: 'silver',
  GOLD: 'gold',
  DIAMOND: 'diamond'
};

export const MEMBERSHIP_LEVEL_LABELS = {
  [MEMBERSHIP_LEVELS.NORMAL]: '普通会员',
  [MEMBERSHIP_LEVELS.SILVER]: '银卡会员',
  [MEMBERSHIP_LEVELS.GOLD]: '金卡会员',
  [MEMBERSHIP_LEVELS.DIAMOND]: '钻石会员'
};

export const MEMBERSHIP_LEVEL_ICONS = {
  [MEMBERSHIP_LEVELS.NORMAL]: '🎁',
  [MEMBERSHIP_LEVELS.SILVER]: '🥈',
  [MEMBERSHIP_LEVELS.GOLD]: '🥇',
  [MEMBERSHIP_LEVELS.DIAMOND]: '💎'
};

export const MEMBERSHIP_LEVEL_COLORS = {
  [MEMBERSHIP_LEVELS.NORMAL]: {
    primary: '#666666',
    secondary: '#999999',
    gradient: 'linear-gradient(135deg, #666 0%, #999 100%)'
  },
  [MEMBERSHIP_LEVELS.SILVER]: {
    primary: '#C0C0C0',
    secondary: '#A8A8A8',
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #E8E8E8 100%)'
  },
  [MEMBERSHIP_LEVELS.GOLD]: {
    primary: '#FFD700',
    secondary: '#FFA500',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFE4B5 100%)'
  },
  [MEMBERSHIP_LEVELS.DIAMOND]: {
    primary: '#00CED1',
    secondary: '#4169E1',
    gradient: 'linear-gradient(135deg, #00CED1 0%, #4169E1 50%, #87CEEB 100%)'
  }
};

export const MEMBERSHIP_LEVEL_THRESHOLDS = {
  [MEMBERSHIP_LEVELS.NORMAL]: 0,
  [MEMBERSHIP_LEVELS.SILVER]: 1000,
  [MEMBERSHIP_LEVELS.GOLD]: 5000,
  [MEMBERSHIP_LEVELS.DIAMOND]: 20000
};

export const MEMBERSHIP_LEVEL_BENEFITS = {
  [MEMBERSHIP_LEVELS.NORMAL]: [
    { id: 'base_points', name: '基础积分', description: '每消费1元积1分', icon: '💰' },
    { id: 'basic_coupon', name: '基础优惠券', description: '注册即送新人券', icon: '🎫' }
  ],
  [MEMBERSHIP_LEVELS.SILVER]: [
    { id: 'discount_95', name: '房价95折', description: '所有房源享95折优惠', icon: '🏨' },
    { id: 'points_12', name: '积分1.2倍', description: '消费积分按1.2倍计算', icon: '💰' },
    { id: 'monthly_coupon', name: '月度优惠券', description: '每月发放专属优惠券', icon: '🎫' },
    { id: 'priority_customer', name: '优先客服', description: '客服排队优先级提升', icon: '👨‍💼' }
  ],
  [MEMBERSHIP_LEVELS.GOLD]: [
    { id: 'discount_90', name: '房价9折', description: '所有房源享9折优惠', icon: '🏨' },
    { id: 'points_15', name: '积分1.5倍', description: '消费积分按1.5倍计算', icon: '💰' },
    { id: 'monthly_coupon_plus', name: '月度优惠券+', description: '每月发放更高价值优惠券', icon: '🎫' },
    { id: 'birthday_gift', name: '生日特权', description: '生日当月享额外福利', icon: '🎂' },
    { id: 'flex_cancel', name: '灵活取消', description: '免费取消政策放宽至入住前24小时', icon: '🔄' },
    { id: 'priority_customer', name: '优先客服', description: '24小时专属客服通道', icon: '👨‍💼' }
  ],
  [MEMBERSHIP_LEVELS.DIAMOND]: [
    { id: 'discount_85', name: '房价85折', description: '所有房源享85折优惠', icon: '🏨' },
    { id: 'points_20', name: '积分2倍', description: '消费积分按2倍计算', icon: '💰' },
    { id: 'monthly_coupon_premium', name: '月度优惠券++', description: '每月发放超值优惠券礼包', icon: '🎫' },
    { id: 'birthday_gift_premium', name: '生日特权+', description: '生日当月享豪华福利', icon: '🎂' },
    { id: 'flex_cancel_premium', name: '灵活取消+', description: '免费取消政策放宽至入住前48小时', icon: '🔄' },
    { id: 'vip_customer', name: 'VIP客服', description: '7x24小时VIP专属客服', icon: '👨‍💼' },
    { id: 'priority_event', name: '专属活动', description: '限时活动优先参与资格', icon: '🎉' },
    { id: 'exclusive_gift', name: '专属礼品', description: '不定期赠送专属礼品', icon: '🎁' }
  ]
};

export const getDiscountRate = (level) => {
  const rates = {
    [MEMBERSHIP_LEVELS.NORMAL]: 1,
    [MEMBERSHIP_LEVELS.SILVER]: 0.95,
    [MEMBERSHIP_LEVELS.GOLD]: 0.90,
    [MEMBERSHIP_LEVELS.DIAMOND]: 0.85
  };
  return rates[level] || 1;
};

export const getPointsMultiplier = (level) => {
  const multipliers = {
    [MEMBERSHIP_LEVELS.NORMAL]: 1,
    [MEMBERSHIP_LEVELS.SILVER]: 1.2,
    [MEMBERSHIP_LEVELS.GOLD]: 1.5,
    [MEMBERSHIP_LEVELS.DIAMOND]: 2
  };
  return multipliers[level] || 1;
};

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getMembershipData = () => {
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

const getUserMemberships = () => {
  const data = getMembershipData();
  return data && data.userMemberships ? data.userMemberships : [];
};

const saveMembershipData = (userMemberships) => {
  const data = {
    userMemberships: userMemberships,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitMembershipUpdate();
};

export const getOrCreateUserMembership = (userId) => {
  const userMemberships = getUserMemberships();
  let membership = userMemberships.find(m => m.userId === userId);
  
  if (!membership) {
    const now = new Date();
    membership = {
      userId: userId,
      level: MEMBERSHIP_LEVELS.NORMAL,
      totalSpent: 0,
      joinDate: now.toISOString(),
      lastUpgradeDate: now.toISOString(),
      monthlyCouponIssued: {},
      pointsHistory: [],
      levelHistory: [
        {
          level: MEMBERSHIP_LEVELS.NORMAL,
          date: now.toISOString(),
          reason: 'new_user'
        }
      ]
    };
    
    userMemberships.push(membership);
    saveMembershipData(userMemberships);
  }
  
  return membership;
};

export const getUserMembership = (userId) => {
  return getOrCreateUserMembership(userId);
};

export const calculateLevelBySpent = (totalSpent) => {
  if (totalSpent >= MEMBERSHIP_LEVEL_THRESHOLDS[MEMBERSHIP_LEVELS.DIAMOND]) {
    return MEMBERSHIP_LEVELS.DIAMOND;
  }
  if (totalSpent >= MEMBERSHIP_LEVEL_THRESHOLDS[MEMBERSHIP_LEVELS.GOLD]) {
    return MEMBERSHIP_LEVELS.GOLD;
  }
  if (totalSpent >= MEMBERSHIP_LEVEL_THRESHOLDS[MEMBERSHIP_LEVELS.SILVER]) {
    return MEMBERSHIP_LEVELS.SILVER;
  }
  return MEMBERSHIP_LEVELS.NORMAL;
};

export const addSpentAmount = (userId, amount) => {
  const userMemberships = getUserMemberships();
  const membershipIndex = userMemberships.findIndex(m => m.userId === userId);
  
  if (membershipIndex === -1) {
    return { success: false, message: '会员记录不存在' };
  }
  
  const membership = userMemberships[membershipIndex];
  const oldLevel = membership.level;
  membership.totalSpent += amount;
  
  const newLevel = calculateLevelBySpent(membership.totalSpent);
  
  if (newLevel !== oldLevel) {
    membership.level = newLevel;
    membership.lastUpgradeDate = new Date().toISOString();
    membership.levelHistory.push({
      level: newLevel,
      date: new Date().toISOString(),
      reason: 'spent_upgrade',
      spentAmount: amount
    });
    
    saveMembershipData(userMemberships);
    
    return {
      success: true,
      upgraded: true,
      oldLevel: oldLevel,
      newLevel: newLevel,
      totalSpent: membership.totalSpent,
      message: `恭喜升级为${MEMBERSHIP_LEVEL_LABELS[newLevel]}！`
    };
  }
  
  saveMembershipData(userMemberships);
  
  return {
    success: true,
    upgraded: false,
    level: oldLevel,
    totalSpent: membership.totalSpent
  };
};

export const getLevelProgress = (userId) => {
  const membership = getUserMembership(userId);
  const currentLevel = membership.level;
  const levels = [
    MEMBERSHIP_LEVELS.NORMAL,
    MEMBERSHIP_LEVELS.SILVER,
    MEMBERSHIP_LEVELS.GOLD,
    MEMBERSHIP_LEVELS.DIAMOND
  ];
  
  const currentIndex = levels.indexOf(currentLevel);
  const isMaxLevel = currentIndex === levels.length - 1;
  
  if (isMaxLevel) {
    return {
      currentLevel: currentLevel,
      currentSpent: membership.totalSpent,
      isMaxLevel: true,
      progress: 100,
      nextLevel: null,
      nextThreshold: null,
      remaining: 0
    };
  }
  
  const nextLevel = levels[currentIndex + 1];
  const currentThreshold = MEMBERSHIP_LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = MEMBERSHIP_LEVEL_THRESHOLDS[nextLevel];
  const totalNeeded = nextThreshold - currentThreshold;
  const progress = ((membership.totalSpent - currentThreshold) / totalNeeded) * 100;
  const remaining = nextThreshold - membership.totalSpent;
  
  return {
    currentLevel: currentLevel,
    currentSpent: membership.totalSpent,
    isMaxLevel: false,
    progress: Math.min(100, Math.max(0, progress)),
    nextLevel: nextLevel,
    nextThreshold: nextThreshold,
    remaining: Math.max(0, remaining)
  };
};

export const getBenefits = (level) => {
  const allBenefits = [];
  const levels = [
    MEMBERSHIP_LEVELS.NORMAL,
    MEMBERSHIP_LEVELS.SILVER,
    MEMBERSHIP_LEVELS.GOLD,
    MEMBERSHIP_LEVELS.DIAMOND
  ];
  
  const currentIndex = levels.indexOf(level);
  
  for (let i = 0; i <= currentIndex; i++) {
    const levelBenefits = MEMBERSHIP_LEVEL_BENEFITS[levels[i]] || [];
    allBenefits.push(...levelBenefits);
  }
  
  return allBenefits;
};

export const addPoints = (userId, points, source, description, orderId = null) => {
  const userMemberships = getUserMemberships();
  const membershipIndex = userMemberships.findIndex(m => m.userId === userId);
  
  if (membershipIndex === -1) {
    return { success: false, message: '会员记录不存在' };
  }
  
  const membership = userMemberships[membershipIndex];
  const now = new Date();
  const year = now.getFullYear();
  
  const pointsRecord = {
    id: membership.pointsHistory.length > 0 
      ? Math.max(...membership.pointsHistory.map(p => p.id)) + 1 
      : 1,
    points: points,
    type: 'income',
    source: source,
    description: description,
    orderId: orderId,
    year: year,
    createdAt: now.toISOString()
  };
  
  membership.pointsHistory.push(pointsRecord);
  saveMembershipData(userMemberships);
  
  return {
    success: true,
    points: points,
    record: pointsRecord
  };
};

export const usePoints = (userId, points, source, description, orderId = null) => {
  const userMemberships = getUserMemberships();
  const membershipIndex = userMemberships.findIndex(m => m.userId === userId);
  
  if (membershipIndex === -1) {
    return { success: false, message: '会员记录不存在' };
  }
  
  const membership = userMemberships[membershipIndex];
  const totalPoints = getTotalPoints(userId);
  
  if (totalPoints < points) {
    return { success: false, message: '积分不足' };
  }
  
  const now = new Date();
  const year = now.getFullYear();
  
  const pointsRecord = {
    id: membership.pointsHistory.length > 0 
      ? Math.max(...membership.pointsHistory.map(p => p.id)) + 1 
      : 1,
    points: -points,
    type: 'expense',
    source: source,
    description: description,
    orderId: orderId,
    year: year,
    createdAt: now.toISOString()
  };
  
  membership.pointsHistory.push(pointsRecord);
  saveMembershipData(userMemberships);
  
  return {
    success: true,
    points: points,
    record: pointsRecord
  };
};

export const getTotalPoints = (userId) => {
  const membership = getUserMembership(userId);
  return membership.pointsHistory.reduce((sum, record) => sum + record.points, 0);
};

export const getPointsHistory = (userId, year = null) => {
  const membership = getUserMembership(userId);
  let history = [...membership.pointsHistory];
  
  if (year !== null) {
    history = history.filter(h => h.year === year);
  }
  
  return history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const expirePointsByYear = (userId, year) => {
  const userMemberships = getUserMemberships();
  const membershipIndex = userMemberships.findIndex(m => m.userId === userId);
  
  if (membershipIndex === -1) {
    return { success: false, message: '会员记录不存在' };
  }
  
  const membership = userMemberships[membershipIndex];
  const yearPoints = membership.pointsHistory
    .filter(p => p.year === year)
    .reduce((sum, p) => sum + p.points, 0);
  
  if (yearPoints > 0) {
    const now = new Date();
    const expireRecord = {
      id: membership.pointsHistory.length > 0 
        ? Math.max(...membership.pointsHistory.map(p => p.id)) + 1 
        : 1,
      points: -yearPoints,
      type: 'expense',
      source: 'expire',
      description: `${year}年度积分过期清零`,
      year: now.getFullYear(),
      createdAt: now.toISOString()
    };
    
    membership.pointsHistory.push(expireRecord);
    saveMembershipData(userMemberships);
    
    return {
      success: true,
      expiredPoints: yearPoints,
      record: expireRecord
    };
  }
  
  return {
    success: true,
    expiredPoints: 0,
    message: `${year}年度无有效积分需要清零`
  };
};

export const isMonthlyCouponIssued = (userId, year, month) => {
  const membership = getUserMembership(userId);
  const key = `${year}-${String(month).padStart(2, '0')}`;
  return membership.monthlyCouponIssued[key] || false;
};

export const markMonthlyCouponIssued = (userId, year, month) => {
  const userMemberships = getUserMemberships();
  const membershipIndex = userMemberships.findIndex(m => m.userId === userId);
  
  if (membershipIndex === -1) {
    return { success: false, message: '会员记录不存在' };
  }
  
  const membership = userMemberships[membershipIndex];
  const key = `${year}-${String(month).padStart(2, '0')}`;
  membership.monthlyCouponIssued[key] = true;
  saveMembershipData(userMemberships);
  
  return { success: true };
};

export const getLevelHistory = (userId) => {
  const membership = getUserMembership(userId);
  return membership.levelHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
};

import { createSystemNotification } from './notifications';

export const sendLevelUpNotification = (userId, oldLevel, newLevel) => {
  const title = '🎊 恭喜升级！';
  const content = `恭喜您已从${MEMBERSHIP_LEVEL_LABELS[oldLevel]}升级为${MEMBERSHIP_LEVEL_LABELS[newLevel]}，享受更多专属权益！`;
  
  return createSystemNotification(
    {
      title,
      content,
      data: {
        oldLevel,
        newLevel,
        action: 'level_up'
      }
    },
    userId
  );
};

const MEMBERSHIP_SEED_FLAG = 'homestay_membership_seeded_v1';

export const seedSampleMembership = (userId) => {
  const seeded = localStorage.getItem(MEMBERSHIP_SEED_FLAG);
  if (seeded) return false;
  
  const membership = getOrCreateUserMembership(userId);
  
  const sampleSpents = [
    { amount: 500, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { amount: 300, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { amount: 400, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
  ];
  
  sampleSpents.forEach(spent => {
    addSpentAmount(userId, spent.amount);
  });
  
  const userMemberships = getUserMemberships();
  const mIndex = userMemberships.findIndex(m => m.userId === userId);
  if (mIndex !== -1) {
    userMemberships[mIndex].pointsHistory = [
      {
        id: 1,
        points: 100,
        type: 'income',
        source: 'consumption',
        description: '消费积分',
        year: 2024,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        points: 50,
        type: 'income',
        source: 'sign_in',
        description: '签到奖励',
        year: 2025,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        points: 200,
        type: 'income',
        source: 'sharing',
        description: '分享奖励',
        year: 2025,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    saveMembershipData(userMemberships);
  }
  
  localStorage.setItem(MEMBERSHIP_SEED_FLAG, 'true');
  return true;
};
