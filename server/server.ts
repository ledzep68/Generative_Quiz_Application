import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import { config } from "dotenv"

import session from 'express-session';

import usersRouter from "./users/user.routes.js"
import lQuizRouter from "./listening-quiz-transactions/lquizroutes.js"
import audioRouter from "./audio-delivery/audio.routes.js"

const app = express();
const port = 3000;

//server.tsの絶対パス
const __filename = fileURLToPath(import.meta.url);
//server.tsの親フォルダserverの絶対パス
const __dirname = path.dirname(__filename);

config({path: path.join(__dirname, '.env')});

const isProduction = process.env.NODE_ENV === 'production';

app.use((req, res, next) => {
    console.log('--- リクエスト開始 ---');
    console.log('URL:', req.url);
    console.log('受信Cookie:', req.headers.cookie);
    
    //レスポンス送信時のログ
    res.on('finish', () => {
        console.log('送信Set-Cookie:', res.getHeaders()['set-cookie']);
        console.log('--- リクエスト終了 ---');
    });
    
    next();
});

//セッション管理
app.use(session({
    secret: process.env.SESSION_SECRET as string, //sessionIDに電子署名を付与(HMAC_SHA256) sessionIDと電子署名をセットで授受し、改ざん検知
    resave: false,
    saveUninitialized: false,
    rolling: true,  //アクティブ時に時間延長
    cookie: { 
        maxAge: 1000 * 60 * 30,  //30分でタイムアウト→セッションデータ解放
        httpOnly: true,
        secure: isProduction, //HTTPS時のみ有効化（後で実装）
        sameSite: 'lax' //クロスオリジンなサイトからのリクエスト制限　CSRF対策
    },
    proxy: true,
    name: 'sessionID'
}));

//ミドルウェア設定　CORS設定 Viteの開発サーバーとのコミュニケーション
app.use(cors({
    origin: isProduction ? process.env.FRONTEND_URL : 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
//静的ファイルを配信
const clientPath = path.join(__dirname.replace('/server', ''), 'client/dist');
app.use(express.static(clientPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

app.use('/api/auth', usersRouter);
app.use('/api/lquiz', lQuizRouter);
app.use('/api/audio', audioRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});