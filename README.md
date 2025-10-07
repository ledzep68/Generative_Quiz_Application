# Generative_Quiz_Application

## 概要
英語のリスニング問題をAIに問題文・音声生成を行わせ、4択形式で出題。  
ユーザーが回答し、正誤判定を行う。

## 技術アーキテクチャ

**バックエンド**
- Node.js, TypeScript

**フロントエンド**
- React, TypeScript, Redux

**ビルドツール**  
- バックエンド: ts-node, nodemon, tsx
- フロントエンド: vite

**テスト**  
- vitest

**外部API**  
- 問題生成: OpenAI API (GPT-4o)  
- 音声合成: Google Cloud Text-to-Speech  

## ドキュメント
整備中

## 参考資料

### 生成AIにTOEIC®リスニング問題を無限に生成してもらい、スコア900超え達成した話
[https://qiita.com/readiness_/items/3a03e525344aca6d58c2](https://qiita.com/readiness_/items/3a03e525344aca6d58c2)

### バックエンド
- **Node.js Best Practices**  
  [https://github.com/goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)

- **Best Practices for Data Transfer Objects (DTOs)**  
  [https://medium.com/@samuelcatalano/best-practices-for-data-transfer-objects-dtos-d5007e3f2729](https://medium.com/@samuelcatalano/best-practices-for-data-transfer-objects-dtos-d5007e3f2729)
