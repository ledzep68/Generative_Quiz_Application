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

import * as newQuestionSlice from "../src/features/listening-quiz-management/transaaction/newquestion.slice.ts";
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
    //const [fetchNewQuestions] = api.useFetchNewQuestionsMutation();
    const [fetchAnswer] = api.useFetchAnswerMutation();

    const [fetchAudio] = api.useLazyFetchAudioQuery();
    
    //クイズリクエスト用selector
    const requestQuestionParams = useAppSelector(state => state.newRandomQuestionRequest.requestParams);
    const { sectionNumber, requestedNumOfLQuizs, speakingRate, speakerAccent } = requestQuestionParams;
    //音声リクエスト用selector
    const requestAudioParams = useAppSelector(state => state.audioManagement.requestParams);
    const { questionHash } = requestAudioParams;
    const isAudioReadyToPlay = useAppSelector(state => state.audioManagement.isAudioReadyToPlay);
    const audioBlob = useAppSelector(state => state.audioManagement.audioData);

    //問題番号管理用selector
    const indexParams = useAppSelector(state => state.indexManagement);
    //const { lQuestionIdList, currentQuestionIndex } = indexParams;

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

            //音声合成api呼び出し&音声データをredux storeに保存
            dispatch(audioSlice.setAudioRequest("ca4d7e8f6294"))
            //await handleFetchAudio("ca4d7e8f6294");
            const audioData = await fetchAudio("ca4d7e8f6294").unwrap();
            console.log("Fetched audio data:", {
                size: audioData.size,
                type: audioData.type
            });
            //音声データをredux storeに保存
            dispatch(audioSlice.setAudioData(audioData));
            console.log("Audio data in store:", audioData);

            dispatch(audioSlice.setRequestStatus('success'));
            dispatch(audioSlice.setIsAudioReadyToPlay(true));

            //Redux storeの状態を確認
            console.log("Audio fetch SUCCESS");

            dispatch(audioSlice.setIsAudioReadyToPlay(true));
            
        } catch (error) {
            //クイズリクエスト失敗の場合の処理
            dispatch(newQuestionSlice.setRequestStatus('failed'));
            //失敗後の処理？

            //else 音声リクエスト失敗処理
        }
    };
    const handleFetchAudio = async (questionHash: string) => {
            try {
                //Node.js BlobをブラウザBlob（File（ブラウザBlobを継承したクラス））に変換（URL生成のため必須）
                const audioData = await fetchAudio(questionHash).unwrap();
                console.log("Fetched audio data:", {
                    //name: audioData.name,
                    size: audioData.size,
                    type: audioData.type,
                    //lastModified: audioData.lastModified
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
            if (audioBlob) {
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
                        //dispatch(audioSlice.clearAudioData());
                        console.log("audio play successfully ended");
                    }
                })
            };
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
            const testAnswerReqDTO: dto.UserAnswerReqDTO = {
                questionHash: "ca4d7e8f6294",
                userAnswerOption: ["A"],
                reviewTag: true,
                answerDate: new Date()
            };
            try{
                //回答内容をAPIに送る
                const answerResult = await fetchAnswer(testAnswerReqDTO);
                console.log("fetch結果: ", answerResult);
                //回答レスポンスをredux storeに保存
                dispatch(answerSlice.setAnswerData(answerResult.data as dto.UserAnswerResDTO));
                console.log("解答レスポンス: ", answerResult.data);
    
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