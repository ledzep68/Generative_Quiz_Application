//===========================================================================


//音声取得は、1回のtransaction（問題取得→問題回答→結果閲覧）のサイクルが完了し、次の問題（2問目以降）に移行するタイミングでGETを出す設計とする
//理由はユーザーの途中離脱など考慮し、できるだけ冗長なGETをなくすため

//音声は音声再生ボタンを押したタイミングで再生

//===========================================================================
import {use, useState, useEffect, SyntheticEvent, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {useAudioPlayer} from "react-use-audio-player";
import ReactAudioPlayer from 'react-audio-player';
import {URL} from "url";

import { Container, Box, Typography, Paper, SelectChangeEvent, Slider, IconButton } from "@mui/material";
import { ContentCutOutlined, Settings } from "@mui/icons-material";
import { PlayArrow, Pause } from '@mui/icons-material';

//共通コンポーネント
import ButtonComponent from "../src/shared/components/Button";
import InputFormComponent from "../src/shared/components/InputForm";
import DropdownComponent from "../src/shared/components/Dropdown";
import MainMenu from "../src/features/main-menu/components/MainMenu";
import CheckBoxComponent from "../src/shared/components/CheckBox";
import AnswerButtonComponent from "../src/features/listening-quiz-management/transaaction/components/AnswerButton.tsx";
import QuizInterruptPopup from "../src/features/listening-quiz-management/transaaction/components/InterruptPopUp.tsx";

import * as newQuestionSlice from "../src/features/listening-quiz-management/transaaction/newquiz.slice";
import * as uiSlice from "../src/features/listening-quiz-management/transaaction/ui.slice.ts";
import * as audioSlice from "../src/features/listening-quiz-management/transaaction/audio.slice.ts";
import * as indexSlice from "../src/features/listening-quiz-management/transaaction/index-management.slice.ts"
import * as answerSlice from "../src/features/listening-quiz-management/transaaction/answer.slice.ts";

import * as dto from "../src/features/listening-quiz-management/transaaction/dto.ts";
import * as api from "../src/features/listening-quiz-management/transaaction/api.ts";
import * as type from "../src/features/listening-quiz-management/transaaction/types.ts";
import { useAppSelector, useAppDispatch } from "../src/shared/hooks/redux-hooks.ts";
import { current } from "@reduxjs/toolkit";

//テスト画面
function TestScreen() {
    //状態遷移　初期状態はstandby
    const screenState = useAppSelector(state => state.uiManagement.currentScreen);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [fetchNewQuestions] = api.useFetchNewQuestionsMutation();
    const [fetchAnswer] = api.useFetchAnswerMutation();

    const [fetchAudio] = api.useLazyFetchAudioQuery();
    
    //クイズリクエスト用selector
    const requestQuestionParams = useAppSelector(state => state.newRandomQuestionRequest.requestParams);
    const { sectionNumber, requestedNumOfLQuizs, speakingRate, speakerAccent } = requestQuestionParams;
    //音声リクエスト用selector
    const requestAudioParams = useAppSelector(state => state.audioManagement.requestParams);
    const { currentLQuestionId } = requestAudioParams;
    const isAudioReadyToPlay = useAppSelector(state => state.audioManagement.isAudioReadyToPlay);
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

    const handleAudioFetch = async (event: React.MouseEvent): Promise<void> => {
        dispatch(newQuestionSlice.setRequestStatus('pending'));
        //Redux stateからDTOを構築
        const randomNewQuestionReqDTO: dto.RandomNewQuestionReqDTO = {
            sectionNumber,
            requestedNumOfLQuizs,
            speakingRate
        };
        //音声データfetch test
        try {
            const testQuestionData = [
                {
                    lQuestionID: 'listening-part4-q001',
                    audioScript: 'A woman is watering plants in the garden.',
                    jpnAudioScript: '女性が庭で植物に水をやっています。',
                    answerOption: 'A',
                    sectionNumber: 1,
                    explanation: 'Part 1では写真描写問題が出題されます。写真に写っている動作や状況を正確に表現している選択肢を選ぶ必要があります。この問題では、女性が庭で植物に水をやっている様子が写真に描かれており、選択肢Aが正解となります。',
                    speakerAccent: 'American',
                    speakingRate: 1,
                    duration: 45,
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q001_20250707125205.',
                    createdAt: undefined,
                    updatedAt: undefined
                },
                {
                    lQuestionID: 'toeic-part4-q002',
                    audioScript: 'When will the meeting start? - It starts at 3 PM.',
                    jpnAudioScript: '会議はいつ始まりますか？ - 午後3時に始まります。',
                    answerOption: 'B',
                    sectionNumber: 2,
                    explanation: 'Part 2は応答問題です。質問に対する最も適切な応答を選択します。「When will the meeting start?」という時間を尋ねる疑問文に対して、「It starts at 3 PM」が最も自然な応答となります。',
                    speakerAccent: 'British',
                    speakingRate: 1,
                    duration: 42,
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q002_20250707125205.',
                    createdAt: undefined,
                    updatedAt: undefined
                },
                {
                    lQuestionID: 'toeic-part4-q003',
                    audioScript: 'Man: Good morning, I need to book a conference room for tomorrow. Woman: Sure, what time do you need it? Man: From 2 PM to 4 PM, please. Woman: Room A is available during that time.',
                    jpnAudioScript: '男性：おはようございます。明日の会議室を予約したいのですが。女性：承知いたします。何時からご利用でしょうか？男性：午後2時から4時までお願いします。女性：その時間でしたら会議室Aが空いております。',
                    answerOption: 'C',
                    sectionNumber: 3,
                    explanation: 'Part 3は会話問題です。2人以上の話者による会話を聞いて、内容に関する質問に答えます。この会話では男性が会議室の予約を取ろうとしており、女性スタッフが対応している場面です。時間と部屋の詳細が重要な情報となります。',
                    speakerAccent: 'Canadian',
                    speakingRate: 1,
                    duration: 48,
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q003_20250707125205.',
                    createdAt: undefined,
                    updatedAt: undefined
                },
                {
                    lQuestionID: 'toeic-part4-q004',
                    audioScript: 'Good afternoon, everyone. This is Sarah from the marketing department. I wanted to inform you about our upcoming product launch event scheduled for March 15th. The event will be held at the downtown convention center from 10 AM to 6 PM. We expect about 200 attendees, including potential clients and media representatives. Please make sure to prepare your presentation materials by March 10th.',
                    jpnAudioScript: '皆さん、こんにちは。マーケティング部のサラです。3月15日に予定されている新商品発表イベントについてお知らせします。イベントは午前10時から午後6時まで、ダウンタウンのコンベンションセンターで開催されます。顧客候補やメディア関係者を含む約200名の参加者を予定しています。プレゼンテーション資料は3月10日までに準備をお願いします。',
                    answerOption: 'D',
                    sectionNumber: 4,
                    explanation: 'Part 4はトーク問題です。1人の話者による説明やアナウンスを聞いて、内容に関する質問に答えます。このトークは社内向けのアナウンスで、イベントの詳細（日時、場所、参加者数、準備期限）が含まれています。',
                    speakerAccent: 'Australian',
                    speakingRate: 1,
                    duration: 50,
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q004_20250707125209.',
                    createdAt: undefined,
                    updatedAt: undefined
                },
                {
                    lQuestionID: 'toeic-part4-q005',
                    audioScript: 'Have you finished the quarterly report? - Almost, I just need to add the final numbers.',
                    jpnAudioScript: '四半期レポートは終わりましたか？ - ほぼ完成です。最終的な数字を追加するだけです。',
                    answerOption: 'A',
                    sectionNumber: 2,
                    explanation: 'Part 2の応答問題です。「Have you finished...?」という完了を尋ねる質問に対して、「Almost, I just need to...」という部分的完了を示す応答が適切です。この種の質問では、Yes/Noだけでなく、進捗状況を詳しく説明する応答も一般的です。',
                    speakerAccent: 'American',
                    speakingRate: 1,
                    duration: 44,
                    audioFilePath: '/Users/sojikoeie/Desktop/Generative_Quiz_Application/server/resources/listening-quiz-resources/lQuestion_toeic-part4-q005_20250707125209.',
                    createdAt: undefined,
                    updatedAt: undefined
                }
                ];
            const testLQuestionIdList = ['listening-part4-q001', 'toeic-part4-q002', 'toeic-part4-q003', 'toeic-part4-q004', 'toeic-part4-q005'];
            dispatch(indexSlice.setCurrentIndex(0));
            //クイズデータをredux storeに保存
            dispatch(newQuestionSlice.setQuestions(testQuestionData));

            const currentLQuestionId = testLQuestionIdList[currentQuestionIndex]; //初期状態は0

            //音声合成api呼び出し&音声データをredux storeに保存
            dispatch(audioSlice.setAudioRequest(currentLQuestionId))
            await handleFetchAudio(currentLQuestionId as string);
            dispatch(audioSlice.setRequestStatus('success'));
            dispatch(audioSlice.setIsAudioReadyToPlay(true));

            //Index管理StateにlQuestionIdListと問題indexを保存
            dispatch(indexSlice.setLQuestionIdList(lQuestionIdList));
            dispatch(indexSlice.setCurrentIndex(0));

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


    //音声再生
        const {load, error, duration, getPosition, seek, isPlaying, togglePlayPause } = useAudioPlayer();
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
                        //redux storeからもクリア
                        dispatch(audioSlice.clearAudioData());
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
    const handleAnswer = async () => {
            //回答内容をAPIに送る
            //回答レスポンスが届いたことを確認
            //stateを結果状態に更新し、結果画面（Result.tsx）に遷移(Navigate)
            //Redux stateからDTOを構築
            const testAnswerReqDTO: dto.UserAnswerReqDTO[] = [{
                lQuestionID: "listening-part4-q001",
                userID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                userAnswerOption: "A",
                reviewTag: false,
                answerDate: new Date()
            }];
            try{
                //回答内容をAPIに送る
                const answerResult = await fetchAnswer(testAnswerReqDTO);
                console.log(answerResult);
                //回答レスポンスをredux storeに保存
                dispatch(answerSlice.setAnswerData(answerResult.data as dto.UserAnswerResDTO[]));
    
                //stateを'result'に更新し、結果状態に遷移
                //dispatch(uiSlice.setCurrentScreen('result'));
    
            } catch (error) {
                console.log("回答処理失敗:", error);
            }
            //dispatch(uiSlice.setCurrentScreen('result'));
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

                    {/* ボタン群 */}
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <ButtonComponent 
                            variant="contained"
                            label="音声fetchテスト"
                            onClick={handleAudioFetch}
                            color="primary"
                            size="medium"
                            disabled={!sectionNumber || !requestedNumOfLQuizs}
                            sx={{ width: '100%', py: 1 }}
                        />

                        <ButtonComponent 
                            variant="outlined"
                            label="音声再生テスト"
                            onClick={handleAudioPlay}
                            disabled={isPlaying}
                            color="primary"
                            size="medium"
                            sx={{ width: '100%', py: 1 }}
                        />
                        <ButtonComponent 
                            variant="outlined"
                            label="回答テスト"
                            onClick={handleAnswer}
                            color="primary"
                            size="medium"
                            sx={{ width: '100%', py: 1 }}
                        />
                        <Box sx={{ width: '100%', px: 2 }}>

                        
        </Box>
                    </Box>
            </Box>
);
}

export default TestScreen