/** @type {import("jest").Config} **/
export default {
    preset: 'ts-jest/presets/default-esm',  // ESMプリセットを使用
    testEnvironment: "node",
    
    // ESModules サポート
    extensionsToTreatAsEsm: ['.ts'],
    
    // Transform設定（ESM有効化）
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,  // ESMを有効化
            tsconfig: {
                module: 'Node16',  
                target: 'ES2022',
                moduleResolution: 'Node16',
            },
        }],
    },
    
    // モジュール解決
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    
    // ファイル拡張子
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    
    // テストファイルのパターン
    testMatch: [
        '**/__test__/**/*.test.ts',
        '**/*.test.ts'
    ],
    
    // ESMモジュールの変換を許可
    transformIgnorePatterns: [
        'node_modules/(?!(@fetch-mock|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)'
    ],
    
    // セットアップファイル
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    
    // その他の設定
    collectCoverage: true,
    collectCoverageFrom: [
        "./users/userroutes.ts", 
        "./users/usercontrollers.ts", 
        "./users/userservice.ts", 
        "./users/usermodels.ts",
        "./listening-quiz-transactions/services/lquizapiservice.ts",
        "!**/*.test.ts",
        "!**/*.d.ts",
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 10000,
    verbose: true,
    errorOnDeprecated: true,
};