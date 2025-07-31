//===========================================================================


//音声取得は、1回のtransaction（問題取得→問題回答→結果閲覧）のサイクルが完了し、次の問題（2問目以降）に移行するタイミングでGETを出す設計とする
//理由はユーザーの途中離脱など考慮し、できるだけ冗長なGETをなくすため

//音声は音声再生ボタンを押したタイミングで再生

//===========================================================================
import {use, useState, useEffect} from "react";
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
import QuizInterruptPopup from "./InterruptPopUp.tsx";

import * as newQuestionSlice from "../newquiz.slice";
import * as uiSlice from "../ui.slice.ts";
import * as audioSlice from "../audio.slice.ts";
import * as indexSlice from "../index-management.slice.ts"
import * as answerSlice from "../answer.slice.ts";

import * as dto from "../dto.ts";
import * as api from "../api.ts";
import * as type from "../types.ts";
import { useAppSelector, useAppDispatch } from "../../../../shared/hooks/redux-hooks.ts";
import { current } from "@reduxjs/toolkit";

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
    const audioBlob = useAppSelector(state => state.audioManagement.audioData) as File;
    //問題番号管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    const { lQuestionIdList, currentQuestionIndex } = indexParams;

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

            const currentLQuestionId = lQuestionIdList[currentQuestionIndex]; //初期状態は0

            //音声合成api呼び出し&音声データをredux storeに保存
            dispatch(audioSlice.setAudioRequest(currentLQuestionId))
            await handleFetchAudio(currentLQuestionId as string);
            dispatch(audioSlice.setRequestStatus('success'));
            dispatch(audioSlice.setIsAudioReadyToPlay(true));

            //Index管理StateにlQuestionIdListと問題indexを保存
            dispatch(indexSlice.setLQuestionIdList(lQuestionIdList));
            dispatch(indexSlice.setCurrentIndex(0));
            
            //回答状態に移行
            if (screenState === 'standby') {
                dispatch(uiSlice.setCurrentScreen('answer'));
            };

            //Redux storeの状態を確認
            console.log("Audio fetch SUCCESS");
            console.log("Audio data in store:", audioBlob);

            dispatch(audioSlice.setIsAudioReadyToPlay(true));
            
            console.log("audio fetch SUCCESS");

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
            console.log("Fetched audio data:", {
                name: audioData.name,
                size: audioData.size,
                type: audioData.type,
                lastModified: audioData.lastModified
            });
            //音声データをredux storeに保存
            dispatch(audioSlice.setAudioData(audioData));
            console.log("Audio data in store:", audioData);
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
                            size="medium"
                            disabled={!sectionNumber || !requestedNumOfLQuizs}
                            sx={{ width: '100%', py: 1 }}
                        />

                        <ButtonComponent 
                            variant="outlined"
                            label="戻る"
                            onClick={handleBack}
                            color="primary"
                            size="medium"
                            sx={{ width: '100%', py: 1 }}
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
    const { currentQuestionIndex=0 } = indexParams;

    //クイズデータselector（現在のindexの問題だけ取得）
    const questionDataList = useAppSelector(state => state.newRandomQuestionRequest.questions) as dto.QuestionResDTO[];
    const currentQuestion = questionDataList[currentQuestionIndex];
    if (!currentQuestion) {
        return <div>クイズデータを読み込み中...</div>; // 早期リターン
    };
    const { lQuestionID/*, sectionNumber, speakerAccent, duration*/ } = currentQuestion;

    //音声データselector
    const audioBlob = useAppSelector(state => state.audioManagement.audioData) as File;
    if (!audioBlob || !questionDataList || questionDataList.length === 0) {
        return <div>音声データを読み込み中...</div>;
    };
    const isAudioReadyToPlay = useAppSelector(state => state.audioManagement.isAudioReadyToPlay);

    //回答リクエスト用selector
    const requestAnswerParamsList = useAppSelector(state => {
        return state.answerManagement.requestParams
    }) as dto.UserAnswerReqDTO[];
    const { userID, reviewTag, userAnswerOption } = requestAnswerParamsList[0];

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [fetchAnswer] = api.useFetchAnswerMutation();

    const handleUserAnswerChange = (answer: string) => {
        dispatch(answerSlice.updateRequestParam({
            index: 0,
            data: { userAnswerOption: answer as 'A'|'B'|'C'|'D' }
        }));
    };

    const handleReviewTagChange = (checked: boolean) => {
        dispatch(answerSlice.updateRequestParam({
            index: 0,
            data: { reviewTag: checked }
        }))
    };

    //デバッグ用
    useEffect(() => {
        console.log('=== 実際の更新後確認 ===');
        console.log('userAnswerOption:', userAnswerOption);
        console.log('disabled状態:', !userAnswerOption);
        console.log('reviewTag:', reviewTag);
    }, [userAnswerOption]);

    //音声再生
    const {load, error, isPlaying} = useAudioPlayer();
    const handleAudioPlay = () => {
        console.log("handleAudioPlay called");
        console.log("isAudioReadyToPlay:", isAudioReadyToPlay);
    
        let audioBlobURL;
              
        try{
            if (error) {
                console.error("Audio player error:", error);
                throw new Error("Audio player error");
            }
                
            if (!isAudioReadyToPlay) {
                throw new Error("音声データが準備されていません");
            };
            //BlobをオブジェクトURLに変換 windowでブラウザのURLを明示的に使用
            const audioBlobURL = window.URL.createObjectURL(audioBlob);  
            console.log("audioBlobURL:", audioBlobURL);
            //音声読み込み
            load(audioBlobURL, {
                html5: true,
                format: 'mp3',
                autoplay: true,
                onend: () => {
                    //再生終了時にURL解放
                    window.URL.revokeObjectURL(audioBlobURL);
                    //redux storeからもクリア（result画面から次問題遷移時にクリア）
                    //dispatch(audioSlice.clearAudioData());
                    console.log("audio play successfully ended");
                }
            });
        } catch (error) {
            //audioBlobURLが作成されている場合のみ解放
            if (audioBlobURL) {
                window.URL.revokeObjectURL(audioBlobURL);
            };
            dispatch(audioSlice.clearAudioData());
            console.log("audio play failed");
        }
    };

    const createTestAudioFile = async (): Promise<File> => {
            const response = await fetch('/audio_segment.mp3');
            const blob = await response.blob();
            
            return new File([blob], 'audio_segment.mp3', {
                type: 'audio/mpeg',
                lastModified: Date.now()
            });
        };
    const dispatchTestAudio = async () => {
        const testBlob = await createTestAudioFile();
        dispatch(audioSlice.setAudioData(testBlob));
    };
    const handleAnswer = async () => {
                //回答内容をAPIに送る
                //回答レスポンスが届いたことを確認
                //stateを結果状態に更新し、結果画面（Result.tsx）に遷移(Navigate)
                //Redux stateからDTOを構築
                try{
                    //await dispatchTestAudio();
                    console.log(lQuestionID, userID, userAnswerOption, reviewTag);
                    if (!lQuestionID || !userID || !userAnswerOption || reviewTag === undefined) {
                        throw new Error("必須パラメータが不足しています");
                    }
                    const answerReqDTO: dto.UserAnswerReqDTO[] = [{
                        lQuestionID: lQuestionID,
                        userID: userID,
                        userAnswerOption: userAnswerOption,
                        reviewTag: reviewTag,
                        answerDate: new Date()
                    }];

                    console.log("=== 回答リクエスト開始 ===: ", answerReqDTO);
                    //回答内容をAPIに送る
                    const answerResult = await fetchAnswer(answerReqDTO);
                    console.log(answerResult);
                    //回答レスポンスをredux storeに保存
                    dispatch(answerSlice.setAnswerData(answerResult.data as dto.UserAnswerResDTO[]));
        
                    //stateを'result'に更新し、結果状態に遷移
                    dispatch(uiSlice.setCurrentScreen('result'));
        
                } catch (error) {
                    console.log("回答処理失敗:", error);
                }
                dispatch(uiSlice.setCurrentScreen('result'));
            };

    //中断ポップアップ
    const [showInterruptPopup, setShowInterruptPopup] = useState(false);

    const handleQuit = () => {
    setShowInterruptPopup(true);
    };

    const handleClosePopup = () => {
    setShowInterruptPopup(false);
    };

    const handleMainMenu = () => {
    setShowInterruptPopup(false);
    navigate('/main-menu');
    };

    const handleLogout = () => {
    setShowInterruptPopup(false);
    //各種リセット処理
    //ログアウト処理
    navigate('/login');
    };

    return (
        //回答画面
        //コンポーネント：回答ボタン(A|B|C|D), 回答するボタン, 後で復習　チェックボックス, やめるボタン
        <Box 
            sx={{ 
                minHeight: 'calc(100vh - 64px)',
                height: 'auto',
                width: '100%',
                overflowY: 'auto',
                backgroundColor: 'pastel.main'
            }}
        >
            <Container maxWidth="md">
                <Box
                    sx={{
                        marginTop: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: '100vh'
                    }}
                >
                    <Paper 
                        elevation={10}
                        sx={{
                            padding: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            maxWidth: 600,
                            gap: 1
                        }}
                    >
                        {/* 問題情報 */}
                        <Box sx={{ textAlign: 'center', mb: 1 }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                第{currentQuestionIndex + 1}問
                            </Typography>
                            {/*<Typography variant="body1" color="text.secondary">
                                セクション {sectionNumber} | {speakerAccent} | 再生時間: {duration}秒
                            </Typography>*/}
                        </Box>

                        {/* 音声再生ボタン */}
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="body1" gutterBottom>
                                音声を再生して問題に答えてください
                            </Typography>
                            <ButtonComponent
                                disabled={isPlaying}
                                variant="contained"
                                label="🔊 音声再生"
                                onClick={handleAudioPlay}
                                color="primary"
                                size="medium"
                                sx={{ minWidth: 200, py: 1, fontSize: '1rem' }}
                            />
                        </Box>

                        {/* 回答選択ボタン */}
                        <AnswerButtonComponent
                            selectedAnswer={userAnswerOption || ''}
                            onAnswerChange={handleUserAnswerChange}
                            sx = {{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, fontSize: '1rem' }}
                        />

                        {/* 復習タグチェックボックス */}
                        <CheckBoxComponent
                            label="後で復習する"
                            checked={reviewTag || false}
                            onChange={handleReviewTagChange}
                            sx={{ fontSize: 'body1' }}
                        />

                        {/* ボタン群 */}
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <ButtonComponent 
                                variant="contained"
                                label="回答する"
                                onClick={handleAnswer}
                                color="primary"
                                size="medium"
                                disabled={!userAnswerOption}
                                sx={{ width: '100%', py: 1, fontSize: '1rem' }}
                            />

                            <ButtonComponent 
                                variant="outlined"
                                label="やめる"
                                onClick={handleQuit}
                                color="primary"
                                size="medium"
                                sx={{ width: '100%', py: 1, fontSize: '1rem' }}
                            />
                            <QuizInterruptPopup
                                open={showInterruptPopup}
                                onClose={handleClosePopup}
                                onMainMenu={handleMainMenu}
                                onLogout={handleLogout}
                            />
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

//結果画面（API呼び出し）
//回答の正誤「正解|不正解」、「解説」、「音声再生ボタン」、「（問題数がnumOfLQuizs未満なら）次の問題に進むボタン|（問題数がnumOfLQuizsと等しいなら）回答結果を見る　ボタン」「後で復習　チェックボックス」「やめるボタン」を表示
//次の問題に進むボタンを押下
//  stateを待機状態に更新し、クイズAPIを送信

//回答結果を見るボタンを押下
//  stateを結果状態に更新し、結果画面（Result.tsx）に遷移(Navigate)

function ResultScreen() {
    //状態'answer'
    const screenState = useAppSelector(state => state.uiManagement.currentScreen);

    //問題番号管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    const { lQuestionIdList, currentQuestionIndex } = indexParams;

    //クイズデータselector（現在のindexの問題だけ取得）
    const requestedNumOfLQuizs = useAppSelector(state => state.newRandomQuestionRequest.requestParams.requestedNumOfLQuizs);
    const questionDataList = useAppSelector(state => state.newRandomQuestionRequest.questions) as dto.QuestionResDTO[];
    const currentQuestion = questionDataList[currentQuestionIndex];
    if (!currentQuestion) {
        return <div>クイズデータを読み込み中...</div>; // 早期リターン
    };
    const { lQuestionID/*, sectionNumber, speakerAccent, speakingRate, duration*/ } = currentQuestion;

    //音声データselector
    const isAudioReadyToPlay = useAppSelector(state => state.audioManagement.isAudioReadyToPlay);
    const audioBlob = useAppSelector(state => state.audioManagement.audioData) as File;
    if (!audioBlob) {
        return <div>音声データを読み込み中...</div>;
    };

    //回答データ取得用selector
    const answerParamList = useAppSelector(state => state.answerManagement.requestParams) as dto.UserAnswerReqDTO[];
    const { userAnswerOption, reviewTag } = answerParamList[0];
    const answerDataList = useAppSelector(state => {
        return state.answerManagement.answerData
    }) as dto.UserAnswerResDTO[];
    const { audioScript, jpnAudioScript, explanation, answerOption, isCorrect } = answerDataList[0];

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {load, error, isPlaying} = useAudioPlayer();

    const [fetchAudio] = api.useLazyFetchAudioQuery();

    // 最終問題かどうかの判定
    const isLastQuestion = currentQuestionIndex + 1 >= requestedNumOfLQuizs;

    // 音声再生（解説用）
    const handleAudioPlay = async () => {
        // 音声データの取得と再生ロジック
        console.log("handleAudioPlay called");
        console.log("isAudioReadyToPlay:", isAudioReadyToPlay);
    
        let audioBlobURL;
              
        try{
            if (error) {
                console.error("Audio player error:", error);
                throw new Error("Audio player error");
            }
                
            if (!isAudioReadyToPlay) {
                throw new Error("音声データが準備されていません");
            };
            //BlobをオブジェクトURLに変換 windowでブラウザのURLを明示的に使用
            const audioBlobURL = window.URL.createObjectURL(audioBlob);  
            console.log("audioBlobURL:", audioBlobURL);
            //音声読み込み
            load(audioBlobURL, {
                html5: true,
                format: 'mp3',
                autoplay: true,
                onend: () => {
                    //再生終了時にURL解放
                    window.URL.revokeObjectURL(audioBlobURL);
                    console.log("audio play successfully ended");
                }
            });
        } catch (error) {
            //audioBlobURLが作成されている場合のみ解放
            if (audioBlobURL) {
                window.URL.revokeObjectURL(audioBlobURL);
            };
            dispatch(audioSlice.clearAudioData());
            console.log("audio play failed");
        }
    };

    // 結果一覧を見る
    const handleViewResults = () => {
        // 結果一覧画面に遷移（別途実装が必要）
        navigate('/quiz-results');
    };

    //復習タグの変更
    const handleReviewTagChange = (checked: boolean) => {
        dispatch(answerSlice.updateRequestParam({
            index: 0,
            data: { reviewTag: checked }
        }))
    };

    // 次の問題に進む
    const handleNextQuestion = async () => {
        const nextIndex = currentQuestionIndex + 1;
        
        if (nextIndex < requestedNumOfLQuizs) {
            // 次の問題の音声データを取得
            const nextLQuestionId = lQuestionIdList[nextIndex];
            
            try {
                /*//現在の音声データをクリア
                dispatch(audioSlice.clearAudioData());
                // 音声データ取得
                const audioData = await fetchAudio(nextLQuestionId).unwrap() as File;
                dispatch(audioSlice.setAudioData(audioData));*/
                
                // インデックス更新
                dispatch(indexSlice.setCurrentIndex(nextIndex as 0|1|2|3|4|5|6|7|8|9));
                
                // answer画面に遷移
                dispatch(uiSlice.setCurrentScreen('answer'));
                
            } catch (error) {
                console.error('次の問題の音声取得に失敗:', error);
            }
        }
    };

    // 中断ポップアップ
    const [showInterruptPopup, setShowInterruptPopup] = useState(false);

    const handleQuit = () => {
        setShowInterruptPopup(true);
    };

    const handleClosePopup = () => {
        setShowInterruptPopup(false);
    };

    const handleMainMenu = () => {
        setShowInterruptPopup(false);
        navigate('/main-menu');
    };

    const handleLogout = () => {
        setShowInterruptPopup(false);
        navigate('/login');
    };

    useEffect(() => {
        console.log("isLastQuestion:", isLastQuestion);
    });

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                width: '100%',
                overflowY: 'auto',
                backgroundColor: 'pastel.main',
                paddingBottom: 2
            }}
        >
            <Container maxWidth="md">
                <Box
                    sx={{
                        marginTop: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Paper 
                        elevation={10}
                        sx={{
                            padding: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            maxWidth: 600,
                            gap: 2
                        }}
                    >
                        {/* 問題情報 */}
                        <Box sx={{ textAlign: 'center', mb: 1 }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                第{currentQuestionIndex + 1}問 結果
                            </Typography>
                        </Box>

                        {/* 正誤結果 */}
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    color: isCorrect ? 'success.main' : 'error.main',
                                    fontWeight: 'bold',
                                    mb: 2
                                }}
                            >
                                {isCorrect ? '✅ 正解' : '❌ 不正解'}
                            </Typography>
                            
                            {/* 回答情報 */}
                            <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                                <Typography variant="body1" gutterBottom>
                                    <strong>あなたの回答:</strong> {userAnswerOption}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>正解:</strong> {answerOption}
                                </Typography>
                            </Box>
                        </Box>

                        {/* 解説 */}
                        {explanation && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    解説
                                </Typography>
                                <Typography variant="body1" sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
                                    {explanation}
                                </Typography>
                            </Box>
                        )}

                        {/* 音声再生ボタン */}
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="body1" gutterBottom>
                                もう一度音声を聞く
                            </Typography>
                            <ButtonComponent
                                variant="outlined"
                                label="🔊 音声再生"
                                onClick={handleAudioPlay}
                                color="primary"
                                size="medium"
                                sx={{ minWidth: 200, py: 1 }}
                            />
                        </Box>

                        {/* 復習タグチェックボックス */}
                        <CheckBoxComponent
                            label="後で復習する"
                            checked={reviewTag || false}
                            onChange={handleReviewTagChange}
                        />

                        {/* ボタン群 */}
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {!isLastQuestion ? (
                                <ButtonComponent 
                                    variant="contained"
                                    label="次の問題に進む"
                                    onClick={handleNextQuestion}
                                    color="primary"
                                    size="medium"
                                    sx={{ width: '100%', py: 1 }}
                                />
                            ) : (
                                <ButtonComponent 
                                    variant="contained"
                                    label="回答結果を見る"
                                    onClick={handleViewResults}
                                    color="primary"
                                    size="medium"
                                    sx={{ width: '100%', py: 1 }}
                                />
                            )}

                            <ButtonComponent 
                                variant="outlined"
                                label="やめる"
                                onClick={handleQuit}
                                color="primary"
                                size="medium"
                                sx={{ width: '100%', py: 1 }}
                            />
                        </Box>

                        {/* 中断ポップアップ */}
                        <QuizInterruptPopup
                            open={showInterruptPopup}
                            onClose={handleClosePopup}
                            onMainMenu={handleMainMenu}
                            onLogout={handleLogout}
                        />
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default ListeningQuizPage;
