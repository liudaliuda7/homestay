const STORAGE_KEY = 'homestay_shares';
const EXPIRE_DAYS = 30;

export const SHARE_EVENT = 'homestay_share_update';

const emitShareUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SHARE_EVENT));
  }
};

export const SHARE_PLATFORMS = {
  WECHAT: 'wechat',
  MOMENTS: 'moments',
  WEIBO: 'weibo',
  QQ: 'qq',
  LINK: 'link',
  POSTER: 'poster'
};

export const SHARE_PLATFORM_LABELS = {
  [SHARE_PLATFORMS.WECHAT]: '微信',
  [SHARE_PLATFORMS.MOMENTS]: '朋友圈',
  [SHARE_PLATFORMS.WEIBO]: '微博',
  [SHARE_PLATFORMS.QQ]: 'QQ',
  [SHARE_PLATFORMS.LINK]: '复制链接',
  [SHARE_PLATFORMS.POSTER]: '生成海报'
};

export const SHARE_TYPES = {
  PROPERTY: 'property',
  ORDER: 'order',
  ACTIVITY: 'activity'
};

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getSharesData = () => {
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

const getShareRecords = () => {
  const data = getSharesData();
  return data && data.records ? data.records : [];
};

const saveSharesData = (records) => {
  const data = {
    records: records,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitShareUpdate();
};

export const generateShareId = () => {
  const records = getShareRecords();
  return records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
};

export const createShare = (shareData) => {
  const records = getShareRecords();
  
  const newShare = {
    id: generateShareId(),
    userId: shareData.userId,
    type: shareData.type,
    platform: shareData.platform,
    relatedId: shareData.relatedId,
    title: shareData.title,
    image: shareData.image || null,
    description: shareData.description || '',
    shareUrl: shareData.shareUrl || '',
    shareCode: shareData.shareCode || null,
    clickCount: 0,
    effectiveClick: 0,
    createdAt: new Date().toISOString()
  };
  
  records.unshift(newShare);
  saveSharesData(records);
  
  return {
    success: true,
    message: '分享记录创建成功',
    share: newShare
  };
};

export const recordShareClick = (shareId) => {
  const records = getShareRecords();
  const shareIndex = records.findIndex(r => r.id === shareId);
  
  if (shareIndex === -1) {
    return {
      success: false,
      message: '分享记录不存在'
    };
  }
  
  records[shareIndex].clickCount = (records[shareIndex].clickCount || 0) + 1;
  saveSharesData(records);
  
  return {
    success: true,
    message: '点击记录成功',
    share: records[shareIndex]
  };
};

export const recordEffectiveClick = (shareId, visitorUserId = null) => {
  const records = getShareRecords();
  const shareIndex = records.findIndex(r => r.id === shareId);
  
  if (shareIndex === -1) {
    return {
      success: false,
      message: '分享记录不存在'
    };
  }
  
  records[shareIndex].effectiveClick = (records[shareIndex].effectiveClick || 0) + 1;
  if (visitorUserId) {
    records[shareIndex].visitorUserId = visitorUserId;
  }
  saveSharesData(records);
  
  return {
    success: true,
    message: '有效点击记录成功',
    share: records[shareIndex]
  };
};

export const getUserShares = (userId, type = null, platform = null) => {
  let shares = getShareRecords().filter(s => s.userId === userId);
  
  if (type) {
    shares = shares.filter(s => s.type === type);
  }
  
  if (platform) {
    shares = shares.filter(s => s.platform === platform);
  }
  
  return shares.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getShareStats = (userId) => {
  const shares = getUserShares(userId);
  
  const totalShares = shares.length;
  const totalClicks = shares.reduce((sum, s) => sum + (s.clickCount || 0), 0);
  const totalEffectiveClicks = shares.reduce((sum, s) => sum + (s.effectiveClick || 0), 0);
  
  const platformStats = {};
  Object.values(SHARE_PLATFORMS).forEach(platform => {
    const platformShares = shares.filter(s => s.platform === platform);
    platformStats[platform] = {
      count: platformShares.length,
      clicks: platformShares.reduce((sum, s) => sum + (s.clickCount || 0), 0),
      effectiveClicks: platformShares.reduce((sum, s) => sum + (s.effectiveClick || 0), 0)
    };
  });
  
  return {
    totalShares,
    totalClicks,
    totalEffectiveClicks,
    platformStats,
    shares
  };
};

export const generateShareUrl = (type, relatedId, shareCode = null) => {
  const baseUrl = window.location.origin;
  let path = '';
  
  switch (type) {
    case SHARE_TYPES.PROPERTY:
      path = `/property/${relatedId}`;
      break;
    case SHARE_TYPES.ORDER:
      path = `/pay/${relatedId}`;
      break;
    case SHARE_TYPES.ACTIVITY:
      path = `/activity/${relatedId}`;
      break;
    default:
      path = '/';
  }
  
  const url = new URL(baseUrl + path);
  if (shareCode) {
    url.searchParams.set('shareCode', shareCode);
  }
  
  return url.toString();
};

export const generateShareCode = (userId) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `S${userId}${timestamp}${random}`.toUpperCase();
};

export const shareToPlatform = (platform, shareData) => {
  const { title, description, image, url } = shareData;
  
  switch (platform) {
    case SHARE_PLATFORMS.WECHAT:
      return {
        success: true,
        message: '请在微信中打开分享',
        action: 'wechat'
      };
      
    case SHARE_PLATFORMS.MOMENTS:
      return {
        success: true,
        message: '请在微信中打开分享到朋友圈',
        action: 'moments'
      };
      
    case SHARE_PLATFORMS.WEIBO:
      const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&pic=${encodeURIComponent(image || '')}`;
      window.open(weiboUrl, '_blank', 'width=600,height=400');
      return {
        success: true,
        message: '已打开微博分享',
        action: 'weibo'
      };
      
    case SHARE_PLATFORMS.QQ:
      const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}&pics=${encodeURIComponent(image || '')}`;
      window.open(qqUrl, '_blank', 'width=600,height=400');
      return {
        success: true,
        message: '已打开QQ分享',
        action: 'qq'
      };
      
    case SHARE_PLATFORMS.LINK:
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
        return {
          success: true,
          message: '链接已复制到剪贴板',
          action: 'link'
        };
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return {
          success: true,
          message: '链接已复制到剪贴板',
          action: 'link'
        };
      }
      
    case SHARE_PLATFORMS.POSTER:
      return {
        success: true,
        message: '正在生成分享海报',
        action: 'poster'
      };
      
    default:
      return {
        success: false,
        message: '不支持的分享平台'
      };
  }
};

export const formatShareTime = (createdAt) => {
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
