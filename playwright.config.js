// playwright.config.js
export default {
  // 使用 Chrome 浏览器进行测试
  use: {
    browserName: 'chromium',
    headless: true, // 无头模式运行
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    // 截图和录屏设置
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  // 测试文件匹配模式
  testMatch: 'tests/**/*.spec.js',
  // 测试超时设置
  timeout: 30000,
  // 重试设置
  retries: 0,
  // 报告设置
  reporter: [['html', { outputFolder: 'playwright-report' }]]
};
