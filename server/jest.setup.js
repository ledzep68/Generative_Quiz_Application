import fetchMock from '@fetch-mock/jest';

// グローバルにfetchMockを設定
fetchMock.mockGlobal();

// テスト環境でのfetch設定
global.fetch = fetchMock;