// tests/property.spec.js
import { test, expect } from '@playwright/test';

// 房源详情页测试
test.describe('Property Detail Page Tests', () => {
  // 测试详情页加载
  test('should load property detail page correctly', async ({ page }) => {
    // 直接访问房源详情页
    await page.goto('http://localhost:5173/property/1');
    
    // 验证页面包含房源信息
    await expect(page.locator('.property-detail')).toBeVisible();
    
    // 验证图片轮播存在
    await expect(page.locator('.image-carousel')).toBeVisible();
    
    // 验证房源标题存在
    const title = page.locator('.title');
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
    
    // 验证价格信息存在
    await expect(page.locator('.price')).toBeVisible();
    
    // 验证房东信息存在
    await expect(page.locator('.host-info')).toBeVisible();
    
    // 验证设施配备存在
    await expect(page.locator('.amenities')).toBeVisible();
    
    // 验证用户评价存在
    await expect(page.locator('.reviews')).toBeVisible();
  });
  
  // 测试图片轮播功能
  test('should navigate through property images correctly', async ({ page }) => {
    // 访问房源详情页
    await page.goto('http://localhost:5173/property/1');
    
    // 获取初始图片
    const initialImage = await page.locator('.main-image img').getAttribute('src');
    
    // 点击第二个缩略图
    const thumbnails = page.locator('.thumbnail');
    await expect(thumbnails).toHaveCount(expect.above(1));
    await thumbnails.nth(1).click();
    
    // 验证主图已切换
    const newImage = await page.locator('.main-image img').getAttribute('src');
    expect(newImage).not.toBe(initialImage);
    
    // 验证当前缩略图已激活
    await expect(thumbnails.nth(1)).toHaveClass(/active/);
  });
  
  // 测试预订功能UI
  test('should display booking form correctly', async ({ page }) => {
    // 访问房源详情页
    await page.goto('http://localhost:5173/property/1');
    
    // 验证预订卡片存在
    await expect(page.locator('.booking-card')).toBeVisible();
    
    // 验证日期选择器存在
    await expect(page.locator('.date-picker')).toBeVisible();
    await expect(page.locator('.date-field')).toHaveCount(2);
    
    // 验证房客数量输入框存在
    await expect(page.locator('.guest-field')).toBeVisible();
    
    // 验证预订按钮存在
    const bookBtn = page.locator('.book-btn');
    await expect(bookBtn).toBeVisible();
    await expect(bookBtn).toContainText('立即预订');
  });
  
  // 测试返回首页导航
  test('should navigate back to home page when clicking logo', async ({ page }) => {
    // 访问房源详情页
    await page.goto('http://localhost:5173/property/1');
    
    // 点击logo返回首页
    await page.click('.logo');
    
    // 验证返回首页
    await expect(page.url()).toBe('http://localhost:5173/');
    await expect(page.locator('.properties-grid')).toBeVisible();
  });
  
  // 测试页面响应式
  test('should be responsive on mobile viewport', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 访问房源详情页
    await page.goto('http://localhost:5173/property/1');
    
    // 验证移动端布局
    await expect(page.locator('.main-content')).toBeVisible();
    
    // 验证移动端导航菜单按钮存在
    await expect(page.locator('.mobile-menu-btn')).toBeVisible();
    
    // 点击移动端菜单按钮
    await page.click('.mobile-menu-btn');
    
    // 验证移动端菜单展开
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // 再次点击关闭菜单
    await page.click('.mobile-menu-btn');
    
    // 验证移动端菜单收起
    await expect(page.locator('.mobile-menu')).not.toBeVisible();
  });
});
