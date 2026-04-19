<template>
  <div class="content-section">
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
</template>

<script setup>
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})
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

@media (max-width: 480px) {
  .content-section {
    padding: 1.5rem;
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
