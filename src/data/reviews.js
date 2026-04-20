const STORAGE_KEY = 'homestay_reviews';
const EXPIRE_DAYS = 7;
const REVIEW_EXPIRE_DAYS = 10;

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

const getReviews = () => {
  const data = getReviewsData();
  return data && data.items ? data.items : [];
};

const saveReviews = (reviews) => {
  const data = {
    items: reviews,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const createReview = (reviewData) => {
  const reviews = getReviews();
  
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
  const userIndex = review.likes.users.indexOf(userId);
  
  if (userIndex === -1) {
    review.likes.users.push(userId);
    review.likes.count++;
  } else {
    review.likes.users.splice(userIndex, 1);
    review.likes.count--;
  }
  
  review.updatedAt = new Date().toISOString();
  reviews[reviewIndex] = review;
  saveReviews(reviews);
  
  return {
    success: true,
    message: userIndex === -1 ? '点赞成功' : '取消点赞成功',
    review: review,
    isLiked: userIndex === -1
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

export const initSampleReviews = () => {
  const data = getReviewsData();
  if (data && data.items && data.items.length > 0) return;
  
  const sampleReviews = [
    {
      id: 1,
      propertyId: 1,
      orderId: 1,
      userId: 1,
      userName: '刘先生',
      userAvatar: 'https://picsum.photos/id/1001/100/100',
      ratings: {
        overall: 4.8,
        location: 5,
        cleanliness: 5,
        service: 5,
        facilities: 4,
        value: 5
      },
      content: '非常满意的住宿体验！房间干净整洁，设施齐全，交通便利。房东热情周到，强烈推荐！',
      images: [],
      hostReply: null,
      likes: {
        count: 3,
        users: [2, 3, 4]
      },
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z'
    },
    {
      id: 2,
      propertyId: 1,
      orderId: 2,
      userId: 2,
      userName: '王女士',
      userAvatar: 'https://picsum.photos/id/1002/100/100',
      ratings: {
        overall: 4.0,
        location: 5,
        cleanliness: 4,
        service: 4,
        facilities: 4,
        value: 3
      },
      content: '房间不错，地理位置很好，就是隔音稍微差了一些。整体满意，下次还会选择。',
      images: [],
      hostReply: null,
      likes: {
        count: 1,
        users: [1]
      },
      createdAt: '2024-01-10T12:00:00.000Z',
      updatedAt: '2024-01-10T12:00:00.000Z'
    }
  ];
  
  saveReviews(sampleReviews);
};
