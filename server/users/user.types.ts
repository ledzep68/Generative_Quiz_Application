/*********************************************

usertypes.tsの機能: 

*********************************************/
import { Session } from "express-session";
import { UUID } from "crypto";

//セッション情報の定義
//users・listening-quiz-transactionsで共用
declare module 'express-session' {
    interface SessionData {
        userId: UUID;
        questionSet?: {
            sectionNumber: 1 | 2 | 3 | 4;
            //問題番号管理用パラメータ
            totalQuestionNum: number;
            currentIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
            //問題生成用パラメータ
            speakerList?: string[]; //Part2専用
            speakerAccentList: ("American"|"British"|"Australian"|"Canadian")[];
            settingList: { location: string; speaker: string; situation: string; }[];
            contentTopicInstructionList?: string[]; //Part3,4専用
            contentFrameworkTextList?: string[]; //Part3,4専用
            //音声生成用パラメータ
            speakingRate?: number;
        }
    }
};