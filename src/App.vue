<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="app">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 路由视图 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>民宿之家</h3>
            <p>为您提供舒适的住宿体验</p>
          </div>
          <div class="footer-section">
            <h4>快速链接</h4>
            <ul>
              <li><a href="#">首页</a></li>
              <li><a href="#">城市</a></li>
              <li><a href="#">优惠</a></li>
              <li><a href="#">帮助中心</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>联系我们</h4>
            <ul>
              <li>客服电话：400-123-4567</li>
              <li>邮箱：service@minsuhome.com</li>
              <li>地址：北京市朝阳区建国路88号</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 民宿之家. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

.footer {
  background-color: #333;
  color: white;
  padding: 2rem 0;
  margin-top: 3rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-section p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #ccc;
  margin: 0;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #ccc;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #ff5a5f;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #555;
  font-size: 0.8rem;
  color: #ccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
