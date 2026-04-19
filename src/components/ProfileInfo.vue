<template>
  <div class="content-section">
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
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserInfo } from '../data/user'

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:userInfo'])

const isEditing = ref(false)
const selectedAvatar = ref(props.userInfo.avatar)

const editForm = reactive({
  username: props.userInfo.username,
  email: props.userInfo.email || '',
  phone: props.userInfo.phone || ''
})

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
    editForm.username = props.userInfo.username
    editForm.email = props.userInfo.email || ''
    editForm.phone = props.userInfo.phone || ''
  }
  isEditing.value = !isEditing.value
}

const saveProfile = () => {
  const updates = {}
  if (editForm.email !== props.userInfo.email) {
    updates.email = editForm.email
  }
  if (editForm.phone !== props.userInfo.phone) {
    updates.phone = editForm.phone
  }
  
  if (selectedAvatar.value && selectedAvatar.value !== props.userInfo.avatar) {
    updates.avatar = selectedAvatar.value
  }
  
  if (Object.keys(updates).length > 0) {
    const result = updateUserInfo(updates)
    if (result.success) {
      emit('update:userInfo', result.user)
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
</script>

<style scoped>
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

@media (max-width: 480px) {
  .content-section {
    padding: 1.5rem;
  }
  
  .avatar-setting {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
