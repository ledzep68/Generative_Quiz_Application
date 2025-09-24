import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import z from "zod";

import * as dto from "./dto.ts";
import {UUID} from "crypto";
import * as type from "./types.ts";

//テスト用
const testRequestParams: dto.UserAnswerReqDTO = {
    questionHash: "ca4d7e8f6294",
    //userID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    userAnswerOption: [null],
    reviewTag: true,
    answerDate: new Date()
};

const testAnswerData: dto.UserAnswerResDTO = {
    //lQuestionID: "test",
    answerOption: ["A", "B", "C"],
    isCorrectList: [true, false, true],
    audioScript: `Content: [Speaker1_FEMALE] Hi, James. I wanted to discuss the latest findings from our research project. Have you had a chance to review the data yet? 

[Speaker2_MALE] Certainly, Emma. I went through the data this morning. It looks promising, but I noticed some discrepancies in the afternoon session results. 

[Speaker1_FEMALE] Oh, that's interesting. Could you point out where exactly you found these issues? 

[Speaker2_MALE] Of course. It seems the equipment at the service station was malfunctioning, affecting the readings. 

[Speaker1_FEMALE] No problem, I'll arrange for a technician to check it out. Meanwhile, let's focus on the morning data for our presentation. 

[Speaker2_MALE] That's excellent. I'll prepare the slides with the updated information.

Questions and Choices: [QUESTION_1] What was the main topic discussed? [CHOICES_1] A. Equipment malfunction B. Research findings C. Presentation slides D. Afternoon session [QUESTION_2] When did James review the data? [CHOICES_2] A. Last night B. This morning C. Yesterday afternoon D. During lunch [QUESTION_3] What will Emma do next? [CHOICES_3] A. Prepare slides B. Review afternoon data C. Arrange a technician D. Check morning results`,
    jpnAudioScript: `会話問題  
会話内容: [話者1 女性] こんにちは、ジェームズ。私たちの研究プロジェクトの最新の発見について話したいと思いました。データを確認する時間はありましたか？

[話者2 男性] もちろんです、エマ。今朝データを確認しました。良さそうですが、午後のセッションの結果にいくつかの不一致があることに気付きました。

[話者1 女性] ああ、それは興味深いですね。具体的にどこで問題を見つけたのか教えていただけますか？

[話者2 男性] もちろんです。サービスステーションの機器が故障していて、測定値に影響を与えていたようです。

[話者1 女性] 問題ありません、技術者を手配して確認してもらいます。その間、プレゼンテーションのために午前中のデータに集中しましょう。

[話者2 男性] それは素晴らしいですね。更新された情報でスライドを準備します。

設問1: 主に話し合われたトピックは何ですか？  
選択肢: A. 機器の故障 B. 研究の発見 C. プレゼンテーションのスライド D. 午後のセッション

設問2: ジェームズはいつデータを確認しましたか？  
選択肢: A. 昨夜 B. 今朝 C. 昨日の午後 D. 昼食中

設問3: エマは次に何をしますか？  
選択肢: A. スライドを準備する B. 午後のデータを確認する C. 技術者を手配する D. 午前中の結果を確認する`,
    explanation: `正答解説: 質問1では、会話の主題が研究結果についてであるため、正解はBの「Research findings」です。EmmaとJamesは研究データについて話し合っており、データのレビューや問題点について議論しています。質問2では、Jamesがデータを確認した時間について、「this morning」と明言しているため、正解はBの「This morning」です。質問3では、Emmaが次に行うこととして、技術者を手配すると述べているので、正解はCの「Arrange a technician」です。

誤答分析: 質問1の選択肢A「Equipment malfunction」は会話中に触れられていますが、主題ではありません。C「Presentation slides」やD「Afternoon session」も会話の一部ですが、主題とは異なります。質問2の選択肢A、C、DはJamesがデータを確認した時間として明示されていません。質問3の選択肢A「Prepare slides」はJamesの役割であり、B「Review afternoon data」やD「Check morning results」はEmmaの次の行動として述べられていません。

Australian発音ポイント: オーストラリア英語では母音の変化が特徴的です。例えば、「day」が「die」に、「night」が「noight」に聞こえることがあります。また、文末に上昇調を用いることが多く、疑問文でなくても上がることがあります。この点を意識して聞くと理解が深まります。

学習アドバイス: オーストラリア英語特有の発音やイントネーションに慣れるためには、オーストラリアのニュースやポッドキャストを聞くことをお勧めします。また、会話の流れを理解するために、キーワードやフレーズに注目し、全体の文脈を把握する練習をすると良いでしょう。`
};

const initialState: type.AnswerRequestState = {
    currentSubQuestionIndex: '0',

    requestParams: {
        questionHash: undefined,
        userAnswerOption: undefined,
        reviewTag: false,
        answerDate: undefined
    },

    answerData: testAnswerData, //9/24　一時的に変更

    isValid: false,
    validationErrors: [],
    requestStatus: 'idle',
    submittedAt: undefined 
};

//バリデーション
const RequestValidationSchema = z.object({
    questionHash: z.string(),
    //userID: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) as z.ZodType<UUID>,
    userAnswerOption: z.array(z.enum(["A", "B", "C", "D"]).nullable()),
    reviewTag: z.boolean(),
    answerDate: z.date()
});
const validateParams = (state: type.AnswerRequestState): z.ZodSafeParseResult<dto.UserAnswerReqDTO> => {
    return RequestValidationSchema.safeParse(state.requestParams);
};

export const answerSlice = createSlice({
    name: "answerManagement",
    initialState,
    reducers: {
        //Part3,4 ラジオボタン押下時、小問のindexを更新
        updateSubQuestionIndex: (state, action: PayloadAction<{currentSubQuestionIndex: '0' | '1' | '2'}>) => {
            state.currentSubQuestionIndex = action.payload.currentSubQuestionIndex;
        },
        //Part3,4 小問ごとの回答を更新 Part1 2では不要
        updateSubQuestionAnswer: (state, action: PayloadAction<{
            currentSubQuestionIndex: '0' | '1' | '2';  // 小問のindex (0, 1, 2)
            answer: 'A' | 'B' | 'C' | 'D' | null;  // 回答内容
        }>) => {
            const { currentSubQuestionIndex, answer } = action.payload;
            
            //userAnswerOptionが未初期化の場合は初期化
            if (!state.requestParams?.userAnswerOption) {
                state.requestParams ??= {};
                state.requestParams.userAnswerOption = [null, null, null];
            }
            
            //指定されたindexに回答を設定
            state.requestParams.userAnswerOption[currentSubQuestionIndex] = answer;
            
            //バリデーション実行
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        setRequestParams: (state, action: PayloadAction<dto.UserAnswerReqDTO>) => {
            console.log('setRequestParams:', action.payload);
            state.requestParams = action.payload;
            
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        //回答を更新
        updateRequestParam: (state, action: PayloadAction<Partial<dto.UserAnswerReqDTO>>) => {
            state.requestParams = {...state.requestParams, ...action.payload};
            const validationResult = validateParams(state);
            state.isValid = validationResult.success;
            state.validationErrors = validationResult.success 
                ? [] 
                : validationResult.error.issues.map((issue) => issue.message);
        },
        setAnswerData: (state, action: PayloadAction<dto.UserAnswerResDTO>) => { 
            state.answerData = action.payload;
        },
        setRequestStatus: (state, action: PayloadAction<'idle' | 'pending' | 'success' | 'failed'>) => {
            //送信状態の管理
            //'idle' → 'pending' → 'success'/'failed'の遷移
            //pendingの間はUI側でボタン無効化
            //timestampの記録
            state.requestStatus = action.payload;
            switch (action.payload) {
                case 'idle':
                    state.submittedAt = undefined;
                    break;
                case 'pending':
                    state.submittedAt = Date.now();
                    state.validationErrors = [];
                    break;
                case 'success': 
                    break;
                case 'failed':
                    state.submittedAt = undefined;
                    break;
            }
        },
        clearRequestParams: (state) => {
            state.requestParams = undefined;
            state.isValid = false;
            state.validationErrors = [];
        },
        clearAnswerData: (state) => {
            state.answerData = undefined;
        }
    }
});

export const {
    updateSubQuestionIndex,
    updateSubQuestionAnswer,
    setRequestParams,
    setAnswerData,
    updateRequestParam,
    setRequestStatus,
    clearRequestParams,
    clearAnswerData
} = answerSlice.actions;

export default answerSlice.reducer;
