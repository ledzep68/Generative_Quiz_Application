import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import UsersRouter from "./users/userroutes.js"

const app = express();
const port = 3000;

//server.tsの絶対パス
const __filename = fileURLToPath(import.meta.url);
//server.tsの親フォルダserverの絶対パス
const __dirname = path.dirname(__filename);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

//静的ファイルを配信
app.use(
    express.static(
        path.join(__dirname.replace('/server', ''), 'client/dist')
    )
);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname.replace('/server', ''), 'client/dist/index.html'))
});
app.use(express.json());
app.use('/users', UsersRouter);