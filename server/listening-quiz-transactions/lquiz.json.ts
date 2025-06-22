export const lQuizAnswerControllerResponses = {
    // 成功レスポンス
    QUIZ_ANSWER_SUCCESS: {
        type: "QUIZ_ANSWER_SUCCESS",
        title: "クイズ回答処理成功",
        status: 200
    },
    
    // エラーレスポンス
    VALIDATION_ERROR: {
        type: "VALIDATION_ERROR", 
        title: "入力値検証エラー",
        status: 400
    },
    
    DB_CONNECTION_ERROR: {
        type: "DB_CONNECTION_ERROR",
        title: "データベース接続エラー", 
        status: 500
    },
    
    ANSWER_JUDGMENT_ERROR: {
        type: "ANSWER_JUDGMENT_ERROR",
        title: "正誤判定処理エラー",
        status: 500
    },
    
    ANSWER_SAVE_ERROR: {
        type: "ANSWER_SAVE_ERROR",
        title: "回答データ保存エラー",
        status: 500
    },
    
    QUESTION_DATA_ERROR: {
        type: "QUESTION_DATA_ERROR", 
        title: "問題データ取得エラー",
        status: 500
    },
    
    INTERNAL_SERVER_ERROR: {
        type: "INTERNAL_SERVER_ERROR",
        title: "内部サーバーエラー",
        status: 500
    }
};