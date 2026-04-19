<template>
  <div class="content-section">
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
</template>

<script setup>
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

@media (max-width: 480px) {
  .content-section {
    padding: 1.5rem;
  }
}
</style>
