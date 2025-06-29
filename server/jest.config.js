import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset({
  useESM: true,
}).transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  
  // ESModules サポート
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Transform設定
  transform: {
    ...tsJestTransformCfg,
  },
  
  // モジュール解決
  moduleNameMapper: {
    // .js拡張子を.tsに解決
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // ファイル拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // テストファイルのパターン
  testMatch: [
    '**/__test__/**/*.test.ts',
    '**/*.test.ts'
  ],
  
  // transform除外設定（ESModulesを使うnpmパッケージ用）
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|@google-cloud)/)',
  ],
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // カバレッジ設定
  collectCoverage: true,
  collectCoverageFrom: [
    "./users/userroutes.ts", 
    "./users/usercontrollers.ts", 
    "./users/userservice.ts", 
    "./users/usermodels.ts",
    "./listening-quiz-transactions/services/lquizapiservice.ts",
    // テストファイルは除外
    "!**/*.test.ts",
    "!**/*.d.ts",
  ],
  
  // カバレッジレポート形式
  coverageReporters: ['text', 'lcov', 'html'],
  
  // ts-jest設定
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext',
        target: 'ES2022',
        moduleResolution: 'Node',
      },
    }],
  },
  
  // タイムアウト設定
  testTimeout: 10000,
  
  // 詳細出力
  verbose: true,
  
  // エラー時の詳細表示
  errorOnDeprecated: true,
};
/*import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
/*export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "./users/userroutes.ts", "./users/usercontrollers.ts", "./users/userservice.ts", "./users/usermodels.ts",
    "./listening-quiz-transactions/services/lquizapiservice.ts"
  ]
};*/