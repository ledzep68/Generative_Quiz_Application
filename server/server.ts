import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import usersRouter from "./users/userroutes.ts"
import lQuizRouter from "./listening-quiz-transactions/lquizroutes.ts"
import audioRouter from "./audio-delivery/audio.routes.ts"

const app = express();
const port = 3000;

//server.tsの絶対パス
const __filename = fileURLToPath(import.meta.url);
//server.tsの親フォルダserverの絶対パス
const __dirname = path.dirname(__filename);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

//CORS設定 Viteの開発サーバーとのコミュニケーション
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
//静的ファイルを配信
app.use(
    express.static(
        path.join(__dirname.replace('/server', ''), 'client/dist')
    )
);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname.replace('/server', ''), 'client/index.html'))
});
app.use(express.json());
app.use('/users', usersRouter);
app.use('/lquiz', lQuizRouter);
app.use('/audio', audioRouter);