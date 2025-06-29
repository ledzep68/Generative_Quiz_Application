// jest.setup.js
// テスト実行前の共通設定

// Node.js環境変数の設定
process.env.NODE_ENV = 'test';

// 環境変数のデフォルト値
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/test/path/credentials.json';
process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project-id';

// タイムゾーン設定（必要に応じて）
process.env.TZ = 'UTC';

// コンソール出力の制御（テスト実行時のノイズを減らす場合）
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// 特定のエラー/警告を抑制（必要に応じてカスタマイズ）
console.error = (...args) => {
  // 特定の警告を抑制
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ExperimentalWarning')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  // 特定の警告を抑制
  if (args[0] && typeof args[0] === 'string' && args[0].includes('deprecated')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// グローバルなテスト設定
global.testConfig = {
  timeout: 5000,
  retries: 1,
};

// fetch polyfill（Node.js 18未満の場合）
if (!global.fetch) {
  global.fetch = require('node-fetch');
}