const STORAGE_KEY = 'homestay_reviews';
const LIKES_STORAGE_KEY = 'homestay_review_likes';
const EXPIRE_DAYS = 7;
const REVIEW_EXPIRE_DAYS = 10;

import { reviews as staticReviews } from './properties';
import { 
  createReviewNotification,
  REVIEW_NOTIFICATION_SUBTYPES
} from './notifications';
import { properties } from './properties';

export const RATING_DIMENSIONS = [
  { key: 'location', label: '位置', icon: '📍' },
  { key: 'cleanliness', label: '卫生', icon: '🧹' },
  { key: 'service', label: '服务', icon: '💁' },
  { key: 'facilities', label: '设施', icon: '🏠' },
  { key: 'value', label: '性价比', icon: '💰' }
];

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getReviewsData = () => {
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

const getLikesData = () => {
  const data = localStorage.getItem(LIKES_STORAGE_KEY);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    const now = new Date().getTime();
    
    if (parsed.expireTime && now > parsed.expireTime) {
      localStorage.removeItem(LIKES_STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (e) {
    return null;
  }
};

const saveLikesData = (likesData) => {
  const data = {
    items: likesData,
    expireTime: getExpireTime()
  };
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(data));
};

const getAllReviews = () => {
  const data = getReviewsData();
  const storageReviews = data && data.items ? data.items : [];
  
  const maxStaticId = staticReviews.length > 0 ? Math.max(...staticReviews.map(r => r.id)) : 0;
  const maxStorageId = storageReviews.length > 0 ? Math.max(...storageReviews.map(r => r.id)) : 0;
  
  if (maxStorageId <= maxStaticId) {
    return [...staticReviews, ...storageReviews];
  }
  
  const staticIds = new Set(staticReviews.map(r => r.id));
  const filteredStorageReviews = storageReviews.filter(r => !staticIds.has(r.id));
  
  return [...staticReviews, ...filteredStorageReviews];
};

const mergeLikesWithReviews = (reviews) => {
  const likesData = getLikesData();
  const likesMap = likesData && likesData.items ? likesData.items : {};
  
  return reviews.map(review => {
    const reviewLikes = likesMap[review.id];
    if (reviewLikes) {
      return {
        ...review,
        likes: {
          count: reviewLikes.count,
          users: [...reviewLikes.users]
        }
      };
    }
    return review;
  });
};

const getReviews = () => {
  const allReviews = getAllReviews();
  return mergeLikesWithReviews(allReviews);
};

const saveReviews = (reviews) => {
  const staticIds = new Set(staticReviews.map(r => r.id));
  const storageReviews = reviews.filter(r => !staticIds.has(r.id));
  
  const data = {
    items: storageReviews,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const updateReviewLikes = (reviewId, likes) => {
  const likesData = getLikesData();
  const likesMap = likesData && likesData.items ? { ...likesData.items } : {};
  
  likesMap[reviewId] = {
    count: likes.count,
    users: [...likes.users]
  };
  
  saveLikesData(likesMap);
};

export const getNextReviewId = () => {
  const reviews = getAllReviews();
  return reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
};

export const createReview = (reviewData) => {
  const reviews = getAllReviews();
  
  const now = new Date();
  
  const newReview = {
    id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
    propertyId: reviewData.propertyId,
    orderId: reviewData.orderId,
    userId: reviewData.userId,
    userName: reviewData.userName,
    userAvatar: reviewData.userAvatar,
    ratings: {
      overall: reviewData.overallRating,
      location: reviewData.ratings.location,
      cleanliness: reviewData.ratings.cleanliness,
      service: reviewData.ratings.service,
      facilities: reviewData.ratings.facilities,
      value: reviewData.ratings.value
    },
    content: reviewData.content,
    images: reviewData.images || [],
    hostReply: null,
    likes: {
      count: 0,
      users: []
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  
  reviews.push(newReview);
  saveReviews(reviews);
  
  return {
    success: true,
    message: '评价发表成功',
    review: newReview
  };
};

export const getReviewsByPropertyId = (propertyId) => {
  const reviews = getReviews();
  return reviews
    .filter(r => r.propertyId === propertyId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getReviewsByUserId = (userId) => {
  const reviews = getReviews();
  return reviews
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getReviewById = (reviewId) => {
  const reviews = getReviews();
  return reviews.find(r => r.id === reviewId) || null;
};

export const getReviewByOrderId = (orderId) => {
  const reviews = getReviews();
  return reviews.find(r => r.orderId === orderId) || null;
};

export const toggleLike = (reviewId, userId) => {
  const reviews = getReviews();
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) {
    return {
      success: false,
      message: '评价不存在'
    };
  }
  
  const review = reviews[reviewIndex];
  
  if (!review.likes) {
    review.likes = { count: 0, users: [] };
  }
  
  const userIndex = review.likes.users.indexOf(userId);
  let isLiked;
  
  if (userIndex === -1) {
    review.likes.users.push(userId);
    review.likes.count++;
    isLiked = true;
    
    if (review.userId !== userId) {
      const property = properties.find(p => p.id === review.propertyId);
      if (property) {
        createReviewNotification(
          review,
          property,
          REVIEW_NOTIFICATION_SUBTYPES.LIKE,
          review.userId
        );
      }
    }
  } else {
    review.likes.users.splice(userIndex, 1);
    review.likes.count--;
    isLiked = false;
  }
  
  review.updatedAt = new Date().toISOString();
  
  updateReviewLikes(reviewId, review.likes);
  
  reviews[reviewIndex] = review;
  
  const staticIds = new Set(staticReviews.map(r => r.id));
  if (!staticIds.has(reviewId)) {
    saveReviews(reviews);
  }
  
  return {
    success: true,
    message: isLiked ? '点赞成功' : '取消点赞成功',
    review: review,
    isLiked: isLiked
  };
};

export const checkUserCanReview = (userId, propertyId) => {
  const reviews = getReviews();
  return reviews.some(r => r.userId === userId && r.propertyId === propertyId);
};

export const checkOrderCanReview = (order) => {
  if (!order) return { canReview: false, reason: '订单不存在' };
  
  if (order.status !== 'paid' && order.status !== 'completed') {
    return { canReview: false, reason: '只有已支付或已完成的订单才能评价' };
  }
  
  const existingReview = getReviewByOrderId(order.id);
  if (existingReview) {
    return { canReview: false, reason: '该订单已评价过' };
  }
  
  const paidAt = order.paidAt ? new Date(order.paidAt) : null;
  if (!paidAt) {
    return { canReview: false, reason: '订单支付时间无效' };
  }
  
  const now = new Date();
  const diffDays = (now.getTime() - paidAt.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffDays > REVIEW_EXPIRE_DAYS) {
    return { canReview: false, reason: `评价期限已过（需在支付后${REVIEW_EXPIRE_DAYS}天内评价）` };
  }
  
  return { canReview: true, reason: '', daysLeft: Math.ceil(REVIEW_EXPIRE_DAYS - diffDays) };
};

export const getPropertyRatingSummary = (propertyId) => {
  const reviews = getReviewsByPropertyId(propertyId);
  
  if (reviews.length === 0) {
    return {
      overall: 0,
      location: 0,
      cleanliness: 0,
      service: 0,
      facilities: 0,
      value: 0,
      total: 0
    };
  }
  
  const summary = {
    overall: 0,
    location: 0,
    cleanliness: 0,
    service: 0,
    facilities: 0,
    value: 0,
    total: reviews.length
  };
  
  reviews.forEach(review => {
    summary.overall += review.ratings.overall;
    summary.location += review.ratings.location;
    summary.cleanliness += review.ratings.cleanliness;
    summary.service += review.ratings.service;
    summary.facilities += review.ratings.facilities;
    summary.value += review.ratings.value;
  });
  
  const count = reviews.length;
  summary.overall = Math.round((summary.overall / count) * 10) / 10;
  summary.location = Math.round((summary.location / count) * 10) / 10;
  summary.cleanliness = Math.round((summary.cleanliness / count) * 10) / 10;
  summary.service = Math.round((summary.service / count) * 10) / 10;
  summary.facilities = Math.round((summary.facilities / count) * 10) / 10;
  summary.value = Math.round((summary.value / count) * 10) / 10;
  
  return summary;
};
