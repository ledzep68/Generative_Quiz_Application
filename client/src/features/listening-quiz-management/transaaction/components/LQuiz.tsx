import {useState} from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Paper, SelectChangeEvent } from "@mui/material";
import { Settings } from "@mui/icons-material";
import ButtonComponent from "../../../../shared/components/Button";
import InputFormComponent from "../../../../shared/components/InputForm";
import DropdownComponent from "../../../../shared/components/Dropdown";

const state = ["standBy", "answer", "result"];

type SectionNumTypes = 1|2|3|4;
type NumOfLQuizesTypes = 1|2|3|4|5|6|7|8|9|10;
type SpeakerAccentTypes = "American" | "British" | "Canadian" | "Australian";
//待機画面
//問題数、パート番号、アクセント入力
// ボタン押下
//     reducer呼び出し、stateを待機状態に更新
//     クイズ生成API呼び出し
//         APIからクイズデータを受け取り
//         audioURLをもとにAPIに音声データをリクエスト（問題1問ごとにリクエスト）
//         音声データレスポンスが届いたことを確認したらstateを回答状態に更新し、回答画面に遷移
function standByScreen() {
    const [state, setState] = useState('standBy');

    const [sectionNum, setSectionNum] = useState<SectionNumTypes>();
    //10以下
    const [numOfLQuizs, setNumOfLQuizes] = useState<NumOfLQuizesTypes>();

    const [speakerAccent, setSpeakerAccent] = useState<SpeakerAccentTypes>();

    const handleSectionChange = (event: SelectChangeEvent<unknown>) => {
        setSectionNum(event.target.value as SectionNumTypes);
    };

    const handleNumOfLQuizesChange = (event: SelectChangeEvent<unknown>) => {
        setNumOfLQuizes(event.target.value as NumOfLQuizesTypes);
    };

    const handleSpeakerAccentChange = (event: SelectChangeEvent<unknown>) => {
        setSpeakerAccent(event.target.value as SpeakerAccentTypes);
    };

    const handleQuizInit = () => {
        //API呼び出し
        
    };
    const handleBack = () => {
        
    }
    return (
    <Box 
        sx={{ 
            minHeight: '100vh',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            overflowY: 'auto',
            backgroundColor: 'pastel.main'
        }}
    >
        <Container maxWidth="md">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <Paper 
                    elevation={10}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxWidth: 600,
                        gap: 3
                    }}
                >
                    {/* ドロップダウンメニュー */}
                    <DropdownComponent 
                        type="sectionNum"
                        value={sectionNum}
                        onChange={handleSectionChange}
                        helperText="選択してください"
                    />

                    <DropdownComponent 
                        type="numOfLQuizs"
                        value={numOfLQuizs}
                        onChange={handleNumOfLQuizesChange}
                        helperText="選択してください"
                    />

                    <DropdownComponent 
                        type="speakerAccent"
                        value={speakerAccent}
                        onChange={handleSpeakerAccentChange}
                    />

                    {/* ボタン群 */}
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <ButtonComponent 
                            variant="contained"
                            label="問題を開始する"
                            onClick={handleQuizInit}
                            color="primary"
                            size="large"
                            disabled={!sectionNum || !numOfLQuizs}
                            sx={{ width: '100%', py: 1.5 }}
                        />

                        <ButtonComponent 
                            variant="outlined"
                            label="戻る"
                            onClick={handleBack}
                            color="primary"
                            size="large"
                            sx={{ width: '100%', py: 1.5 }}
                        />
                    </Box>
                </Paper>
            </Box>
        </Container>
    </Box>
);
}

//回答画面（APIが返した音声データを再生 stateを回答状態に更新）
//「第○問」「チェックボックス A|B|C|D（TOEIC パート2のみA|B|C）」「回答するボタン」「後で復習　チェックボックス」「やめるボタン」を表示
//問題音声を再生
//ユーザーがチェックボックスに1つだけチェックを入れる
//「回答するボタン」を押下
//  回答内容をAPIに送る
//  回答レスポンスが届いたことを確認したらstateを結果状態に更新
function answerScreen() {

}

//結果画面（API呼び出し）
//回答の正誤「正解|不正解」、「解説」、「（問題数がnumOfLQuizs未満なら）次の問題に進むボタン|（問題数がnumOfLQuizsと等しいなら）回答結果を見る　ボタン」「後で復習　チェックボックス」「やめるボタン」を表示
//次の問題に進むボタンを押下
//  stateを待機状態に更新し、クイズAPIを送信

//回答結果を見るボタンを押下
//  stateを結果状態に更新し、結果画面（Result.tsx）に遷移(Navigate)

function resultScreen() {

}

export default standByScreen
