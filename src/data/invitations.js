const STORAGE_KEY = 'homestay_invitations';
const EXPIRE_DAYS = 365;

export const INVITATION_EVENT = 'homestay_invitation_update';

const emitInvitationUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INVITATION_EVENT));
  }
};

export const REWARD_TYPES = {
  COUPON: 'coupon',
  POINTS: 'points',
  CASH: 'cash',
  MEMBERSHIP: 'membership'
};

export const REWARD_TYPE_LABELS = {
  [REWARD_TYPES.COUPON]: '优惠券',
  [REWARD_TYPES.POINTS]: '积分',
  [REWARD_TYPES.CASH]: '现金红包',
  [REWARD_TYPES.MEMBERSHIP]: '会员时长'
};

export const INVITATION_STATUS = {
  PENDING: 'pending',
  REGISTERED: 'registered',
  FIRST_ORDER: 'first_order',
  COMPLETED: 'completed'
};

export const INVITATION_STATUS_LABELS = {
  [INVITATION_STATUS.PENDING]: '待注册',
  [INVITATION_STATUS.REGISTERED]: '已注册',
  [INVITATION_STATUS.FIRST_ORDER]: '已首单',
  [INVITATION_STATUS.COMPLETED]: '已完成'
};

export const INVITATION_REWARD_CONFIGS = [
  {
    id: 1,
    inviteCount: 1,
    rewardType: REWARD_TYPES.COUPON,
    rewardValue: 20,
    rewardName: '20元优惠券',
    description: '邀请1位好友注册并完成首单'
  },
  {
    id: 2,
    inviteCount: 3,
    rewardType: REWARD_TYPES.COUPON,
    rewardValue: 50,
    rewardName: '50元优惠券',
    description: '邀请3位好友注册并完成首单'
  },
  {
    id: 3,
    inviteCount: 5,
    rewardType: REWARD_TYPES.MEMBERSHIP,
    rewardValue: 30,
    rewardName: '会员月卡',
    description: '邀请5位好友注册并完成首单'
  },
  {
    id: 4,
    inviteCount: 10,
    rewardType: REWARD_TYPES.POINTS,
    rewardValue: 500,
    rewardName: '500积分',
    description: '邀请10位好友注册并完成首单'
  }
];

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getInvitationsData = () => {
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

const getInvitationRecords = () => {
  const data = getInvitationsData();
  return data && data.records ? data.records : [];
};

const getInvitationCodes = () => {
  const data = getInvitationsData();
  return data && data.codes ? data.codes : {};
};

const getRewardRecords = () => {
  const data = getInvitationsData();
  return data && data.rewards ? data.rewards : [];
};

const saveInvitationsData = (records, codes, rewards) => {
  const data = {
    records: records,
    codes: codes,
    rewards: rewards,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitInvitationUpdate();
};

export const generateInviteCode = (userId) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789';
  let code = '';
  
  code += `I${userId}`;
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

export const getOrCreateInviteCode = (userId) => {
  const codes = getInvitationCodes();
  
  if (codes[userId]) {
    return codes[userId];
  }
  
  const code = generateInviteCode(userId);
  codes[userId] = {
    code: code,
    userId: userId,
    createdAt: new Date().toISOString(),
    usedCount: 0
  };
  
  const records = getInvitationRecords();
  const rewards = getRewardRecords();
  saveInvitationsData(records, codes, rewards);
  
  return codes[userId];
};

export const getInviteCodeInfo = (userId) => {
  return getOrCreateInviteCode(userId);
};

export const generateInviteLink = (userId) => {
  const codeInfo = getOrCreateInviteCode(userId);
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?inviteCode=${codeInfo.code}`;
};

export const createInvitation = (inviterId, inviteeId, inviteeName, inviteCode) => {
  const records = getInvitationRecords();
  
  const newInvitation = {
    id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
    inviterId: inviterId,
    inviteeId: inviteeId,
    inviteeName: inviteeName,
    inviteCode: inviteCode,
    status: INVITATION_STATUS.REGISTERED,
    createdAt: new Date().toISOString(),
    firstOrderAt: null,
    completedAt: null,
    rewardGiven: false
  };
  
  records.unshift(newInvitation);
  
  const codes = getInvitationCodes();
  if (codes[inviterId]) {
    codes[inviterId].usedCount = (codes[inviterId].usedCount || 0) + 1;
  }
  
  const rewards = getRewardRecords();
  saveInvitationsData(records, codes, rewards);
  
  return {
    success: true,
    message: '邀请记录创建成功',
    invitation: newInvitation
  };
};

export const updateInvitationStatus = (invitationId, status, firstOrderAt = null) => {
  const records = getInvitationRecords();
  const index = records.findIndex(r => r.id === invitationId);
  
  if (index === -1) {
    return {
      success: false,
      message: '邀请记录不存在'
    };
  }
  
  records[index].status = status;
  
  if (firstOrderAt) {
    records[index].firstOrderAt = firstOrderAt;
  }
  
  if (status === INVITATION_STATUS.COMPLETED) {
    records[index].completedAt = new Date().toISOString();
  }
  
  const codes = getInvitationCodes();
  const rewards = getRewardRecords();
  saveInvitationsData(records, codes, rewards);
  
  return {
    success: true,
    message: '状态更新成功',
    invitation: records[index]
  };
};

export const getInvitationsByInviter = (inviterId) => {
  const records = getInvitationRecords();
  return records
    .filter(r => r.inviterId === inviterId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getInvitationStats = (inviterId) => {
  const invitations = getInvitationsByInviter(inviterId);
  
  const total = invitations.length;
  const registered = invitations.filter(r => r.status === INVITATION_STATUS.REGISTERED).length;
  const firstOrder = invitations.filter(r => 
    r.status === INVITATION_STATUS.FIRST_ORDER || r.status === INVITATION_STATUS.COMPLETED
  ).length;
  const completed = invitations.filter(r => r.status === INVITATION_STATUS.COMPLETED).length;
  
  const earnedRewards = getEarnedRewards(inviterId);
  
  return {
    total,
    registered,
    firstOrder,
    completed,
    earnedRewards,
    invitations
  };
};

export const checkRewardEligibility = (inviterId) => {
  const stats = getInvitationStats(inviterId);
  const rewards = getRewardRecords();
  
  const earnedConfigIds = rewards
    .filter(r => r.inviterId === inviterId)
    .map(r => r.configId);
  
  const eligibleRewards = [];
  
  INVITATION_REWARD_CONFIGS.forEach(config => {
    if (!earnedConfigIds.includes(config.id) && stats.firstOrder >= config.inviteCount) {
      eligibleRewards.push(config);
    }
  });
  
  return eligibleRewards;
};

export const claimReward = (inviterId, configId) => {
  const config = INVITATION_REWARD_CONFIGS.find(c => c.id === configId);
  if (!config) {
    return {
      success: false,
      message: '奖励配置不存在'
    };
  }
  
  const eligibleRewards = checkRewardEligibility(inviterId);
  if (!eligibleRewards.find(r => r.id === configId)) {
    return {
      success: false,
      message: '不满足领取条件'
    };
  }
  
  const rewards = getRewardRecords();
  
  const newReward = {
    id: rewards.length > 0 ? Math.max(...rewards.map(r => r.id)) + 1 : 1,
    inviterId: inviterId,
    configId: configId,
    rewardType: config.rewardType,
    rewardValue: config.rewardValue,
    rewardName: config.rewardName,
    claimedAt: new Date().toISOString(),
    used: false,
    usedAt: null
  };
  
  rewards.unshift(newReward);
  
  const records = getInvitationRecords();
  const codes = getInvitationCodes();
  saveInvitationsData(records, codes, rewards);
  
  return {
    success: true,
    message: `成功领取 ${config.rewardName}`,
    reward: newReward
  };
};

export const getEarnedRewards = (inviterId) => {
  const rewards = getRewardRecords();
  return rewards.filter(r => r.inviterId === inviterId);
};

export const getInvitationByInvitee = (inviteeId) => {
  const records = getInvitationRecords();
  return records.find(r => r.inviteeId === inviteeId) || null;
};

export const getInvitationRanking = (limit = 10) => {
  const records = getInvitationRecords();
  
  const inviterStats = {};
  records.forEach(r => {
    if (!inviterStats[r.inviterId]) {
      inviterStats[r.inviterId] = {
        inviterId: r.inviterId,
        inviteeCount: 0,
        firstOrderCount: 0,
        completedCount: 0
      };
    }
    
    inviterStats[r.inviterId].inviteeCount++;
    
    if (r.status === INVITATION_STATUS.FIRST_ORDER || r.status === INVITATION_STATUS.COMPLETED) {
      inviterStats[r.inviterId].firstOrderCount++;
    }
    
    if (r.status === INVITATION_STATUS.COMPLETED) {
      inviterStats[r.inviterId].completedCount++;
    }
  });
  
  const ranking = Object.values(inviterStats)
    .sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      if (b.firstOrderCount !== a.firstOrderCount) {
        return b.firstOrderCount - a.firstOrderCount;
      }
      return b.inviteeCount - a.inviteeCount;
    })
    .slice(0, limit);
  
  return ranking.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
};

export const validateInviteCode = (code) => {
  const codes = getInvitationCodes();
  
  const codeInfo = Object.values(codes).find(c => c.code === code);
  
  if (!codeInfo) {
    return {
      valid: false,
      message: '无效的邀请码'
    };
  }
  
  return {
    valid: true,
    inviterId: codeInfo.userId,
    message: '邀请码有效'
  };
};

export const formatInvitationTime = (createdAt) => {
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
