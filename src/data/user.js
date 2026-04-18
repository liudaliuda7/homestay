const STORAGE_KEYS = {
  USERS: 'homestay_users',
  CURRENT_USER: 'homestay_current_user',
  REMEMBER_ME: 'homestay_remember_me'
};

const EXPIRE_DAYS = 3;

const defaultUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    avatar: 'https://picsum.photos/id/1005/100/100',
    email: 'admin@homestay.com',
    phone: '13800138000',
    createdAt: new Date().toISOString()
  }
];

const getExpireTime = () => {
  const now = new Date();
  return now.getTime() + EXPIRE_DAYS * 24 * 60 * 60 * 1000;
};

const initUsers = () => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
};

const getUsers = () => {
  initUsers();
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const registerUser = (username, password) => {
  const users = getUsers();
  
  if (users.find(u => u.username === username)) {
    return {
      success: false,
      message: '用户名已存在'
    };
  }
  
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    password,
    avatar: `https://picsum.photos/id/${100 + new Date().getTime() % 100}/100/100`,
    email: '',
    phone: '',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return {
    success: true,
    message: '注册成功',
    user: {
      id: newUser.id,
      username: newUser.username,
      avatar: newUser.avatar,
      email: newUser.email,
      phone: newUser.phone
    }
  };
};

export const loginUser = (username, password, rememberMe = false) => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return {
      success: false,
      message: '用户名或密码错误'
    };
  }
  
  const userInfo = {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    email: user.email,
    phone: user.phone,
    expireTime: getExpireTime()
  };
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userInfo));
  
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify({
      username,
      password,
      expireTime: getExpireTime()
    }));
  } else {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }
  
  return {
    success: true,
    message: '登录成功',
    user: userInfo
  };
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  
  if (!userData) {
    return null;
  }
  
  const user = JSON.parse(userData);
  
  if (new Date().getTime() > user.expireTime) {
    logoutUser();
    return null;
  }
  
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    email: user.email,
    phone: user.phone
  };
};

export const getRememberedUser = () => {
  const rememberData = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  
  if (!rememberData) {
    return null;
  }
  
  const data = JSON.parse(rememberData);
  
  if (new Date().getTime() > data.expireTime) {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    return null;
  }
  
  return {
    username: data.username,
    password: data.password
  };
};

export const updateUserInfo = (updates) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return {
      success: false,
      message: '用户未登录'
    };
  }
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates
  };
  
  saveUsers(users);
  
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  const userInfo = JSON.parse(userData);
  
  const updatedUserInfo = {
    ...userInfo,
    avatar: updates.avatar || userInfo.avatar,
    email: updates.email || userInfo.email,
    phone: updates.phone || userInfo.phone
  };
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUserInfo));
  
  return {
    success: true,
    message: '更新成功',
    user: updatedUserInfo
  };
};

export const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captcha = '';
  for (let i = 0; i < 4; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};
