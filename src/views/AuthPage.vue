<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-sidebar">
        <div class="sidebar-content">
          <div class="logo">
            <span class="logo-icon">🏠</span>
            <h1>民宿之家</h1>
          </div>
          <p class="tagline">发现全球独特的住宿体验</p>
          <div class="features">
            <div class="feature-item">
              <span class="feature-icon">🔒</span>
              <span class="feature-text">安全可靠的预订系统</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✨</span>
              <span class="feature-text">精选优质民宿房源</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <span class="feature-text">真实用户评价反馈</span>
            </div>
          </div>
          <div class="decoration">
            <img 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20modern%20apartment%20interior%20with%20sunlight%20streaming%20through%20windows%20minimalist%20design&image_size=square" 
              alt="民宿展示" 
              class="decoration-image"
            />
          </div>
        </div>
      </div>
      
      <div class="auth-form-container">
        <div class="auth-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
          >
            登录
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'register' }"
            @click="activeTab = 'register'"
          >
            注册
          </button>
        </div>
        
        <Transition name="fade">
          <div v-show="activeTab === 'login'" key="login" class="form-wrapper">
            <div class="form-header">
              <h2>欢迎回来</h2>
              <p>登录您的民宿之家账户</p>
            </div>
            
            <el-form :model="loginForm" :rules="loginRules" ref="loginRef" label-position="top" class="auth-form">
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="loginForm.username" 
                  placeholder="请输入用户名" 
                  size="large"
                  prefix-icon="User"
                />
              </el-form-item>
              
              <el-form-item label="密码" prop="password">
                <el-input 
                  v-model="loginForm.password" 
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码" 
                  size="large"
                  prefix-icon="Lock"
                  :show-password="true"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              
              <el-form-item>
                <div class="form-actions">
                  <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
                </div>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  size="large" 
                  :loading="loginLoading"
                  @click="handleLogin"
                  style="width: 100%;"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
            
            <div class="form-tip">
              <span>还没有账户？</span>
              <button class="link-btn" @click="activeTab = 'register'">立即注册</button>
            </div>
            
            <div class="demo-account">
              <span class="demo-label">演示账户：</span>
              <span class="demo-info">用户名 admin / 密码 123456</span>
            </div>
          </div>
        </Transition>
        
        <Transition name="fade">
          <div v-show="activeTab === 'register'" key="register" class="form-wrapper">
            <div class="form-header">
              <h2>创建账户</h2>
              <p>加入民宿之家，开启您的旅程</p>
            </div>
            
            <el-form :model="registerForm" :rules="registerRules" ref="registerRef" label-position="top" class="auth-form">
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="registerForm.username" 
                  placeholder="请输入用户名（4-16位字母数字）" 
                  size="large"
                  prefix-icon="User"
                />
              </el-form-item>
              
              <el-form-item label="密码" prop="password">
                <el-input 
                  v-model="registerForm.password" 
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码（6-20位）" 
                  size="large"
                  prefix-icon="Lock"
                  :show-password="true"
                />
              </el-form-item>
              
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="registerForm.confirmPassword" 
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请再次输入密码" 
                  size="large"
                  prefix-icon="Lock"
                  :show-password="true"
                />
              </el-form-item>
              
              <el-form-item label="验证码" prop="captcha">
                <div class="captcha-row">
                  <el-input 
                    v-model="registerForm.captcha" 
                    placeholder="请输入验证码" 
                    size="large"
                    prefix-icon="Key"
                    style="flex: 1;"
                  />
                  <div class="captcha-box" @click="refreshCaptcha">
                    <span class="captcha-text">{{ currentCaptcha }}</span>
                    <span class="refresh-tip">点击刷新</span>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item>
                <el-checkbox v-model="registerForm.agreed">
                  我已阅读并同意 <span class="link-text">《用户协议》</span> 和 <span class="link-text">《隐私政策》</span>
                </el-checkbox>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  size="large" 
                  :loading="registerLoading"
                  @click="handleRegister"
                  style="width: 100%;"
                >
                  注册
                </el-button>
              </el-form-item>
            </el-form>
            
            <div class="form-tip">
              <span>已有账户？</span>
              <button class="link-btn" @click="activeTab = 'login'">立即登录</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <div class="auth-footer">
      <p>&copy; 2024 民宿之家. 保留所有权利.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { loginUser, registerUser, getRememberedUser, generateCaptcha, getCurrentUser } from '../data/user'

const router = useRouter()
const route = useRoute()
const instance = getCurrentInstance()

const activeTab = ref('login')
const showPassword = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)
const currentCaptcha = ref('')

const loginRef = ref(null)
const registerRef = ref(null)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  agreed: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 16, message: '用户名长度为2-16位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateCaptcha = (rule, value, callback) => {
  if (value.toUpperCase() !== currentCaptcha.value) {
    callback(new Error('验证码错误'))
  } else {
    callback()
  }
}

const validateAgreed = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '用户名长度为4-16位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '用户名只能包含字母和数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: validateCaptcha, trigger: 'blur' }
  ],
  agreed: [
    { validator: validateAgreed, trigger: 'change' }
  ]
}

const refreshCaptcha = () => {
  currentCaptcha.value = generateCaptcha()
}

const handleLogin = async () => {
  if (!loginRef.value) return
  
  const valid = await loginRef.value.validate().catch(() => false)
  if (!valid) return
  
  loginLoading.value = true
  
  setTimeout(() => {
    const result = loginUser(loginForm.username, loginForm.password, loginForm.rememberMe)
    
    loginLoading.value = false
    
    if (result.success) {
      ElMessage.success('登录成功！')
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
  }, 800)
}

const handleRegister = async () => {
  if (!registerRef.value) return
  
  const valid = await registerRef.value.validate().catch(() => false)
  if (!valid) return
  
  registerLoading.value = true
  
  setTimeout(() => {
    const result = registerUser(registerForm.username, registerForm.password)
    
    registerLoading.value = false
    
    if (result.success) {
      ElMessage.success('注册成功！请登录')
      activeTab.value = 'login'
      loginForm.username = registerForm.username
      loginForm.password = ''
      refreshCaptcha()
    } else {
      ElMessage.error(result.message)
      refreshCaptcha()
    }
  }, 1000)
}

const updateTabFromRoute = () => {
  if (route.path === '/register') {
    activeTab.value = 'register'
  } else {
    activeTab.value = 'login'
  }
}

watch(
  () => route.path,
  () => {
    updateTabFromRoute()
  }
)

onMounted(() => {
  const currentUser = getCurrentUser()
  if (currentUser) {
    router.push('/')
    return
  }
  
  updateTabFromRoute()
  refreshCaptcha()
  
  const remembered = getRememberedUser()
  if (remembered) {
    loginForm.username = remembered.username
    loginForm.password = remembered.password
    loginForm.rememberMe = true
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 50%, #f5f0ff 100%);
}

.auth-container {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 1rem;
  width: 100%;
}

.auth-sidebar {
  flex: 0 0 45%;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  border-radius: 24px 0 0 24px;
  padding: 3rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-sidebar::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.sidebar-content {
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 2.5rem;
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.tagline {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-icon {
  font-size: 1.5rem;
  background: rgba(255,255,255,0.2);
  padding: 0.5rem;
  border-radius: 8px;
}

.feature-text {
  font-size: 1rem;
  font-weight: 500;
}

.decoration {
  margin-top: 3rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.decoration-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.auth-form-container {
  flex: 1;
  background: white;
  border-radius: 0 24px 24px 0;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  box-shadow: 20px 0 60px rgba(0,0,0,0.08);
}

.auth-tabs {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.tab-btn {
  padding: 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-btn.active {
  color: #ff5a5f;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ff5a5f;
  border-radius: 1px;
}

.form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.form-header p {
  color: #666;
  margin: 0;
}

.auth-form {
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-btn {
  background: none;
  border: none;
  color: #ff5a5f;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

.form-tip {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.form-tip .link-btn {
  margin-left: 0.25rem;
  font-weight: 600;
}

.demo-account {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fff5f5;
  border-radius: 8px;
  text-align: center;
  font-size: 0.85rem;
}

.demo-label {
  color: #666;
}

.demo-info {
  color: #ff5a5f;
  font-weight: 600;
}

.captcha-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.captcha-box {
  min-width: 120px;
  height: 40px;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.captcha-box:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(255, 90, 95, 0.3);
}

.captcha-text {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: 4px;
}

.refresh-tip {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.8);
}

.link-text {
  color: #ff5a5f;
  cursor: pointer;
}

.link-text:hover {
  text-decoration: underline;
}

.auth-footer {
  text-align: center;
  padding: 1.5rem;
  color: #999;
  font-size: 0.85rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (max-width: 1024px) {
  .auth-container {
    flex-direction: column;
    margin: 2rem auto;
  }
  
  .auth-sidebar {
    border-radius: 24px 24px 0 0;
    flex: none;
    padding: 2rem;
  }
  
  .auth-form-container {
    border-radius: 0 0 24px 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  }
  
  .decoration {
    display: none;
  }
}

@media (max-width: 480px) {
  .auth-container {
    margin: 0;
    padding: 0;
  }
  
  .auth-sidebar {
    border-radius: 0;
    padding: 1.5rem;
  }
  
  .auth-form-container {
    border-radius: 0;
    padding: 1.5rem;
  }
  
  .logo h1 {
    font-size: 1.5rem;
  }
  
  .form-header h2 {
    font-size: 1.5rem;
  }
}
</style>
