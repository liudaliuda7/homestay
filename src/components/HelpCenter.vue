<template>
  <div class="content-section">
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

@media (max-width: 480px) {
  .content-section {
    padding: 1.5rem;
  }
}
</style>
