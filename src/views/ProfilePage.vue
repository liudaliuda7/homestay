<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-container">
        <div class="sidebar">
          <div class="sidebar-header">
            <div class="user-avatar-large">
              <img :src="userInfo.avatar" :alt="userInfo.username" />
            </div>
            <div class="user-info">
              <h3 class="username">{{ userInfo.username }}</h3>
              <p class="user-status">会员用户</p>
            </div>
          </div>
          
          <div class="sidebar-menu">
            <button 
              v-for="item in menuItems" 
              :key="item.id"
              class="menu-item" 
              :class="{ active: activeMenu === item.id }"
              @click="activeMenu = item.id"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.name }}</span>
              <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
            </button>
          </div>
        </div>
        
        <div class="content">
          <Transition name="fade" mode="out-in">
            <div v-if="activeMenu === 'profile'" key="profile" class="content-section">
              <div class="section-header">
                <h2>个人信息</h2>
                <p>管理您的基本信息</p>
              </div>
              
              <div class="info-cards">
                <div class="info-card">
                  <div class="card-header">
                    <h3>基本信息</h3>
                    <button class="edit-btn" @click="toggleEditProfile">
                      {{ isEditing ? '取消' : '编辑' }}
                    </button>
                  </div>
                  
                  <el-form :model="editForm" label-position="left" label-width="100px" class="info-form">
                    <el-form-item label="用户名">
                      <el-input v-model="editForm.username" :disabled="!isEditing" />
                    </el-form-item>
                    
                    <el-form-item label="邮箱">
                      <el-input 
                        v-model="editForm.email" 
                        :disabled="!isEditing"
                        placeholder="请输入邮箱地址"
                      />
                    </el-form-item>
                    
                    <el-form-item label="手机号">
                      <el-input 
                        v-model="editForm.phone" 
                        :disabled="!isEditing"
                        placeholder="请输入手机号码"
                      />
                    </el-form-item>
                    
                    <el-form-item v-if="isEditing">
                      <el-button type="primary" @click="saveProfile">保存修改</el-button>
                    </el-form-item>
                  </el-form>
                </div>
                
                <div class="info-card">
                  <div class="card-header">
                    <h3>头像设置</h3>
                  </div>
                  
                  <div class="avatar-setting">
                    <div class="current-avatar">
                      <img :src="userInfo.avatar" :alt="userInfo.username" />
                    </div>
                    <div class="avatar-options">
                      <p>选择默认头像：</p>
                      <div class="avatar-list">
                        <img 
                          v-for="(avatar, index) in avatarOptions" 
                          :key="index"
                          :src="avatar" 
                          :alt="`头像${index + 1}`"
                          class="avatar-option"
                          :class="{ selected: selectedAvatar === avatar }"
                          @click="selectAvatar(avatar)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="activeMenu === 'orders'" key="orders" class="content-section">
              <div class="section-header">
                <h2>我的订单</h2>
                <p>查看您的预订记录</p>
              </div>
              
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>暂无订单</h3>
                <p>您还没有任何预订订单</p>
                <router-link to="/" class="empty-btn">去预订</router-link>
              </div>
            </div>
            
            <div v-else-if="activeMenu === 'favorites'" key="favorites" class="content-section">
              <div class="section-header">
                <h2>我的收藏</h2>
                <p>您收藏的房源列表</p>
              </div>
              
              <div class="empty-state">
                <div class="empty-icon">❤️</div>
                <h3>暂无收藏</h3>
                <p>去发现喜欢的房源吧</p>
                <router-link to="/" class="empty-btn">浏览房源</router-link>
              </div>
            </div>
            
            <div v-else-if="activeMenu === 'security'" key="security" class="content-section">
              <div class="section-header">
                <h2>账户安全</h2>
                <p>保护您的账户安全</p>
              </div>
              
              <div class="security-list">
                <div class="security-item">
                  <div class="security-info">
                    <span class="security-icon">🔐</span>
                    <div>
                      <h4>登录密码</h4>
                      <p>定期修改密码可以保护账户安全</p>
                    </div>
                  </div>
                  <button class="action-btn">修改</button>
                </div>
                
                <div class="security-item">
                  <div class="security-info">
                    <span class="security-icon">📱</span>
                    <div>
                      <h4>绑定手机</h4>
                      <p>{{ userInfo.phone || '未绑定' }}</p>
                    </div>
                  </div>
                  <button class="action-btn">{{ userInfo.phone ? '更换' : '绑定' }}</button>
                </div>
                
                <div class="security-item">
                  <div class="security-info">
                    <span class="security-icon">📧</span>
                    <div>
                      <h4>绑定邮箱</h4>
                      <p>{{ userInfo.email || '未绑定' }}</p>
                    </div>
                  </div>
                  <button class="action-btn">{{ userInfo.email ? '更换' : '绑定' }}</button>
                </div>
              </div>
            </div>
            
            <div v-else-if="activeMenu === 'help'" key="help" class="content-section">
              <div class="section-header">
                <h2>帮助中心</h2>
                <p>常见问题解答</p>
              </div>
              
              <div class="help-list">
                <div class="help-item">
                  <h4>如何预订房源？</h4>
                  <p>浏览房源后，选择入住日期和房客数量，点击预订按钮即可完成预订。</p>
                </div>
                <div class="help-item">
                  <h4>如何取消预订？</h4>
                  <p>在订单详情页点击取消预订，根据取消政策可能会有部分退款。</p>
                </div>
                <div class="help-item">
                  <h4>联系客服</h4>
                  <p>如有其他问题，请拨打客服热线：400-888-8888</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCurrentUser, updateUserInfo } from '../data/user'

const router = useRouter()

const activeMenu = ref('profile')
const isEditing = ref(false)
const selectedAvatar = ref('')

const userInfo = ref({
  id: 0,
  username: '',
  avatar: '',
  email: '',
  phone: ''
})

const editForm = reactive({
  username: '',
  email: '',
  phone: ''
})

const menuItems = [
  { id: 'profile', name: '个人信息', icon: '👤' },
  { id: 'orders', name: '我的订单', icon: '📋', badge: 0 },
  { id: 'favorites', name: '我的收藏', icon: '❤️', badge: 0 },
  { id: 'security', name: '账户安全', icon: '🔐' },
  { id: 'help', name: '帮助中心', icon: '❓' }
]

const avatarOptions = [
  'https://picsum.photos/id/1001/100/100',
  'https://picsum.photos/id/1002/100/100',
  'https://picsum.photos/id/1005/100/100',
  'https://picsum.photos/id/1012/100/100',
  'https://picsum.photos/id/1025/100/100',
  'https://picsum.photos/id/1027/100/100'
]

const toggleEditProfile = () => {
  if (isEditing.value) {
    editForm.username = userInfo.value.username
    editForm.email = userInfo.value.email
    editForm.phone = userInfo.value.phone
  }
  isEditing.value = !isEditing.value
}

const saveProfile = () => {
  const updates = {}
  if (editForm.email !== userInfo.value.email) {
    updates.email = editForm.email
  }
  if (editForm.phone !== userInfo.value.phone) {
    updates.phone = editForm.phone
  }
  
  if (selectedAvatar.value && selectedAvatar.value !== userInfo.value.avatar) {
    updates.avatar = selectedAvatar.value
  }
  
  if (Object.keys(updates).length > 0) {
    const result = updateUserInfo(updates)
    if (result.success) {
      Object.assign(userInfo.value, result.user)
      ElMessage.success('保存成功！')
      isEditing.value = false
    } else {
      ElMessage.error(result.message)
    }
  } else {
    ElMessage.info('没有修改内容')
    isEditing.value = false
  }
}

const selectAvatar = (avatar) => {
  selectedAvatar.value = avatar
}

onMounted(() => {
  const user = getCurrentUser()
  if (!user) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  userInfo.value = { ...user }
  editForm.username = user.username
  editForm.email = user.email || ''
  editForm.phone = user.phone || ''
  selectedAvatar.value = user.avatar
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

.sidebar {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  align-self: start;
}

.sidebar-header {
  padding: 2rem;
  background: linear-gradient(135deg, #ff5a5f 0%, #ff7a7f 100%);
  text-align: center;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  color: white;
}

.username {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.user-status {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0;
}

.sidebar-menu {
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background-color: #fff5f5;
}

.menu-item.active {
  background-color: #fff5f5;
  border-right: 3px solid #ff5a5f;
}

.menu-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 0.95rem;
  color: #333;
  flex: 1;
}

.menu-item.active .menu-text {
  color: #ff5a5f;
  font-weight: 600;
}

.menu-badge {
  background: #ff5a5f;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.content {
  min-height: 400px;
}

.content-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #666;
  margin: 0;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.edit-btn {
  background: none;
  border: 1px solid #ff5a5f;
  color: #ff5a5f;
  padding: 0.375rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #ff5a5f;
  color: white;
}

.info-form {
  max-width: 500px;
}

.avatar-setting {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
}

.current-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f0f0f0;
}

.current-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-options {
  flex: 1;
}

.avatar-options p {
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.avatar-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.avatar-option {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.avatar-option:hover {
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: #ff5a5f;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #333;
  margin: 0 0 0.75rem 0;
}

.empty-state p {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.empty-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #ff5a5f;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.empty-btn:hover {
  background: #ff474c;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 12px;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.security-icon {
  font-size: 1.75rem;
}

.security-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
}

.security-info p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.action-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid #ff5a5f;
  color: #ff5a5f;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #ff5a5f;
  color: white;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.help-item {
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 12px;
}

.help-item h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.help-item p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

@media (max-width: 1024px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: sticky;
    top: 80px;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .user-avatar-large {
    width: 60px;
    height: 60px;
    margin: 0;
  }
  
  .user-info {
    text-align: left;
  }
  
  .sidebar-menu {
    display: flex;
    overflow-x: auto;
    padding: 0;
  }
  
  .menu-item {
    flex-direction: column;
    padding: 1rem;
    min-width: 80px;
    gap: 0.5rem;
  }
  
  .menu-item.active {
    border-right: none;
    border-bottom: 3px solid #ff5a5f;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 1rem 0;
  }
  
  .content-section {
    padding: 1.5rem;
  }
  
  .avatar-setting {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
