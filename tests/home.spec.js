// tests/home.spec.js
import { test, expect } from '@playwright/test';

// 首页测试
test.describe('Home Page Tests', () => {
  // 测试首页加载
  test('should load home page correctly', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/民宿之家/);
    
    // 验证导航栏存在
    await expect(page.locator('.navbar')).toBeVisible();
    
    // 验证搜索框存在
    await expect(page.locator('.search-input')).toBeVisible();
    
    // 验证房源列表存在
    await expect(page.locator('.properties-grid')).toBeVisible();
    
    // 验证至少有一个房源卡片
    const propertyCards = page.locator('.property-card');
    await expect(propertyCards).toHaveCount(expect.above(0));
  });
  
  // 测试搜索功能
  test('should search properties correctly', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');
    
    // 输入搜索关键词
    await page.fill('.search-input', '北京');
    
    // 点击搜索按钮
    await page.click('.search-btn');
    
    // 验证搜索结果包含相关房源
    const propertyCards = page.locator('.property-card');
    await expect(propertyCards).toHaveCount(expect.above(0));
    
    // 验证房源卡片包含搜索关键词
    const firstCard = propertyCards.first();
    await expect(firstCard.locator('.location')).toContainText('北京');
  });
  
  // 测试房源卡片点击
  test('should navigate to property detail page when clicking on a card', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');
    
    // 点击第一个房源卡片
    const firstCard = page.locator('.property-card').first();
    await firstCard.click();
    
    // 验证导航到详情页
    await expect(page.url()).toMatch(/\/property\/\d+/);
    
    // 验证详情页包含房源信息
    await expect(page.locator('.property-detail')).toBeVisible();
    await expect(page.locator('.title')).toBeVisible();
    await expect(page.locator('.price')).toBeVisible();
  });
  
  // 测试排序功能
  test('should sort properties correctly', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');
    
    // 选择价格从低到高排序
    await page.selectOption('.sort-select', 'price-low');
    
    // 获取排序后的价格
    const priceElements = page.locator('.price-value');
    const prices = await priceElements.allTextContents();
    
    // 验证价格从低到高排序
    const numericPrices = prices.map(price => parseFloat(price.replace(/[^\d.]/g, '')));
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeLessThanOrEqual(numericPrices[i + 1]);
    }
  });
});
