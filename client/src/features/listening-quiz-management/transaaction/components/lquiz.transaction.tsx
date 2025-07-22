//======


//音声取得は、1回のtransaction（問題取得→問題回答→結果閲覧）のサイクルが完了し、次の問題（2問目以降）に移行するタイミングでGETを出す設計とする
//理由はユーザーの途中離脱など考慮し、できるだけ冗長なGETをなくすため
//======

import {use, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {useAudioPlayer} from "react-use-audio-player";
import {URL} from "url";

import { Container, Box, Typography, Paper, SelectChangeEvent } from "@mui/material";
import { Settings } from "@mui/icons-material";

//共通コンポーネント
import ButtonComponent from "../../../../shared/components/Button";
import InputFormComponent from "../../../../shared/components/InputForm";
import DropdownComponent from "../../../../shared/components/Dropdown";
import MainMenu from "../../../main-menu/components/MainMenu";
import CheckBoxComponent from "../../../../shared/components/CheckBox";
import AnswerButtonComponent from "./AnswerButton.tsx";

import * as newQuestionSlice from "../newquiz.slice";
import * as uiSlice from "../ui.slice.ts";
import * as audioSlice from "../audio.slice.ts";
import * as indexSlice from "../index-management.slice.ts"
import * as answerSlice from "../answer.slice.ts";

import * as dto from "../dto.ts";
import * as api from "../api.ts";
import * as type from "../types.ts";
import { useAppSelector, useAppDispatch } from "../../../../shared/hooks/redux-hooks.ts";

function ListeningQuizPage() {
    const currentScreen = useAppSelector(state => state.uiManagement.currentScreen);
    
    return (
        <div>
            {currentScreen === 'standby' && <StandByScreen />}
            {currentScreen === 'answer' && <AnswerScreen />}
            {currentScreen === 'result' && <ResultScreen />}
        </div>
    );
};

//待機画面
//問題数、パート番号、アクセント入力
// ボタン押下
//     reducer呼び出し、stateを待機状態に更新
//     クイズ生成API呼び出し
//         APIからクイズデータを受け取り
//         audioURLをもとにAPIに音声データをリクエスト（問題1問ごとにリクエスト）
//         音声データレスポンスが届いたことを確認したらstateを回答状態に更新し、回答画面に遷移
function StandByScreen() {
    //状態遷移　初期状態はstandby
    const screenState = useAppSelector(state => state.uiManagement.currentScreen);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [fetchNewQuestions] = api.useFetchNewQuestionsMutation();
    const [fetchAudio] = api.useLazyFetchAudioQuery();
    
    //クイズリクエスト用selector
    const requestQuestionParams = useAppSelector(state => state.newRandomQuestionRequest.requestParams);
    const { sectionNumber, requestedNumOfLQuizs, speakingRate, speakerAccent } = requestQuestionParams;
    //音声リクエスト用selector
    const requestAudioParams = useAppSelector(state => state.audioManagement.requestParams);
    const { currentLQuestionId } = requestAudioParams;
    //問題番号管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    const { lQuestionIdList } = indexParams;

    const handleSectionChange = (event: SelectChangeEvent<unknown>) => {
        dispatch(newQuestionSlice.setRequestParams({
            sectionNumber: event.target.value as 1|2|3|4
        }));
    };

    const handleNumOfLQuizesChange = (event: SelectChangeEvent<unknown>) => {
        dispatch(newQuestionSlice.setRequestParams({
            requestedNumOfLQuizs: event.target.value as 1|2|3|4|5|6|7|8|9|10
        }));
    };

    const handleSpeakerAccentChange = (event: SelectChangeEvent<unknown>) => {
        /*dispatch(setRequestParams({
            speakerAccent: event.target.value as undefined | "American" | "British" | "Canadian" | "Australian"
        }));*/
    };

    const handleQuizInit = async (event: React.MouseEvent): Promise<void> => {
        dispatch(newQuestionSlice.setRequestStatus('pending'));
        //Redux stateからDTOを構築
        const randomNewQuestionReqDTO: dto.RandomNewQuestionReqDTO = {
            sectionNumber,
            requestedNumOfLQuizs,
            speakingRate
        };
        //hooksに渡す
        try {
            //クイズ生成api呼び出し
            const questionFetchResult = await fetchNewQuestions(randomNewQuestionReqDTO).unwrap();
            dispatch(newQuestionSlice.setRequestStatus('success'));
            const lQuestionIdList: string[] = questionFetchResult.map(question => question.lQuestionID)
            //クイズデータをredux storeに保存
            dispatch(newQuestionSlice.setQuestions(questionFetchResult));

            const currentLQuestionId = lQuestionIdList[0]

            //音声合成api呼び出し&音声データをredux storeに保存
            dispatch(audioSlice.setAudioRequest(currentLQuestionId))
            await handleFetchAudio(currentLQuestionId as string);
            dispatch(audioSlice.setRequestStatus('success'));

            //Index管理StateにlQuestionIdListと問題indexを保存
            dispatch(indexSlice.setLQuestionIdList(lQuestionIdList));
            dispatch(indexSlice.setCurrentIndex(0));
            
            //回答状態に移行
            if (screenState === 'standby') {
                dispatch(uiSlice.setCurrentScreen('answer'));
            };

        } catch (error) {
            //クイズリクエスト失敗の場合の処理
            dispatch(newQuestionSlice.setRequestStatus('failed'));
            //失敗後の処理？

            //else 音声リクエスト失敗処理
        }
    };
    const handleFetchAudio = async (lQuestionId: string) => {
        try {
            //Node.js BlobをブラウザBlob（File（ブラウザBlobを継承したクラス））に変換（URL生成のため必須）
            const audioData = await fetchAudio(lQuestionId).unwrap() as File;
            //音声データをredux storeに保存
            dispatch(audioSlice.setAudioData(audioData));
        } catch (error) {
            //エラー処理
            dispatch(audioSlice.setAudioError('音声データの取得に失敗しました'));
        }
    };

    /* //lQuestionID[]のうち1問目の音声データ取得
            dispatch(audioSlice.setAudioRequest(questionFetchResult.map.))
            const lQuestionId = requestAudioParams.lQuestionId
            const audioFetchResult = await fetchAudio(lQuestionId).unwrap();
            //音声データをRedux storeに保存
            dispatch(audioSlice.setAudioData(audioFetchResult))
            //answer状態（answerScreen()）に遷移
            setCurrentView('answer');*/

    const handleBack = () => {
        dispatch(newQuestionSlice.resetRequest());
        navigate('/main-menu')
    };
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
                        value={sectionNumber}
                        onChange={handleSectionChange}
                        helperText="選択してください"
                    />

                    <DropdownComponent 
                        type="numOfLQuizs"
                        value={requestedNumOfLQuizs}
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
                            disabled={!sectionNumber || !requestedNumOfLQuizs}
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

function AnswerScreen() {
    //状態'answer'
    const screenState = useAppSelector(state => state.uiManagement.currentScreen);

    //問題番号管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    const { currentQuestionIndex } = indexParams;

    //クイズデータselector（現在のindexの問題だけ取得）
    const questionDataList = useAppSelector(state => state.newRandomQuestionRequest.questions) as dto.QuestionResDTO[];
    const { lQuestionID, audioScript, jpnAudioScript, answerOption, sectionNumber, explanation, speakerAccent, speakingRate, duration } = questionDataList[currentQuestionIndex];

    //音声データselector
    const audioBlob = useAppSelector(state => state.audioManagement.audioData) as File;

    //回答リクエスト用selector
    const requestAnswerParams = useAppSelector(state => state.answerManagement.requestParams);
    const { /*lQuestionID,*/ userID, userAnswerOption, answerDate, reviewTag } = requestAnswerParams;

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {load, play} = useAudioPlayer();
    const [fetchAnswer] = api.useFetchAnswerMutation();

    const handleUserAnswerChange = (answer: string) => {
        dispatch(answerSlice.setRequestParams({
            userAnswerOption: answer as 'A' | 'B' | 'C' | 'D'
        }));
    };

    const handleReviewTagChange = (checked: boolean) => {
        dispatch(answerSlice.setRequestParams({
            reviewTag: checked
        }));
    };

    //音声再生
    const handleAudioPlay = async () => {
        //BlobをオブジェクトURLに変換 windowでブラウザのURLを明示的に使用
        const audioBlobURL = window.URL.createObjectURL(audioBlob);

        //音声読み込み
        await new Promise((resolve, reject) => {
            load(audioBlobURL, {
                html5: true,
                format: 'mp3',
                autoplay: false,
                onend: () => {
                    //再生終了時にURL解放
                    window.URL.revokeObjectURL(audioBlobURL);
                    //redux storeからもクリア
                    dispatch(audioSlice.clearAudioData());
                }
            });
        });

        try{
            //再生
            await play();
        } catch (error) {
            //（後で実装）エラーボタン「自動再生に失敗しました」
            window.URL.revokeObjectURL(audioBlobURL);
            dispatch(audioSlice.clearAudioData());
            console.log("音声再生に失敗しました");
        }
    };

    const handleAnswer = async () => {
        //回答内容をAPIに送る
        //回答レスポンスが届いたことを確認
        //stateを結果状態に更新し、結果画面（Result.tsx）に遷移(Navigate)
        //Redux stateからDTOを構築
        const answerReqDTO: dto.AnswerReqDTO = {
            lQuestionID,
            userID,
            userAnswerOption,
            answerDate,
            reviewTag
        };
        try{
            //回答内容をAPIに送る
            const answerResult = await fetchAnswer(answerReqDTO);
            //回答レスポンスをredux storeに保存
            dispatch(answerSlice.setAnswerData(answerResult.data as dto.AnswerResDTO));

            //stateを'result'に更新し、結果状態に遷移
            dispatch(uiSlice.setCurrentScreen('result'));

        } catch (error) {
            console.log(error);
        }
    };

    const handleBack = () => {
        navigate('/');
    };
    return (
        //回答画面
        //コンポーネント：回答ボタン(A|B|C|D), 回答するボタン, 後で復習　チェックボックス, やめるボタン
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
                        {/* 問題情報 */}
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                第{currentQuestionIndex + 1}問
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                セクション {sectionNumber} | {speakerAccent} | 再生時間: {duration}秒
                            </Typography>
                        </Box>

                        {/* 音声再生ボタン */}
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                音声を再生して問題に答えてください
                            </Typography>
                            <ButtonComponent
                                variant="contained"
                                label="🔊 音声再生"
                                onClick={handleAudioPlay}
                                color="primary"
                                size="large"
                                sx={{ minWidth: 200, py: 1.5 }}
                            />
                        </Box>

                        {/* 回答選択ボタン */}
                        <AnswerButtonComponent
                            selectedAnswer={userAnswerOption || ''}
                            onAnswerChange={handleUserAnswerChange}
                        />

                        {/* 復習タグチェックボックス */}
                        <CheckBoxComponent
                            label="後で復習する"
                            checked={reviewTag || false}
                            onChange={handleReviewTagChange}
                            helperText="復習が必要な問題にチェックしてください"
                        />

                        {/* ボタン群 */}
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <ButtonComponent 
                                variant="contained"
                                label="回答する"
                                onClick={handleAnswer}
                                color="primary"
                                size="large"
                                disabled={!userAnswerOption}
                                sx={{ width: '100%', py: 1.5 }}
                            />

                            <ButtonComponent 
                                variant="outlined"
                                label="やめる"
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
};

//結果画面（API呼び出し）
//回答の正誤「正解|不正解」、「解説」、「（問題数がnumOfLQuizs未満なら）次の問題に進むボタン|（問題数がnumOfLQuizsと等しいなら）回答結果を見る　ボタン」「後で復習　チェックボックス」「やめるボタン」を表示
//次の問題に進むボタンを押下
//  stateを待機状態に更新し、クイズAPIを送信

//回答結果を見るボタンを押下
//  stateを結果状態に更新し、結果画面（Result.tsx）に遷移(Navigate)

function ResultScreen() {
    return (

    )
};

export default ListeningQuizPage;
