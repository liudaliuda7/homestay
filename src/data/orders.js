const STORAGE_KEY = 'homestay_orders';
const EXPIRE_DAYS = 30;

import { 
  createOrderNotification,
  ORDER_NOTIFICATION_SUBTYPES
} from './notifications';

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const getOrdersData = () => {
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

const getOrders = () => {
  const data = getOrdersData();
  return data && data.items ? data.items : [];
};

const saveOrders = (orders) => {
  const data = {
    items: orders,
    expireTime: getExpireTime()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const generateOrderNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HS${year}${month}${day}${random}`;
};

export const createOrder = (orderData, userId) => {
  const orders = getOrders();
  
  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    orderNo: generateOrderNo(),
    propertyId: orderData.propertyId,
    propertyTitle: orderData.propertyTitle,
    propertyImage: orderData.propertyImage,
    location: orderData.location,
    price: orderData.price,
    checkInDate: orderData.checkInDate,
    checkOutDate: orderData.checkOutDate,
    guests: orderData.guests,
    stayDays: orderData.stayDays,
    totalPrice: orderData.totalPrice,
    userId: userId,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    paidAt: null
  };
  
  orders.push(newOrder);
  saveOrders(orders);
  
  createOrderNotification(newOrder, ORDER_NOTIFICATION_SUBTYPES.CREATE, userId);
  
  return {
    success: true,
    message: '订单创建成功',
    order: newOrder
  };
};

export const payOrder = (orderId) => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return {
      success: false,
      message: '订单不存在'
    };
  }
  
  orders[orderIndex].status = ORDER_STATUS.PAID;
  orders[orderIndex].paidAt = new Date().toISOString();
  saveOrders(orders);
  
  createOrderNotification(orders[orderIndex], ORDER_NOTIFICATION_SUBTYPES.PAY, orders[orderIndex].userId);
  
  return {
    success: true,
    message: '支付成功',
    order: orders[orderIndex]
  };
};

export const cancelOrder = (orderId) => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return {
      success: false,
      message: '订单不存在'
    };
  }
  
  if (orders[orderIndex].status === ORDER_STATUS.PAID) {
    return {
      success: false,
      message: '已支付订单无法取消，请联系客服'
    };
  }
  
  orders[orderIndex].status = ORDER_STATUS.CANCELLED;
  saveOrders(orders);
  
  createOrderNotification(orders[orderIndex], ORDER_NOTIFICATION_SUBTYPES.CANCEL, orders[orderIndex].userId);
  
  return {
    success: true,
    message: '订单已取消',
    order: orders[orderIndex]
  };
};

export const getOrderById = (orderId) => {
  const orders = getOrders();
  return orders.find(o => o.id === orderId) || null;
};

export const getOrderByNo = (orderNo) => {
  const orders = getOrders();
  return orders.find(o => o.orderNo === orderNo) || null;
};

export const getOrdersByUserId = (userId) => {
  const orders = getOrders();
  return orders
    .filter(o => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateOrderStatus = (orderId, status) => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return {
      success: false,
      message: '订单不存在'
    };
  }
  
  orders[orderIndex].status = status;
  saveOrders(orders);
  
  return {
    success: true,
    message: '订单状态更新成功',
    order: orders[orderIndex]
  };
};
