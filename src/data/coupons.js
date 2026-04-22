const STORAGE_KEY = 'homestay_coupons';
const EXPIRE_DAYS = 365;

export const COUPONS_EVENT = 'homestay_coupons_update';

const emitCouponsUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COUPONS_EVENT));
  }
};

export const COUPON_TYPES = {
  NEW_USER: 'new_user',
  FULL_REDUCTION: 'full_reduction',
  DISCOUNT: 'discount',
  NO_THRESHOLD: 'no_threshold',
  HOLIDAY: 'holiday',
  INVITATION: 'invitation',
  MEMBER: 'member'
};

export const COUPON_TYPE_LABELS = {
  [COUPON_TYPES.NEW_USER]: '新人专享',
  [COUPON_TYPES.FULL_REDUCTION]: '满减券',
  [COUPON_TYPES.DISCOUNT]: '折扣券',
  [COUPON_TYPES.NO_THRESHOLD]: '无门槛',
  [COUPON_TYPES.HOLIDAY]: '节假日专享',
  [COUPON_TYPES.INVITATION]: '邀请奖励',
  [COUPON_TYPES.MEMBER]: '会员专享'
};

export const COUPON_TYPE_ICONS = {
  [COUPON_TYPES.NEW_USER]: '🎁',
  [COUPON_TYPES.FULL_REDUCTION]: '💰',
  [COUPON_TYPES.DISCOUNT]: '📉',
  [COUPON_TYPES.NO_THRESHOLD]: '🎫',
  [COUPON_TYPES.HOLIDAY]: '🎉',
  [COUPON_TYPES.INVITATION]: '👥',
  [COUPON_TYPES.MEMBER]: '👑'
};

export const COUPON_STATUS = {
  AVAILABLE: 'available',
  USED: 'used',
  EXPIRED: 'expired'
};

export const COUPON_STATUS_LABELS = {
  [COUPON_STATUS.AVAILABLE]: '可使用',
  [COUPON_STATUS.USED]: '已使用',
  [COUPON_STATUS.EXPIRED]: '已过期'
};

export const APPLICABLE_SCOPE = {
  ALL: 'all',
  SPECIFIC_PROPERTY: 'specific_property',
  SPECIFIC_CITY: 'specific_city'
};

export const APPLICABLE_SCOPE_LABELS = {
  [APPLICABLE_SCOPE.ALL]: '全部房源',
  [APPLICABLE_SCOPE.SPECIFIC_PROPERTY]: '指定房源',
  [APPLICABLE_SCOPE.SPECIFIC_CITY]: '指定城市'
};

export const VALIDITY_TYPE = {
  FIXED_DATE: 'fixed_date',
  DAYS_AFTER_CLAIM: 'days_after_claim'
};

export const MUTUAL_EXCLUSION_RULES = {
  WITH_DISCOUNT: 'with_discount',
  WITH_POINTS: 'with_points',
  WITH_OTHER_COUPONS: 'with_other_coupons'
};

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getCouponsData = () => {
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

const getUserCouponsList = () => {
  const data = getCouponsData();
  return data && data.userCoupons ? data.userCoupons : [];
};

const getCouponTemplatesList = () => {
  const data = getCouponsData();
  return data && data.couponTemplates ? data.couponTemplates : [];
};

const saveCouponsData = (userCoupons, couponTemplates) => {
  const data = {
    userCoupons: userCoupons,
    couponTemplates: couponTemplates,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitCouponsUpdate();
};

const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const getCouponStatus = (userCoupon) => {
  if (userCoupon.usedAt) {
    return COUPON_STATUS.USED;
  }
  
  const now = new Date().getTime();
  const validEnd = new Date(userCoupon.validEnd).getTime();
  
  if (now > validEnd) {
    return COUPON_STATUS.EXPIRED;
  }
  
  return COUPON_STATUS.AVAILABLE;
};

export const createCouponTemplate = (templateData) => {
  const templates = getCouponTemplatesList();
  
  const now = new Date();
  
  const newTemplate = {
    id: templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1,
    name: templateData.name,
    type: templateData.type,
    description: templateData.description || '',
    discountAmount: templateData.discountAmount || 0,
    discountPercentage: templateData.discountPercentage || 0,
    maxDiscountAmount: templateData.maxDiscountAmount || null,
    minOrderAmount: templateData.minOrderAmount || 0,
    validityType: templateData.validityType || VALIDITY_TYPE.DAYS_AFTER_CLAIM,
    validStart: templateData.validStart || now.toISOString(),
    validEnd: templateData.validEnd || null,
    validDays: templateData.validDays || 30,
    applicableScope: templateData.applicableScope || APPLICABLE_SCOPE.ALL,
    applicablePropertyIds: templateData.applicablePropertyIds || [],
    applicableCities: templateData.applicableCities || [],
    perPersonLimit: templateData.perPersonLimit || 1,
    totalQuantity: templateData.totalQuantity || null,
    claimedQuantity: 0,
    mutualExclusionRules: templateData.mutualExclusionRules || [MUTUAL_EXCLUSION_RULES.WITH_OTHER_COUPONS],
    isActive: templateData.isActive !== false,
    isTimed: templateData.isTimed || false,
    timedStart: templateData.timedStart || null,
    timedEnd: templateData.timedEnd || null,
    createdAt: now.toISOString()
  };
  
  templates.push(newTemplate);
  saveCouponsData(getUserCouponsList(), templates);
  
  return {
    success: true,
    message: '优惠券模板创建成功',
    template: newTemplate
  };
};

export const claimCoupon = (userId, templateId) => {
  const userCoupons = getUserCouponsList();
  const templates = getCouponTemplatesList();
  
  const template = templates.find(t => t.id === templateId && t.isActive);
  
  if (!template) {
    return {
      success: false,
      message: '优惠券不存在或已下架'
    };
  }
  
  const now = new Date();
  
  if (template.isTimed) {
    if (template.timedStart && now.getTime() < new Date(template.timedStart).getTime()) {
      return {
        success: false,
        message: '活动尚未开始'
      };
    }
    if (template.timedEnd && now.getTime() > new Date(template.timedEnd).getTime()) {
      return {
        success: false,
        message: '活动已结束'
      };
    }
  }
  
  const userClaimedCount = userCoupons.filter(
    uc => uc.userId === userId && uc.templateId === templateId
  ).length;
  
  if (template.perPersonLimit && userClaimedCount >= template.perPersonLimit) {
    return {
      success: false,
      message: `每人限领${template.perPersonLimit}张`
    };
  }
  
  if (template.totalQuantity !== null && template.claimedQuantity >= template.totalQuantity) {
    return {
      success: false,
      message: '优惠券已抢完'
    };
  }
  
  let validStart, validEnd;
  
  if (template.validityType === VALIDITY_TYPE.FIXED_DATE) {
    validStart = template.validStart;
    validEnd = template.validEnd;
  } else {
    validStart = now.toISOString();
    validEnd = new Date(now.getTime() + template.validDays * 24 * 60 * 60 * 1000).toISOString();
  }
  
  const newUserCoupon = {
    id: userCoupons.length > 0 ? Math.max(...userCoupons.map(uc => uc.id)) + 1 : 1,
    userId: userId,
    templateId: templateId,
    couponCode: generateCouponCode(),
    type: template.type,
    name: template.name,
    description: template.description,
    discountAmount: template.discountAmount,
    discountPercentage: template.discountPercentage,
    maxDiscountAmount: template.maxDiscountAmount,
    minOrderAmount: template.minOrderAmount,
    validStart: validStart,
    validEnd: validEnd,
    applicableScope: template.applicableScope,
    applicablePropertyIds: template.applicablePropertyIds,
    applicableCities: template.applicableCities,
    mutualExclusionRules: template.mutualExclusionRules,
    claimedAt: now.toISOString(),
    usedAt: null,
    usedOrderId: null,
    orderAmount: null,
    savedAmount: null
  };
  
  userCoupons.push(newUserCoupon);
  
  const templateIndex = templates.findIndex(t => t.id === templateId);
  if (templateIndex !== -1) {
    templates[templateIndex].claimedQuantity++;
  }
  
  saveCouponsData(userCoupons, templates);
  
  return {
    success: true,
    message: '领取成功',
    coupon: newUserCoupon
  };
};

export const getUserCoupons = (userId, status = null) => {
  let userCoupons = getUserCouponsList()
    .filter(uc => uc.userId === userId)
    .map(uc => ({
      ...uc,
      status: getCouponStatus(uc),
      isExpiringSoon: isExpiringSoon(uc)
    }));
  
  if (status) {
    userCoupons = userCoupons.filter(uc => uc.status === status);
  }
  
  return userCoupons.sort((a, b) => {
    if (a.status === COUPON_STATUS.AVAILABLE && b.status !== COUPON_STATUS.AVAILABLE) return -1;
    if (a.status !== COUPON_STATUS.AVAILABLE && b.status === COUPON_STATUS.AVAILABLE) return 1;
    return new Date(b.claimedAt) - new Date(a.claimedAt);
  });
};

export const getAvailableCoupons = (userId, orderData = null) => {
  let availableCoupons = getUserCoupons(userId, COUPON_STATUS.AVAILABLE);
  
  if (orderData) {
    availableCoupons = availableCoupons.filter(coupon => {
      if (coupon.minOrderAmount > 0 && orderData.totalAmount < coupon.minOrderAmount) {
        return false;
      }
      
      if (coupon.applicableScope === APPLICABLE_SCOPE.SPECIFIC_PROPERTY) {
        if (!coupon.applicablePropertyIds.includes(orderData.propertyId)) {
          return false;
        }
      }
      
      if (coupon.applicableScope === APPLICABLE_SCOPE.SPECIFIC_CITY) {
        if (!coupon.applicableCities.includes(orderData.city)) {
          return false;
        }
      }
      
      return true;
    });
    
    availableCoupons = availableCoupons.map(coupon => ({
      ...coupon,
      calculatedDiscount: calculateDiscount(coupon, orderData.totalAmount)
    }));
    
    availableCoupons.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);
  }
  
  return availableCoupons;
};

export const getBestCoupon = (userId, orderData) => {
  const availableCoupons = getAvailableCoupons(userId, orderData);
  
  if (availableCoupons.length === 0) {
    return null;
  }
  
  return availableCoupons[0];
};

export const calculateDiscount = (coupon, orderAmount) => {
  if (coupon.type === COUPON_TYPES.DISCOUNT) {
    let discount = orderAmount * (1 - coupon.discountPercentage / 100);
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
    return Math.floor(discount);
  }
  
  return coupon.discountAmount;
};

export const useCoupon = (userId, couponId, orderData) => {
  const userCoupons = getUserCouponsList();
  const templates = getCouponTemplatesList();
  
  const couponIndex = userCoupons.findIndex(
    uc => uc.id === couponId && uc.userId === userId
  );
  
  if (couponIndex === -1) {
    return {
      success: false,
      message: '优惠券不存在'
    };
  }
  
  const coupon = userCoupons[couponIndex];
  const status = getCouponStatus(coupon);
  
  if (status !== COUPON_STATUS.AVAILABLE) {
    return {
      success: false,
      message: `优惠券${COUPON_STATUS_LABELS[status]}`
    };
  }
  
  if (coupon.minOrderAmount > 0 && orderData.totalAmount < coupon.minOrderAmount) {
    return {
      success: false,
      message: `订单金额需满¥${coupon.minOrderAmount}才能使用`
    };
  }
  
  const discountAmount = calculateDiscount(coupon, orderData.totalAmount);
  
  userCoupons[couponIndex].usedAt = new Date().toISOString();
  userCoupons[couponIndex].usedOrderId = orderData.orderId;
  userCoupons[couponIndex].orderAmount = orderData.totalAmount;
  userCoupons[couponIndex].savedAmount = discountAmount;
  
  saveCouponsData(userCoupons, templates);
  
  return {
    success: true,
    message: '优惠券使用成功',
    discountAmount: discountAmount,
    coupon: userCoupons[couponIndex]
  };
};

export const getCouponUsageHistory = (userId) => {
  return getUserCoupons(userId)
    .filter(uc => uc.usedAt)
    .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
};

export const getCouponTemplates = (activeOnly = true) => {
  let templates = getCouponTemplatesList();
  
  if (activeOnly) {
    const now = new Date();
    templates = templates.filter(t => {
      if (!t.isActive) return false;
      
      if (t.isTimed) {
        if (t.timedStart && now.getTime() < new Date(t.timedStart).getTime()) {
          return false;
        }
        if (t.timedEnd && now.getTime() > new Date(t.timedEnd).getTime()) {
          return false;
        }
      }
      
      if (t.totalQuantity !== null && t.claimedQuantity >= t.totalQuantity) {
        return false;
      }
      
      return true;
    });
  }
  
  return templates;
};

export const getTimedCoupons = () => {
  const templates = getCouponTemplatesList();
  const now = new Date();
  
  return templates.filter(t => 
    t.isTimed && 
    t.isActive &&
    t.timedStart &&
    now.getTime() < new Date(t.timedStart).getTime()
  );
};

export const isExpiringSoon = (coupon) => {
  if (getCouponStatus(coupon) !== COUPON_STATUS.AVAILABLE) {
    return false;
  }
  
  const now = new Date().getTime();
  const validEnd = new Date(coupon.validEnd).getTime();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  
  return (validEnd - now) <= threeDays;
};

export const getExpiringCoupons = (userId) => {
  return getUserCoupons(userId, COUPON_STATUS.AVAILABLE)
    .filter(coupon => isExpiringSoon(coupon));
};

export const getCouponsCount = (userId) => {
  const available = getUserCoupons(userId, COUPON_STATUS.AVAILABLE).length;
  const used = getUserCoupons(userId, COUPON_STATUS.USED).length;
  const expired = getUserCoupons(userId, COUPON_STATUS.EXPIRED).length;
  const expiringSoon = getExpiringCoupons(userId).length;
  
  return {
    available,
    used,
    expired,
    expiringSoon
  };
};

export const formatCouponTime = (time) => {
  const date = new Date(time);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const getCouponDisplayValue = (coupon) => {
  if (coupon.type === COUPON_TYPES.DISCOUNT) {
    return {
      type: 'percentage',
      value: coupon.discountPercentage,
      unit: '折',
      maxAmount: coupon.maxDiscountAmount
    };
  }
  
  return {
    type: 'amount',
    value: coupon.discountAmount,
    unit: '元'
  };
};

import { createSystemNotification } from './notifications';
import { getCurrentUser } from './user';

export const sendCouponNotification = (userId, coupon, action) => {
  let title = '';
  let content = '';
  
  switch (action) {
    case 'claim':
      title = '🎁 优惠券到账';
      content = `您已成功领取「${coupon.name}」，有效期至 ${formatCouponTime(coupon.validEnd)}，快去使用吧！`;
      break;
    case 'expiring_soon':
      title = '⚠️ 优惠券即将过期';
      content = `您的「${coupon.name}」将在3天内过期，请尽快使用！`;
      break;
    case 'used':
      title = '✅ 优惠券已使用';
      content = `您已使用「${coupon.name}」，节省了 ¥${coupon.savedAmount}！`;
      break;
  }
  
  return createSystemNotification(
    {
      title,
      content,
      data: {
        couponId: coupon.id,
        couponCode: coupon.couponCode,
        action
      }
    },
    userId
  );
};

const COUPON_SEED_FLAG = 'homestay_coupons_seeded_v1';

export const seedSampleCoupons = () => {
  const seeded = localStorage.getItem(COUPON_SEED_FLAG);
  if (seeded) return false;
  
  const now = new Date();
  
  const sampleTemplates = [
    {
      name: '新人专享券',
      type: COUPON_TYPES.NEW_USER,
      description: '新用户首单立减50元',
      discountAmount: 50,
      minOrderAmount: 100,
      validityType: VALIDITY_TYPE.DAYS_AFTER_CLAIM,
      validDays: 30,
      applicableScope: APPLICABLE_SCOPE.ALL,
      perPersonLimit: 1,
      totalQuantity: 1000,
      isActive: true
    },
    {
      name: '满200减50',
      type: COUPON_TYPES.FULL_REDUCTION,
      description: '订单满200元即可使用',
      discountAmount: 50,
      minOrderAmount: 200,
      validityType: VALIDITY_TYPE.DAYS_AFTER_CLAIM,
      validDays: 15,
      applicableScope: APPLICABLE_SCOPE.ALL,
      perPersonLimit: 3,
      totalQuantity: 500,
      isActive: true
    },
    {
      name: '8折优惠券',
      type: COUPON_TYPES.DISCOUNT,
      description: '享受8折优惠，最高优惠100元',
      discountPercentage: 80,
      maxDiscountAmount: 100,
      minOrderAmount: 0,
      validityType: VALIDITY_TYPE.DAYS_AFTER_CLAIM,
      validDays: 7,
      applicableScope: APPLICABLE_SCOPE.ALL,
      perPersonLimit: 2,
      totalQuantity: 300,
      isActive: true
    },
    {
      name: '无门槛10元券',
      type: COUPON_TYPES.NO_THRESHOLD,
      description: '无门槛使用，立减10元',
      discountAmount: 10,
      minOrderAmount: 0,
      validityType: VALIDITY_TYPE.DAYS_AFTER_CLAIM,
      validDays: 3,
      applicableScope: APPLICABLE_SCOPE.ALL,
      perPersonLimit: 5,
      totalQuantity: 1000,
      isActive: true
    },
    {
      name: '限时秒杀券',
      type: COUPON_TYPES.FULL_REDUCTION,
      description: '限时领取，满100减30',
      discountAmount: 30,
      minOrderAmount: 100,
      validityType: VALIDITY_TYPE.DAYS_AFTER_CLAIM,
      validDays: 1,
      applicableScope: APPLICABLE_SCOPE.ALL,
      perPersonLimit: 1,
      totalQuantity: 100,
      isActive: true,
      isTimed: true,
      timedStart: new Date(now.getTime() - 1000).toISOString(),
      timedEnd: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: '会员专享9折券',
      type: COUPON_TYPES.MEMBER,
      description: '会员专享9折优惠，最高优惠200元',
      discountPercentage: 90,
      maxDiscountAmount: 200,
      minOrderAmount: 0,
      validityType: VALIDITY_TYPE.DAYS_AFTER_CLAIM,
      validDays: 30,
      applicableScope: APPLICABLE_SCOPE.ALL,
      perPersonLimit: 1,
      totalQuantity: null,
      isActive: true
    }
  ];
  
  sampleTemplates.forEach(template => {
    createCouponTemplate(template);
  });
  
  const user = getCurrentUser();
  if (user) {
    const templates = getCouponTemplatesList();
    templates.slice(0, 3).forEach(template => {
      claimCoupon(user.id, template.id);
    });
  }
  
  localStorage.setItem(COUPON_SEED_FLAG, 'true');
  return true;
};
