//===========================================================================


//音声取得は、1回のtransaction（問題取得→問題回答→結果閲覧）のサイクルが完了し、次の問題（2問目以降）に移行するタイミングでGETを出す設計とする
//理由はユーザーの途中離脱など考慮し、できるだけ冗長なGETをなくすため

//音声は音声再生ボタンを押したタイミングで再生

//===========================================================================
import {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {useAudioPlayer} from "react-use-audio-player";
import {URL} from "url";

import { Container, Box, Typography, Paper, SelectChangeEvent, Tab, Tabs, Grid } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { palette } from '@mui/system';

//共通コンポーネント
import ButtonComponent from "../../../../shared/components/Button";
import InputFormComponent from "../../../../shared/components/InputForm";
import DropdownComponent from "../../../../shared/components/Dropdown";
import MainMenu from "../../../main-menu/components/MainMenu";
import CheckBoxComponent from "../../../../shared/components/CheckBox";
import AnswerButtonComponent from "./AnswerButton.tsx";
import QuizInterruptPopup from "./InterruptPopUp.tsx";
import RadioButtonComponent from "../../../../shared/components/RadioButton";
import LoadingModalComponent from "../../../../shared/components/LoadingModal.tsx";
import TabPanelComponent from "../../../../shared/components/TabPanel.tsx";
import ErrorPopupComponent from "../../../../shared/components/ErrorPopUp.tsx";

import * as newQuestionSlice from "../newquestion.slice.ts";
import * as uiSlice from "../ui.slice.ts";
import * as audioSlice from "../audio.slice.ts";
import * as indexSlice from "../index-management.slice.ts"
import * as answerSlice from "../answer.slice.ts";
import * as resultSlice from "../result.slice.ts"
import * as finalResultSlice from "../final-result.slice.ts"

import * as loginSlice from "../../../user-management/login/login.slice.ts";

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
            {currentScreen === 'finalResult' && <FinalResultScreen />}
            
        </div>
    );
};

/*
//待機画面
//問題数、パート番号、アクセント入力
// ボタン押下
//     reducer呼び出し、stateを待機状態に更新
//     クイズ生成API呼び出し 初回リクエストのみ下記形式
            export interface RandomNewQuestionReqDTO {
                sectionNumber: 1|2|3|4,
                requestedNumOfLQuizs: number,
                speakerAccent?: 'American' | 'British' | 'Canadian' | 'Australian',
                speakingRate: number //必須　デフォルト値1.0
            };
            2回目以降はcurrentIndexのみ
//         APIからクイズデータを受け取り
//         audioURLをもとにAPIに音声データをリクエスト（問題1問ごとにリクエスト）
//         音声データレスポンスが届いたことを確認したらstateを回答状態に更新し、回答画面に遷移
*/
function StandByScreen() {

    //状態遷移　初期状態はstandby
    const {currentScreen, isLoading} = useAppSelector(state => state.uiManagement);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    //API
    const [initiateSession] = api.useInitiateSessionMutation();
    const [resetQuizSession] = api.useResetQuizSessionMutation();
    const [resetUserAndQuizSession] = api.useResetUserAndQuizSessionMutation();

    const [fetchPart2NewQuestion] = api.useFetchPart2NewQuestionMutation();
    const [fetchPart34NewQuestion] = api.useFetchPart34NewQuestionMutation();
    const [fetchAudio] = api.useLazyFetchAudioQuery();
    
    //クイズリクエスト用selector
    const requestQuestionParams = useAppSelector(state => state.newRandomQuestionRequest.requestParams);
    const { sectionNumber, requestedNumOfLQuizs, speakingRate, speakerAccent } = requestQuestionParams;
    //音声リクエスト用selector
    const requestAudioParams = useAppSelector(state => state.audioManagement.requestParams);
    //const { questionHash } = requestAudioParams;
    const audioObjectURL = useAppSelector(state => state.audioManagement.audioObjectURL);
    //index管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    const { currentIndex } = indexParams;

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

    const fetchQuizHandler = async (event: React.MouseEvent) => {
        switch(sectionNumber) {
            case 2: 
                await handlePart2QuizInit();
                break;
            case 3:
            case 4:
                await handlePart34QuizInit();
                break;
            default:
                console.error('Invalid section number');
        }
    };

    const handlePart2QuizInit = async (): Promise<void> => {
        dispatch(newQuestionSlice.setRequestStatus('pending'));
        //Redux stateからDTOを構築
        const randomNewQuestionReqDTO: dto.RandomNewQuestionReqDTO = {
            sectionNumber: sectionNumber,
            requestedNumOfLQuizs: requestedNumOfLQuizs,
            speakingRate: speakingRate,
            speakerAccent: speakerAccent
        };
        //hooksに渡す
        try {
            //ローディング表示開始
            dispatch(uiSlice.setIsLoading(true));

            /*
            クイズ・音声生成セッション開始
            */
            //クイズセッション開始
            await initiateSession(randomNewQuestionReqDTO);
            console.log("session initialized successfully")

            //クイズ生成api呼び出し
            const fetchResult = await fetchPart2NewQuestion({currentIndex}).unwrap();
            console.log("fetchResult: ", fetchResult)
            const questionHash = fetchResult.questionHash
            dispatch(newQuestionSlice.setRequestStatus('success'));

            //クイズhash値をredux storeに保存
            dispatch(newQuestionSlice.setQuestionHash(questionHash));

            //音声合成api呼び出し&音声データをredux storeに保存
            dispatch(audioSlice.setAudioRequest(questionHash))
            await handleFetchAudio(questionHash as string);
            dispatch(audioSlice.setIsAudioReadyToPlay(true));
            console.log("Audio fetch SUCCESS");
            /*
            クイズ・音声生成セッション終了
            */

            //回答状態に移行
            if (currentScreen === 'standby') {
                dispatch(uiSlice.setCurrentScreen('answer'));
            };

        } catch (error) {
            dispatch(newQuestionSlice.setRequestStatus('failed'));
            //各stateをリセット　audioSliceはhandleFetchAudio内でreset
            dispatch(newQuestionSlice.resetRequestState());
            dispatch(audioSlice.resetAudioState());
            dispatch(indexSlice.resetIndexState());
            //クイズセッション初期化
            await resetQuizSession();
            //ローディング表示終了
            dispatch(uiSlice.setIsLoading(false));
        }
    };

    const handlePart34QuizInit = async (): Promise<void> => {
        dispatch(newQuestionSlice.setRequestStatus('pending'));
        //Redux stateからDTOを構築
        const randomNewQuestionReqDTO: dto.RandomNewQuestionReqDTO = {
            sectionNumber: sectionNumber,
            requestedNumOfLQuizs: requestedNumOfLQuizs,
            speakingRate: speakingRate,
            speakerAccent: speakerAccent
        };
        //hooksに渡す
        try {
            //ローディング表示開始
            dispatch(uiSlice.setIsLoading(true));

            /*
            クイズ・音声生成セッション開始
            */
            //クイズセッション開始
            await initiateSession(randomNewQuestionReqDTO);
            console.log("session initialized successfully")

            //クイズ生成api呼び出し
            const fetchResult = await fetchPart34NewQuestion({currentIndex}).unwrap();
            console.log("fetchResult: ", fetchResult)
            const questionHash = fetchResult.questionHash
            //クイズリクエスト成功
            dispatch(newQuestionSlice.setRequestStatus('success'));

            //クイズhash値をredux storeに保存
            dispatch(newQuestionSlice.setQuestionHash(questionHash));

            //音声合成api呼び出し&音声データをredux storeに保存
            dispatch(audioSlice.setAudioRequest(questionHash))
            await handleFetchAudio(questionHash as string);
            dispatch(audioSlice.setIsAudioReadyToPlay(true));
            console.log("Audio fetch SUCCESS");

            /*
            クイズ・音声生成セッション終了
            */

            //ローディング表示終了
            dispatch(uiSlice.setIsLoading(false));

            //回答状態に移行
            if (currentScreen === 'standby') {
                dispatch(uiSlice.setCurrentScreen('answer'));
            };

        } catch (error) {
            dispatch(newQuestionSlice.setRequestStatus('failed'));
            //各stateをリセット　audioSliceはhandleFetchAudio内でreset
            dispatch(newQuestionSlice.resetRequestState());
            dispatch(audioSlice.resetAudioState());
            dispatch(indexSlice.resetIndexState());
            //クイズセッション初期化
            await resetQuizSession();
            //ローディング表示終了
            dispatch(uiSlice.setIsLoading(false));
        }
    };
    //2問目以降のクイズ生成
    const handleNextQuestionFetch = async (): Promise<void> => {
        dispatch(newQuestionSlice.setRequestStatus('pending'));
        
        if(currentIndex < 1 || currentIndex > 9) {
            throw new Error('currentIndex is out of range');
        }
        
        try {

            //sectionNumberでAPI呼び出し先分岐
            let fetchResult;
            switch(sectionNumber) {
                case 2:
                    fetchResult = await fetchPart2NewQuestion({currentIndex}).unwrap();
                    break;
                case 3:
                case 4:
                    fetchResult = await fetchPart34NewQuestion({currentIndex}).unwrap();
                    break;
                default:
                    throw new Error('Invalid section number');
            }

            const questionHash = fetchResult.questionHash;
            
            dispatch(newQuestionSlice.setRequestStatus('success'));
            dispatch(newQuestionSlice.setQuestionHash(questionHash));
            dispatch(audioSlice.setAudioRequest(questionHash));
            
            await handleFetchAudio(questionHash);
            dispatch(audioSlice.setIsAudioReadyToPlay(true));

            //自動的にanswer画面に遷移
            dispatch(uiSlice.setCurrentScreen('answer'));
            
        } catch (error) {
            dispatch(newQuestionSlice.setRequestStatus('failed'));
            dispatch(newQuestionSlice.resetRequestState());
            dispatch(audioSlice.resetAudioState());
            dispatch(indexSlice.resetIndexState());
            await resetQuizSession();
            
            // ErrorPopup表示（将来実装）
            //handleQuizInitError(error);
        }
    };

    const handleFetchAudio = async (questionHash: string) => {
        dispatch(audioSlice.setRequestStatus('pending'));
        try {
            const audioObjectURL = await fetchAudio(questionHash).unwrap();
            console.log("audioObjectURL:", audioObjectURL);
            dispatch(audioSlice.setRequestStatus('success'));
            //音声データをredux storeに保存
            dispatch(audioSlice.setAudioObjectURL(audioObjectURL));
            console.log("audioObjectURL saved in store");
        } catch (error) {
            dispatch(audioSlice.setRequestStatus('failed'));
            dispatch(audioSlice.resetAudioState());
            //クイズセッション初期化
            await resetQuizSession();
            throw new Error('音声データの取得に失敗しました'); 
        }
    };

    const handleQuizEnd = async () => {
        //各stateをリセット
        dispatch(newQuestionSlice.resetRequestState());
        dispatch(audioSlice.resetAudioState());
        dispatch(resultSlice.resetResultState());
        dispatch(indexSlice.resetIndexState());
        //クイズセッションリセット
        await resetQuizSession();
        //メインメニューに遷移
        navigate('/main-menu');
    };

    const handleBack = async () => {
        dispatch(newQuestionSlice.resetRequestState());
        navigate('/main-menu')
    };

    useEffect(() => {
        console.log("sectionNumber: ", sectionNumber);
        console.log("requestedNumOfLQuizs: ", requestedNumOfLQuizs);
        console.log("speakingRate: ", speakingRate);
        console.log("speakerAccent: ", speakerAccent);
        console.log("currentIndex: ", currentIndex);
    }, [sectionNumber, requestedNumOfLQuizs, speakingRate, speakerAccent, currentIndex]);

    //2問目以降のfetch・ローディング画面表示
    const hasExecuted = useRef(false);
    //currentIndex > 0の場合の処理
    if (currentIndex > 0) {
        //一回だけfetch実行
        if (hasExecuted.current === false) {
            hasExecuted.current = true;
            
            Promise.resolve(handleNextQuestionFetch())
                .catch(error => {
                    console.error('Fetch failed:', error);
                    hasExecuted.current = false;
                });
        }
        //2問目以降は常にローディング画面
        return (
            <LoadingModalComponent 
                open={true}
                message="問題を準備中です..."
            />
        );
    };

    //1問目実行前の画面表示
    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                width: '100%',
                background: 'linear-gradient(135deg, #afc4e9ff 0%, #81a2d7ff 100%)',
                py: 4
            }}
        >
            <Container maxWidth="md">
                <Box
                    sx={{
                        marginTop: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Box
                        sx={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                            overflow: 'hidden',
                            width: '100%',
                            maxWidth: 700
                        }}
                    >

                        <Box sx={{ p: 4 }}>
                            {/* 設定セクション */}
                            <Box sx={{ mb: 4 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 3, 
                                        fontWeight: 600,
                                        color: '#333',
                                        textAlign: 'center'
                                    }}
                                >
                                    ⚙️ 問題設定を選択してください
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* セクション選択 */}
                                    <Box 
                                        sx={{ 
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
                                            borderRadius: '16px',
                                            p: 3,
                                            border: '1px solid rgba(102, 126, 234, 0.15)'
                                        }}
                                    >
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                mb: 2, 
                                                fontWeight: 600,
                                                color: '#667eea',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            📚 セクション
                                        </Typography>
                                        <DropdownComponent 
                                            type="sectionNum"
                                            value={sectionNumber}
                                            onChange={handleSectionChange}
                                            helperText="セクションを選択してください"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: 'white',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea'
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#667eea',
                                                        borderWidth: 2
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* 問題数選択 */}
                                    <Box 
                                        sx={{ 
                                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(139, 195, 74, 0.08))',
                                            borderRadius: '16px',
                                            p: 3,
                                            border: '1px solid rgba(76, 175, 80, 0.15)'
                                        }}
                                    >
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                mb: 2, 
                                                fontWeight: 600,
                                                color: '#4CAF50',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            🔢 問題数
                                        </Typography>
                                        <DropdownComponent 
                                            type="numOfLQuizs"
                                            value={requestedNumOfLQuizs}
                                            onChange={handleNumOfLQuizesChange}
                                            helperText="問題数を選択してください"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: 'white',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#4CAF50'
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#4CAF50',
                                                        borderWidth: 2
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* アクセント選択 */}
                                    <Box 
                                        sx={{ 
                                            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.08), rgba(255, 152, 0, 0.08))',
                                            borderRadius: '16px',
                                            p: 3,
                                            border: '1px solid rgba(255, 193, 7, 0.15)'
                                        }}
                                    >
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                mb: 2, 
                                                fontWeight: 600,
                                                color: '#FF9800',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            🎤 アクセント
                                        </Typography>
                                        <DropdownComponent 
                                            type="speakerAccent"
                                            value={speakerAccent}
                                            onChange={handleSpeakerAccentChange}
                                            disabled={true} //一時的に無効化
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: 'white',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#FF9800'
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#FF9800',
                                                        borderWidth: 2
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            {/* アクションボタン */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                                <ButtonComponent 
                                    variant="contained"
                                    label={(!sectionNumber || !requestedNumOfLQuizs) ? "⚠️ 設定を完了してください" : "🚀 問題を開始する"}
                                    onClick={fetchQuizHandler}
                                    color="primary"
                                    size="large"
                                    disabled={!sectionNumber || !requestedNumOfLQuizs}
                                    sx={{ 
                                        width: '100%',
                                        py: 2.5,
                                        fontSize: '1.3rem',
                                        fontWeight: 700,
                                        borderRadius: '16px',
                                        background: (!sectionNumber || !requestedNumOfLQuizs) 
                                            ? 'linear-gradient(45deg, #9e9e9e, #757575)' 
                                            : 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                                        boxShadow: (!sectionNumber || !requestedNumOfLQuizs) 
                                            ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                                            : '0 8px 24px rgba(76, 175, 80, 0.3)',
                                        '&:hover': {
                                            boxShadow: (!sectionNumber || !requestedNumOfLQuizs) 
                                                ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                                                : '0 12px 32px rgba(76, 175, 80, 0.4)',
                                            transform: (!sectionNumber || !requestedNumOfLQuizs) 
                                                ? 'none' 
                                                : 'translateY(-2px)'
                                        },
                                        '&:disabled': {
                                            opacity: 0.7,
                                            cursor: 'not-allowed'
                                        }
                                    }}
                                />

                                <ButtonComponent 
                                    variant="outlined"
                                    label="← 戻る"
                                    onClick={handleBack}
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        width: '100%',
                                        py: 2,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '16px',
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                        }
                                    }}
                                />
                            </Box>

                            {/* 設定状況の表示 */}
                            <Box 
                                sx={{ 
                                    mt: 4,
                                    p: 3,
                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: '#666',
                                        mb: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    📋 現在の設定
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            セクション
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color={sectionNumber ? '#4CAF50' : '#f44336'}>
                                            {sectionNumber || '未選択'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            問題数
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color={requestedNumOfLQuizs ? '#4CAF50' : '#f44336'}>
                                            {requestedNumOfLQuizs || '未選択'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            アクセント
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color={speakerAccent ? '#4CAF50' : '#ff9800'}>
                                            {speakerAccent || '任意'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* ローディング表示 */}
                        <LoadingModalComponent 
                            open={isLoading}
                            message="問題を準備中です..."
                        />
                    </Box>
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
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    //状態'answer'
    const screenState = useAppSelector(state => state.uiManagement.currentScreen);

    //問題番号管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    const { currentIndex, isLastQuestion } = indexParams;

    //クイズデータselector（現在の問題のhashだけ取得）
    const {sectionNumber, requestedNumOfLQuizs} = useAppSelector(state => state.newRandomQuestionRequest.requestParams);
    const questionHash = useAppSelector(state => state.newRandomQuestionRequest.questionHash) 

    //音声データObjectURLselector
    const audioObjectURL = useAppSelector(state => state.audioManagement.audioObjectURL);
    
    const isAudioReadyToPlay = useAppSelector(state => state.audioManagement.isAudioReadyToPlay);

    //回答リクエスト用selector
    const requestAnswerParams = useAppSelector(state => {return state.answerManagement.requestParams}) as dto.UserAnswerReqDTO;
    const { reviewTag, userAnswerOption } = requestAnswerParams;
    const answerData = useAppSelector(state => {return state.answerManagement.answerData}) as dto.UserAnswerResDTO;
    //リクエスト状態
    const requestStatus = useAppSelector(state => state.answerManagement.requestStatus);

    //API
    const [resetQuizSession] = api.useResetQuizSessionMutation();
    const [resetUserAndQuizSession] = api.useResetUserAndQuizSessionMutation();
    const [fetchAnswer] = api.useFetchAnswerMutation();

    const handleReviewTagChange = (checked: boolean) => {
        dispatch(answerSlice.updateRequestParam({ reviewTag: checked }
        ));
    };

    //Part別の回答配列初期化用ヘルパー関数
    const initializeUserAnswerOption = (sectionNumber: 1 | 2 | 3 | 4): (string | null)[] => {
        if (sectionNumber === 1 || sectionNumber === 2) {
            //Part1,2: 単一要素配列
            return [null];
        } else {
            //Part3,4: 3要素配列
            return [null, null, null];
        }
    };

    //小問選択
    type SubQuestionNumber = '0' | '1' | '2';
    const [selectedSubQuestionIndex, setSelectedSubQuestionIndex] = useState<SubQuestionNumber>('0');    
    const subQuestionOptions = [
        { value: '0', label: 'Q1' },
        { value: '1', label: 'Q2' },
        { value: '2', label: 'Q3' }
    ];
    const handleSubQuestionNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedSubQuestionIndex = event.target.value as SubQuestionNumber;
        setSelectedSubQuestionIndex(selectedSubQuestionIndex);
    };

    //対応するhandleUserAnswerChangeの修正版
    const handleUserAnswerChange = (selectedAnswer: "A" | "B" | "C" | "D") => {
        if (sectionNumber === 3 || sectionNumber === 4) {
            dispatch(answerSlice.updateSubQuestionAnswer({
                currentSubQuestionIndex: selectedSubQuestionIndex,
                answer: selectedAnswer,
                sectionNumber: sectionNumber
            }));
        } else {
            //Part1,2の場合
            dispatch(answerSlice.updateSubQuestionAnswer({
                currentSubQuestionIndex: '0',
                answer: selectedAnswer,
                sectionNumber: sectionNumber
            }));
        }
    };

    //音声再生
    const {load, error, isPlaying} = useAudioPlayer();
    const handleAudioPlay = () => {
            console.log("handleAudioPlay called");
            console.log("isAudioReadyToPlay:", isAudioReadyToPlay);
                      
            try{
                if (error) {
                    console.error("Audio player error:", error);
                    throw new Error("Audio player error");
                }
                        
                if (!isAudioReadyToPlay) {
                    throw new Error("音声データが準備されていません");
                };
                //ObjectURLに紐づいた音声を再生
                if (audioObjectURL) {
                    load(audioObjectURL, {
                        html5: true,
                        format: 'mp3',
                        autoplay: true,
                        onend: () => {
                            //再生終了時にURL解放　→現段階ではしない　Result画面まで保持する
                            //window.URL.revokeObjectURL(audioBlobURL);
                            //redux storeからもクリア
                            //dispatch(audioSlice.clearAudioData());
                            console.log("audio play successfully ended");
                        }
                    })
                };
            } catch (error) {
                //audioSliceのstateリセット
                dispatch(audioSlice.resetAudioState());
                console.log("audio play failed", error);
            }
        };
    const handleAnswer = async () => {
        //回答内容をAPIに送る
        //回答レスポンスが届いたことを確認
        //stateを結果状態に更新し、結果画面（Result.tsx）に遷移(Navigate)
        //Redux stateからDTOを構築
        if (userAnswerOption === undefined || userAnswerOption.includes(null)) {
            const confirmResult = window.confirm(
                "未回答の小問があります。解答画面に進みますか？前の問題に戻ることはできません。"
            );
            
            if (!confirmResult) {
                // 「キャンセル」が選択された場合の処理
                // 何もしない（現在の問題に留まる）
                return;
        };

        //必須パラメータチェック
        if (!questionHash || reviewTag === undefined) {
            console.error("必須パラメータが不足しています");
            dispatch(uiSlice.setCurrentScreen('result'));
            return;
            
        }
}
        try{
            console.log(userAnswerOption, reviewTag);

            const answerReqDTO: dto.UserAnswerReqDTO = {
                questionHash: questionHash,
                userAnswerOption: userAnswerOption,
                reviewTag: reviewTag,
                answerDate: new Date()
            };

            console.log("=== 回答リクエスト開始 ===: ", answerReqDTO);
            //回答内容をAPIに送る
            const answerResult = await fetchAnswer(answerReqDTO);
            console.log(answerResult);
            //回答レスポンスをredux storeに保存
            dispatch(answerSlice.setAnswerData(answerResult.data as dto.UserAnswerResDTO));
            
            console.log("=== 回答リクエスト完了 ===: ");

            //currentIndex・isLastQuestion更新　Result画面に移動
            await handleIsLastQuestion();
            //stateを'result'に更新し、結果状態に遷移
            dispatch(uiSlice.setCurrentScreen('result'));
        
        } catch (error) {
            console.log("回答処理失敗:", error);
        }
        dispatch(uiSlice.setCurrentScreen('result'));
    };

    //終点判定だけ行う
    const handleIsLastQuestion = async () => {
        const lastIndex = requestedNumOfLQuizs - 1;
        
        //「現在のindexが既に最後の問題か」を判定
        const currentIsLastQuestion = currentIndex >= lastIndex;
        
        console.log("currentIsLastQuestion", currentIsLastQuestion, " requestedNumOfLQuizs: ", requestedNumOfLQuizs);
        //Result画面では引き続きcurrentIndexを使用するが、isLastQuestionは更新する
        dispatch(indexSlice.updateIsLastQuestion(currentIsLastQuestion));
    };

    const handleQuizEnd = async () => {
        //各stateをリセット
        dispatch(newQuestionSlice.resetRequestState());
        dispatch(answerSlice.resetAnswerState());
        dispatch(audioSlice.resetAudioState());
        dispatch(resultSlice.resetResultState());
        dispatch(indexSlice.resetIndexState());
        //クイズセッションリセット
        await resetQuizSession();
        //メインメニューに遷移
        navigate('/main-menu');
    };

    //中断ポップアップ
    const [showInterruptPopup, setShowInterruptPopup] = useState(false);

    const handleQuit = () => {
        setShowInterruptPopup(true);
    };

    const handleClosePopup = () => {
        setShowInterruptPopup(false);
    };

    const handleMainMenu = async () => {
        setShowInterruptPopup(false);
        await handleQuizEnd();
        navigate('/main-menu');
    };

    const handleLogout = async() => {
        setShowInterruptPopup(false);
        await resetUserAndQuizSession();
        //ログアウト
        dispatch(loginSlice.logout());
        navigate('/login');
    };

    //デバッグ用
    useEffect(() => {
        console.log("sectionNumber", sectionNumber);
        console.log("questionHash: ", questionHash);
        console.log("currentSubQuestion", selectedSubQuestionIndex);
        console.log("userAnswerOption: ", userAnswerOption);
        console.log("isLastQuestion: ", isLastQuestion);
        console.log("answerData: ", answerData);
    }, [sectionNumber, questionHash, selectedSubQuestionIndex, userAnswerOption, isLastQuestion, answerData]);

    return (
        //回答画面
        //コンポーネント：回答ボタン(A|B|C|D), 回答するボタン, 後で復習　チェックボックス, やめるボタン
        <Box 
            sx={{ 
                minHeight: '100vh',
                height: 'auto',
                width: '100%',
                background: 'linear-gradient(135deg, #afc4e9ff 0%, #81a2d7ff 100%)',
                py: 4
            }}
        >
            <Container maxWidth="md">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: 'calc(100vh - 64px)'
                    }}
                >
                    <Box
                        sx={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                            width: '100%',
                            maxWidth: 700
                        }}
                    >
                        {/* ヘッダー */}
                        <Box 
                            sx={{ 
                                background: 'linear-gradient(45deg, #72a6e2ff 30%, #3c8ad4ff 90%)',
                                color: 'white',
                                p: 4,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                                第{currentIndex + 1}問
                            </Typography>
                        </Box>

                        <Box sx={{ p: 4 }}>
                            {/* 音声再生セクション */}
                            <Box 
                                sx={{ 
                                    textAlign: 'center', 
                                    mb: 4,
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                    borderRadius: '20px',
                                    p: 4,
                                    border: '1px solid rgba(102, 126, 234, 0.2)'
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 3, 
                                        fontWeight: 600,
                                        color: '#333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1
                                    }}
                                >
                                    🎵 音声を再生して問題に答えてください
                                </Typography>
                                <ButtonComponent
                                    disabled={isPlaying}
                                    variant="contained"
                                    label={isPlaying ? "🔄 再生中..." : "🔊 音声再生"}
                                    onClick={handleAudioPlay}
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        minWidth: 220,
                                        py: 2,
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        borderRadius: '25px',
                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                                        },
                                        '&:disabled': {
                                            opacity: 0.7,
                                            cursor: 'not-allowed'
                                        }
                                    }}
                                />
                            </Box>

                            {/* 回答選択セクション */}
                            <Box sx={{ mb: 4 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 3, 
                                        fontWeight: 600,
                                        color: '#333',
                                        textAlign: 'center'
                                    }}
                                >
                                    答えを選択してください
                                </Typography>
                                
                                <Box 
                                    sx={{ 
                                        background: '#f8f9fa',
                                        borderRadius: '20px',
                                        p: 3,
                                        border: '1px solid rgba(0,0,0,0.08)'
                                    }}
                                >
                                    <AnswerButtonComponent
                                        sectionNumber={sectionNumber}
                                        onAnswerChange={handleUserAnswerChange}
                                        selectedValue={userAnswerOption?.[selectedSubQuestionIndex] || null}
                                        selectedSubQuestionIndex={selectedSubQuestionIndex}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                            '& .MuiButton-root': {
                                                borderRadius: '16px',
                                                py: 2,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* TOEIC小問切り替えセクション */}
                            {sectionNumber !== 1 && sectionNumber !== 2 && (
                                <Box 
                                    sx={{ 
                                        mb: 4,
                                        background: 'rgba(255, 193, 7, 0.05)',
                                        borderRadius: '16px',
                                        p: 3,
                                        border: '1px solid rgba(255, 193, 7, 0.2)'
                                    }}
                                >
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            mb: 2, 
                                            fontWeight: 600,
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        🔢 小問を選択
                                    </Typography>
                                    
                                    <RadioButtonComponent
                                        groupLabel=""
                                        name="toeic-question-selector"
                                        value={selectedSubQuestionIndex}
                                        options={subQuestionOptions}
                                        onChange={handleSubQuestionNumberChange}
                                        row={true}              
                                        disabled={false}
                                        required={false}
                                        size="medium"
                                        color="primary"
                                        sx={{
                                            '& .MuiFormControlLabel-root': {
                                                backgroundColor: 'white',
                                                borderRadius: '12px',
                                                px: 2,
                                                py: 1,
                                                margin: '0 8px 8px 0',
                                                border: '2px solid transparent',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)'
                                                }
                                            },
                                            '& .Mui-checked + .MuiFormControlLabel-label': {
                                                fontWeight: 600
                                            }
                                        }}
                                    />
                                </Box>
                            )}

                            {/* 復習タグセクション */}
                            <Box 
                                sx={{ 
                                    mb: 4,
                                    background: 'rgba(76, 175, 80, 0.05)',
                                    borderRadius: '16px',
                                    p: 3,
                                    border: '1px solid rgba(76, 175, 80, 0.2)'
                                }}
                            >
                                <CheckBoxComponent
                                    label="⭐ 後で復習する"
                                    checked={reviewTag || false}
                                    onChange={handleReviewTagChange}
                                    sx={{
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            color: '#333'
                                        },
                                        '& .MuiCheckbox-root': {
                                            color: '#4CAF50',
                                            '&.Mui-checked': {
                                                color: '#4CAF50'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* 回答するボタン */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <ButtonComponent 
                                    variant="contained"
                                    label={userAnswerOption ? "✅ 回答する" : "❓ 答えを選択してください"}
                                    onClick={handleAnswer}
                                    color="primary"
                                    size="large"
                                    disabled={
                                        !userAnswerOption ||
                                        requestStatus === 'pending'
                                    }
                                    sx={{ 
                                        width: '100%',
                                        py: 2.5,
                                        fontSize: '1.3rem',
                                        fontWeight: 700,
                                        borderRadius: '16px',
                                        background: userAnswerOption 
                                            ? 'linear-gradient(45deg, #4CAF50, #8BC34A)' 
                                            : 'linear-gradient(45deg, #9e9e9e, #757575)',
                                        boxShadow: userAnswerOption 
                                            ? '0 8px 24px rgba(76, 175, 80, 0.3)' 
                                            : '0 4px 12px rgba(0, 0, 0, 0.2)',
                                        '&:hover': {
                                            boxShadow: userAnswerOption 
                                                ? '0 12px 32px rgba(76, 175, 80, 0.4)' 
                                                : '0 4px 12px rgba(0, 0, 0, 0.2)'
                                        },
                                        '&:disabled': {
                                            opacity: 0.6,
                                            cursor: 'not-allowed'
                                        }
                                    }}
                                />

                                <ButtonComponent 
                                    variant="outlined"
                                    label="🚪 やめる"
                                    onClick={handleQuit}
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        width: '100%',
                                        py: 2,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '16px',
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* 中断ポップアップ */}
                        <QuizInterruptPopup
                            open={showInterruptPopup}
                            onClose={handleClosePopup}
                            onMainMenu={handleMainMenu}
                            onLogout={handleLogout}
                        />
                    </Box>
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
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    //状態'result'
    const screenState = useAppSelector(state => state.uiManagement.currentScreen);

    //問題番号管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    const { currentIndex, isLastQuestion } = indexParams;

    //クイズデータselector（現在のindexの問題だけ取得）
    const questionHash = useAppSelector(state => state.newRandomQuestionRequest.questionHash) 
    const requestQuestionParams = useAppSelector(state => state.newRandomQuestionRequest.requestParams);
    const { sectionNumber, requestedNumOfLQuizs, speakingRate, speakerAccent } = requestQuestionParams;

    //音声データselector
    const isAudioReadyToPlay = useAppSelector(state => state.audioManagement.isAudioReadyToPlay);
    const audioObjectURL = useAppSelector(state => state.audioManagement.audioObjectURL);

    //解答データ取得用selector
    const answerParam = useAppSelector(state => state.answerManagement.requestParams) as dto.UserAnswerReqDTO;
    const { userAnswerOption, reviewTag } = answerParam;
    //解答データ
    const answerData = useAppSelector(state => {return state.answerManagement.answerData}) as dto.UserAnswerResDTO;
    const { audioScript, jpnAudioScript, explanation, answerOption, isCorrectList } = answerData;
    //問題文/和訳/解説　タブ切り替え
    const [selectedTab, setSelectedTab] = useState(0);

    //
    const answerResultList = useAppSelector(state => state.finalResultManagement.answerResultList);

    //API
    const [resetQuizSession] = api.useResetUserAndQuizSessionMutation();
    const [resetUserAndQuizSession] = api.useResetUserAndQuizSessionMutation();

    //音声再生
    const {load, error, isPlaying} = useAudioPlayer();
    const handleAudioPlay = () => {
            console.log("handleAudioPlay called");
            console.log("isAudioReadyToPlay:", isAudioReadyToPlay);
                      
            try{
                if (error) {
                    console.error("Audio player error:", error);
                    throw new Error("Audio player error");
                }
                        
                if (!isAudioReadyToPlay) {
                    throw new Error("音声データが準備されていません");
                };
                //ObjectURLに紐づいた音声を再生
                if (audioObjectURL) {
                    load(audioObjectURL, {
                        html5: true,
                        format: 'mp3',
                        autoplay: true,
                        onend: () => {
                            console.log("audio play successfully ended");
                        }
                    })
                };
            } catch (error) {
                //audioSliceのstateリセット
                dispatch(audioSlice.resetAudioState());
                console.log("audio play failed", error);
            }
        };

    //復習タグの変更
    const handleReviewTagChange = (checked: boolean) => {
        dispatch(answerSlice.updateRequestParam({ reviewTag: checked }))
    };

    //isLastQuestion=false　次の問題に進む
    const handleNextQuestion = async () => {
        console.log("Params for answerResultList", sectionNumber, currentIndex, isCorrectList);
        //回答結果を保存
        dispatch(finalResultSlice.setAnswerResultList({sectionNumber: sectionNumber, currentIndex: currentIndex, isCorrectList: isCorrectList}));
        //currentIndexを更新
        await handleCurrentIndex();
        //standby画面に遷移
        dispatch(uiSlice.setCurrentScreen('standby'));
        return;
        //await handleQuizEnd();
    };

    //currentIndexのみ更新
    const handleCurrentIndex = async () => {
        const nextIndex = currentIndex + 1;
        const lastIndex = requestedNumOfLQuizs - 1;
        
        console.log("nextIndex", nextIndex);
        //currentIndexのみ更新する
        dispatch(indexSlice.setCurrentIndex({
            currentIndex: Math.min(nextIndex, lastIndex) as 0|1|2|3|4|5|6|7|8|9,
            isLastQuestion: isLastQuestion
        }));
    };

    //isLastQuestion=true　最終結果画面に遷移
    const handleViewResults = () => {
        console.log("Params for answerResultList", sectionNumber, currentIndex, isCorrectList);
        //回答結果を保存
        dispatch(finalResultSlice.setAnswerResultList({sectionNumber: sectionNumber, currentIndex: currentIndex, isCorrectList: isCorrectList}));
        
        //結果一覧画面に遷移（別途実装が必要）
        dispatch(uiSlice.setCurrentScreen('finalResult'));
    };

    const handleQuizEnd = async () => {
        //各stateをリセット
        dispatch(newQuestionSlice.resetRequestState());
        dispatch(answerSlice.resetAnswerState());
        dispatch(audioSlice.resetAudioState());
        dispatch(resultSlice.resetResultState());
        dispatch(indexSlice.resetIndexState());
        //クイズセッションリセット
        await resetQuizSession();
        //メインメニューに遷移
        dispatch(uiSlice.setCurrentScreen('finalResult'));
    };

    //中断ポップアップ
    const [showInterruptPopup, setShowInterruptPopup] = useState(false);

    const handleQuit = () => {
        setShowInterruptPopup(true);
    };

    const handleClosePopup = () => {
        setShowInterruptPopup(false);
    };

    const handleMainMenu = async () => {
        setShowInterruptPopup(false);
        await handleQuizEnd();
        navigate('/main-menu');
    };

    const handleLogout = async() => {
        setShowInterruptPopup(false);
        await resetUserAndQuizSession();
        //ログアウト
        dispatch(loginSlice.logout());
        navigate('/login');
    };

    useEffect(() => {
        console.log("isLastQuestion:", isLastQuestion);
        console.log("answerResultList:", answerResultList);
    }, [isLastQuestion, answerResultList]);

    return (
        <Box 
            sx={{ 
                width: '100%',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #afc4e9ff 0%, #81a2d7ff 100%)',
                py: 4
            }}
        >
            <Container maxWidth="lg">
                <Box 
                    sx={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        mx: 'auto',
                        maxWidth: 900
                    }}
                >
                    {/* ヘッダー部分 */}
                    <Box 
                        sx={{ 
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            color: 'white',
                            p: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                            Part {sectionNumber}
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
                            第{currentIndex + 1}問 結果
                        </Typography>
                        <Box 
                            sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '16px',
                                py: 1,
                                px: 2,
                                display: 'inline-block'
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                🎤 アクセント: {speakerAccent}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ p: 4 }}>
                        {/* スコア表示（Part3,4のみ） */}
                        {(sectionNumber === 3 || sectionNumber === 4) && (
                            <Box 
                                sx={{ 
                                    mb: 4,
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                                        borderRadius: '20px',
                                        p: 3,
                                        color: 'white',
                                        boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)'
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                        🎯 {isCorrectList.filter(correct => correct).length} / {isCorrectList.length}
                                    </Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                        正解数
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        
                        {/* 問題別結果 */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                                📊 詳細結果
                            </Typography>
                            
                            <Grid container spacing={3}>
                                {isCorrectList.map((isCorrect, index) => (
                                    <Grid 
                                        key={index}
                                        size={{ xs: 12, sm: sectionNumber === 3 || sectionNumber === 4 ? 6 : 12, md: sectionNumber === 3 || sectionNumber === 4 ? 4 : 12 }}
                                    >
                                        <Box 
                                            sx={{ 
                                                background: isCorrect 
                                                    ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' 
                                                    : 'linear-gradient(135deg, #F44336, #FF7043)',
                                                borderRadius: '16px',
                                                p: 3,
                                                color: 'white',
                                                textAlign: 'center',
                                                transform: 'translateY(0)',
                                                transition: 'all 0.3s ease',
                                                boxShadow: isCorrect 
                                                    ? '0 8px 24px rgba(76, 175, 80, 0.25)' 
                                                    : '0 8px 24px rgba(244, 67, 54, 0.25)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: isCorrect 
                                                        ? '0 12px 32px rgba(76, 175, 80, 0.35)' 
                                                        : '0 12px 32px rgba(244, 67, 54, 0.35)'
                                                }
                                            }}
                                        >
                                            {sectionNumber === 3 || sectionNumber === 4 ? (
                                                <>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            mb: 1,
                                                            opacity: 0.9
                                                        }}
                                                    >
                                                        Question {index + 1}
                                                    </Typography>
                                                    
                                                    <Typography 
                                                        variant="h5" 
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            mb: 2
                                                        }}
                                                    >
                                                        {isCorrect ? '✅ 正解' : '❌ 不正解'}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography 
                                                    variant="h4" 
                                                    sx={{ 
                                                        fontWeight: 700,
                                                        mb: 2
                                                    }}
                                                >
                                                    {isCorrect ? '✅ 正解' : '❌ 不正解'}
                                                </Typography>
                                            )}
                                            
                                            <Box sx={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                                                borderRadius: '12px', 
                                                p: 2,
                                                mb: 1
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                                    あなたの回答
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    {userAnswerOption?.[index] || '未回答'}
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                                                borderRadius: '12px', 
                                                p: 2
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                                    正解
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    {answerOption[index]}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* タブセクション */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                mb: 3
                            }}>
                                <Tabs 
                                    value={selectedTab} 
                                    onChange={(e, newValue) => setSelectedTab(newValue)} 
                                    centered
                                    sx={{
                                        '& .MuiTab-root': {
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            minWidth: 120,
                                            borderRadius: '12px 12px 0 0',
                                            margin: '0 4px'
                                        },
                                        '& .Mui-selected': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)'
                                        }
                                    }}
                                >
                                    <Tab label="📝 問題文" />
                                    <Tab label="🇯🇵 和訳" />
                                    <Tab label="💡 解説" />
                                </Tabs>
                            </Box>
                            
                            <Box 
                                sx={{ 
                                    minHeight: 200,
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '16px',
                                    p: 3,
                                    border: '1px solid rgba(0,0,0,0.08)'
                                }}
                            >
                                <TabPanelComponent value={selectedTab} index={0}>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            whiteSpace: 'pre-line', 
                                            lineHeight: 1.8,
                                            fontSize: '1.1rem',
                                            color: '#333'
                                        }}
                                    >
                                        {audioScript}
                                    </Typography>
                                </TabPanelComponent>
                                
                                <TabPanelComponent value={selectedTab} index={1}>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            whiteSpace: 'pre-line', 
                                            lineHeight: 1.8,
                                            fontSize: '1.1rem',
                                            color: '#333'
                                        }}
                                    >
                                        {jpnAudioScript}
                                    </Typography>
                                </TabPanelComponent>
                                
                                <TabPanelComponent value={selectedTab} index={2}>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            whiteSpace: 'pre-line', 
                                            lineHeight: 1.8,
                                            fontSize: '1.1rem',
                                            color: '#333'
                                        }}
                                    >
                                        {explanation}
                                    </Typography>
                                </TabPanelComponent>
                            </Box>
                        </Box>

                        {/* 音声再生セクション */}
                        <Box 
                            sx={{ 
                                textAlign: 'center', 
                                mb: 4,
                                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                borderRadius: '16px',
                                p: 3
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                                🎵 もう一度音声を聞く
                            </Typography>
                            <ButtonComponent
                                variant="contained"
                                label="🔊 音声再生"
                                onClick={handleAudioPlay}
                                color="primary"
                                size="large"
                                sx={{ 
                                    minWidth: 200,
                                    borderRadius: '25px',
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 24px rgba(102, 126, 234, 0.4)'
                                    }
                                }}
                            />
                        </Box>

                        {/* 復習タグ */}
                        <Box 
                            sx={{ 
                                mb: 4,
                                backgroundColor: 'rgba(255, 193, 7, 0.05)',
                                borderRadius: '16px',
                                p: 3,
                                border: '1px solid rgba(255, 193, 7, 0.2)'
                            }}
                        >
                            <CheckBoxComponent
                                label="⭐ 後で復習する"
                                checked={reviewTag || false}
                                onChange={handleReviewTagChange}
                                sx={{
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }
                                }}
                            />
                        </Box>

                        {/* アクションボタン */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {!isLastQuestion ? (
                                <ButtonComponent 
                                    variant="contained"
                                    label="➡️ 次の問題に進む"
                                    onClick={handleNextQuestion}
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        width: '100%',
                                        borderRadius: '16px',
                                        py: 2,
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                                        }
                                    }}
                                />
                            ) : (
                                <ButtonComponent 
                                    variant="contained"
                                    label="📊 回答結果を見る"
                                    onClick={handleViewResults}
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        width: '100%',
                                        borderRadius: '16px',
                                        py: 2,
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                                        }
                                    }}
                                />
                            )}

                            <ButtonComponent 
                                variant="outlined"
                                label="🚪 やめる"
                                onClick={handleQuit}
                                color="primary"
                                size="large"
                                sx={{ 
                                    width: '100%',
                                    borderRadius: '16px',
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        backgroundColor: 'rgba(102, 126, 234, 0.05)'
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {/* 中断ポップアップ */}
                    <QuizInterruptPopup
                        open={showInterruptPopup}
                        onClose={handleClosePopup}
                        onMainMenu={handleMainMenu}
                        onLogout={handleLogout}
                    />
                </Box>
            </Container>
        </Box>
    );
};

//最終結果画面
function FinalResultScreen() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    //状態'finalResult'
    const screenState = useAppSelector(state => state.uiManagement.currentScreen);

    //最終結果画面Selector
    const answerResultList = useAppSelector(state => state.finalResultManagement.answerResultList);
    
    //クイズ設定情報
    const requestQuestionParams = useAppSelector(state => state.newRandomQuestionRequest.requestParams);
    const { sectionNumber, requestedNumOfLQuizs } = requestQuestionParams;

    //API
    const [resetQuizSession] = api.useResetQuizSessionMutation();
    const [resetUserAndQuizSession] = api.useResetUserAndQuizSessionMutation();

    //正解数計算
    const correctCount = answerResultList.filter(result => result === true).length;
    const totalQuestions = answerResultList.length;

    //Part別の結果表示データ生成
    const generateResultItems = () => {
        if (sectionNumber === 1 || sectionNumber === 2) {
            //Part1,2: 1問1行
            return answerResultList.map((isCorrect, index) => ({
                questionNumber: index + 1,
                subQuestionNumber: null,
                isCorrect,
                displayText: `問題${index + 1}`
            }));
        } else {
            //Part3,4: 1問3行
            const items = [];
            for (let i = 0; i < requestedNumOfLQuizs; i++) {
                for (let j = 0; j < 3; j++) {
                    const resultIndex = i * 3 + j;
                    if (resultIndex < answerResultList.length) {
                        items.push({
                            questionNumber: i + 1,
                            subQuestionNumber: j + 1,
                            isCorrect: answerResultList[resultIndex],
                            displayText: `問題${i + 1}-${j + 1}`
                        });
                    }
                }
            }
            return items;
        }
    };

    const resultItems = generateResultItems();

    const handleBackToMenu = async () => {
        //各stateをリセット
        dispatch(newQuestionSlice.resetRequestState());
        dispatch(answerSlice.resetAnswerState());
        dispatch(audioSlice.resetAudioState());
        dispatch(resultSlice.resetResultState());
        dispatch(indexSlice.resetIndexState());
        dispatch(finalResultSlice.resetFinalResultState());
        dispatch(uiSlice.resetUIState());
        
        //クイズセッションリセット
        await resetQuizSession();
        
        //メインメニューに遷移
        navigate('/main-menu');
    };

    const handleLogout = async () => {
        //各stateをリセット
        dispatch(newQuestionSlice.resetRequestState());
        dispatch(answerSlice.resetAnswerState());
        dispatch(audioSlice.resetAudioState());
        dispatch(resultSlice.resetResultState());
        dispatch(indexSlice.resetIndexState());
        dispatch(finalResultSlice.resetFinalResultState());
        dispatch(uiSlice.resetUIState());

        //クイズセッションリセット
        await resetUserAndQuizSession();
        dispatch(loginSlice.logout());
        navigate('/login');
    };
    useEffect(() => {
        console.log("answerResultList in finalResult", answerResultList);
    })

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                width: '100%',
                background: 'linear-gradient(135deg, #afc4e9ff 0%, #81a2d7ff 100%)',
                py: 4
            }}
        >
            <Container maxWidth="md">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Box
                        sx={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                            overflow: 'hidden',
                            width: '100%',
                            maxWidth: 700
                        }}
                    >
                        {/*ヘッダー*/}
                        <Box 
                            sx={{ 
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                color: 'white',
                                p: 4,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                                Part {sectionNumber}
                            </Typography>
                            <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
                                最終結果
                            </Typography>
                        </Box>

                        <Box sx={{ p: 4 }}>
                            {/*スコア表示*/}
                            <Box 
                                sx={{ 
                                    textAlign: 'center',
                                    mb: 4
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        background: correctCount === totalQuestions 
                                            ? 'linear-gradient(45deg, #4CAF50, #8BC34A)'
                                            : correctCount >= totalQuestions * 0.7
                                            ? 'linear-gradient(45deg, #FF9800, #FFC107)'
                                            : 'linear-gradient(45deg, #F44336, #FF7043)',
                                        borderRadius: '20px',
                                        p: 4,
                                        color: 'white',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                        mb: 3
                                    }}
                                >
                                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                                        {correctCount} / {totalQuestions}
                                    </Typography>
                                    <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
                                        {totalQuestions}問中{correctCount}問正解
                                    </Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.8 }}>
                                        正答率: {Math.round((correctCount / totalQuestions) * 100)}%
                                    </Typography>
                                </Box>
                            </Box>

                            {/*詳細結果一覧*/}
                            <Box sx={{ mb: 4 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 3, 
                                        fontWeight: 600,
                                        color: '#333',
                                        textAlign: 'center'
                                    }}
                                >
                                    詳細結果
                                </Typography>
                                
                                <Box 
                                    sx={{ 
                                        background: '#f8f9fa',
                                        borderRadius: '16px',
                                        p: 3,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}
                                >
                                    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                        {resultItems.map((item, index) => (
                                            <Box 
                                                component="li"
                                                key={index}
                                                sx={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    py: 1.5,
                                                    px: 2,
                                                    mb: 1,
                                                    borderRadius: '8px',
                                                    backgroundColor: item.isCorrect 
                                                        ? 'rgba(76, 175, 80, 0.05)' 
                                                        : 'rgba(244, 67, 54, 0.05)',
                                                    border: `1px solid ${item.isCorrect 
                                                        ? 'rgba(76, 175, 80, 0.2)' 
                                                        : 'rgba(244, 67, 54, 0.2)'}`,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: item.isCorrect 
                                                            ? 'rgba(76, 175, 80, 0.1)' 
                                                            : 'rgba(244, 67, 54, 0.1)'
                                                    }
                                                }}
                                            >
                                                <Typography 
                                                    variant="body1" 
                                                    sx={{ 
                                                        fontWeight: 700,
                                                        color: '#333',
                                                        minWidth: 'fit-content'
                                                    }}
                                                >
                                                    {item.displayText}
                                                </Typography>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 700,
                                                        color: item.isCorrect ? '#2E7D32' : '#C62828',
                                                        fontSize: '1.5rem'
                                                    }}
                                                >
                                                    {item.isCorrect ? '○' : '×'}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            {/*アクションボタン*/}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <ButtonComponent 
                                    variant="contained"
                                    label="メインメニューに戻る"
                                    onClick={handleBackToMenu}
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        width: '100%',
                                        py: 2.5,
                                        fontSize: '1.3rem',
                                        fontWeight: 700,
                                        borderRadius: '16px',
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                />

                                <ButtonComponent 
                                    variant="outlined"
                                    label="ログアウト"
                                    onClick={handleLogout}
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        width: '100%',
                                        py: 2,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '16px',
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                        }
                                    }}
                                />
                            </Box>

                            {/*結果サマリー*/}
                            <Box 
                                sx={{ 
                                    mt: 4,
                                    p: 3,
                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: '#666',
                                        mb: 2,
                                        textAlign: 'center'
                                    }}
                                >
                                    お疲れ様でした！
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            セクション
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="primary">
                                            Part {sectionNumber}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            問題数
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="primary">
                                            {requestedNumOfLQuizs}問
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            正答率
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="primary">
                                            {Math.round((correctCount / totalQuestions) * 100)}%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default ListeningQuizPage;
