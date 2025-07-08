//models層のレスポンス定義
export const modelsLayerResponses = {
    // DB関連エラー
    DB_CONNECTION_ERROR: {
        type: "DB_CONNECTION_ERROR",
        title: "データベース接続エラー", 
        status: 500
    },

    QUESTION_DATA_ERROR: {
        type: "QUESTION_DATA_ERROR", 
        title: "問題データ処理エラー",
        status: 500
    },

    ANSWER_DATA_ERROR: {
        type: "ANSWER_DATA_ERROR", 
        title: "回答データ処理エラー",
        status: 500
    },

    VALIDATION_ERROR: {
        type: "VALIDATION_ERROR",
        title: "入力値検証エラー",
        status: 400
    },

    // 一般エラー
    INTERNAL_SERVER_ERROR: {
        type: "INTERNAL_SERVER_ERROR",
        title: "内部サーバーエラー",
        status: 500
    }
};

//services層のレスポンス定義① 内部ビジネスロジック専用
export const businessLogicServicesResponses = {
    // 成功レスポンス
    QUIZ_GENERATION_SUCCESS: {
        type: "QUIZ_GENERATION_SUCCESS",
        title: "クイズ生成処理成功",
        status: 200
    },
    
    // ビジネスロジック関連エラー
    ANSWER_JUDGMENT_ERROR: {
        type: "ANSWER_JUDGMENT_ERROR",
        title: "正誤判定処理エラー",
        status: 500
    },
    
    // バリデーション関連エラー（Services層でも発生）
    VALIDATION_ERROR: {
        type: "VALIDATION_ERROR",
        title: "入力値検証エラー",
        status: 400
    },
    
    ACCENT_VALIDATION_ERROR: {
        type: "ACCENT_VALIDATION_ERROR",
        title: "アクセント設定エラー",
        status: 400
    },
    
    QUESTION_COUNT_ERROR: {
        type: "QUESTION_COUNT_ERROR",
        title: "問題数設定エラー",
        status: 400
    },
    
    // 一般エラー
    INTERNAL_SERVER_ERROR: {
        type: "INTERNAL_SERVER_ERROR",
        title: "内部サーバーエラー",
        status: 500
    },
    
    UNEXPECTED_ERROR: {
        type: "UNEXPECTED_ERROR",
        title: "予期しないエラー",
        status: 500
    }
};

//services層のレスポンス定義② 外部APIとそれにまつわる処理専用
export const externalAPIServicesResponses = {
    // 成功レスポンス
    AUDIO_GENERATION_SUCCESS: {
        type: "AUDIO_GENERATION_SUCCESS",
        title: "音声生成処理成功",
        status: 200
    },
    
    // ChatGPT API関連エラー
    CHATGPT_API_ERROR: {
        type: "CHATGPT_API_ERROR",
        title: "ChatGPT API エラー",
        status: 500
    },
    
    CHATGPT_RESPONSE_VALIDATION_ERROR: {
        type: "CHATGPT_RESPONSE_VALIDATION_ERROR",
        title: "ChatGPT レスポンス形式エラー",
        status: 500
    },
    
    // Google Cloud TTS API関連エラー
    GOOGLE_TTS_API_ERROR: {
        type: "GOOGLE_TTS_API_ERROR",
        title: "Google Cloud TTS API エラー",
        status: 500
    },
    
    GOOGLE_AUTH_ERROR: {
        type: "GOOGLE_AUTH_ERROR",
        title: "Google Cloud認証エラー",
        status: 401
    },
    
    // SSML関連エラー
    SSML_VALIDATION_ERROR: {
        type: "SSML_VALIDATION_ERROR",
        title: "SSML構造エラー",
        status: 400
    },
    
    SSML_GENERATION_ERROR: {
        type: "SSML_GENERATION_ERROR",
        title: "SSML生成エラー",
        status: 500
    },
    
    // 音声処理関連エラー
    AUDIO_PROCESSING_ERROR: {
        type: "AUDIO_PROCESSING_ERROR",
        title: "音声処理エラー",
        status: 500
    },
    
    AUDIO_SPLIT_ERROR: {
        type: "AUDIO_SPLIT_ERROR",
        title: "音声分割エラー",
        status: 500
    },
    
    AUDIO_ENCODING_ERROR: {
        type: "AUDIO_ENCODING_ERROR",
        title: "音声エンコーディングエラー",
        status: 500
    },
    
    // FFmpeg関連エラー
    FFMPEG_ERROR: {
        type: "FFMPEG_ERROR",
        title: "FFmpeg処理エラー",
        status: 500
    },
    
    FFMPEG_NOT_FOUND_ERROR: {
        type: "FFMPEG_NOT_FOUND_ERROR",
        title: "FFmpegが見つかりません",
        status: 500
    },
    
    // 環境設定関連エラー
    ENVIRONMENT_CONFIG_ERROR: {
        type: "ENVIRONMENT_CONFIG_ERROR",
        title: "環境変数設定エラー",
        status: 500
    },
    
    API_KEY_ERROR: {
        type: "API_KEY_ERROR",
        title: "APIキー設定エラー",
        status: 401
    },
    
    // タイムアウト関連エラー
    API_TIMEOUT_ERROR: {
        type: "API_TIMEOUT_ERROR",
        title: "API呼び出しタイムアウト",
        status: 408
    },
    
    AUDIO_PROCESSING_TIMEOUT: {
        type: "AUDIO_PROCESSING_TIMEOUT",
        title: "音声処理タイムアウト",
        status: 408
    },
    
    // 一般エラー
    INTERNAL_SERVER_ERROR: {
        type: "INTERNAL_SERVER_ERROR",
        title: "内部サーバーエラー",
        status: 500
    },
    
    UNEXPECTED_ERROR: {
        type: "UNEXPECTED_ERROR",
        title: "予期しないエラー",
        status: 500
    }
};

//controller層のレスポンス定義① 新規クイズ生成
export const generateQuestionControllerResponses = {
    // 成功レスポンス
    QUIZ_GENERATE_SUCCESS: {
        type: "QUIZ_ANSWER_SUCCESS",
        title: "クイズ生成処理成功",
        status: 200
    },
    
    // バリデーションエラー（Controller層でリクエスト検証時に発生）
    VALIDATION_ERROR: {
        type: "VALIDATION_ERROR", 
        title: "入力値検証エラー",
        status: 400
    },
    
    // 一般エラー（Controller層での予期しないエラー）
    INTERNAL_SERVER_ERROR: {
        type: "INTERNAL_SERVER_ERROR",
        title: "内部サーバーエラー",
        status: 500
    }
};

//controller層のレスポンス定義② 回答処理
export const answerControllerResponses = {
    // 成功レスポンス
    QUIZ_ANSWER_SUCCESS: {
        type: "QUIZ_ANSWER_SUCCESS",
        title: "クイズ回答処理成功",
        status: 200
    },
    
    // バリデーションエラー（Controller層でリクエスト検証時に発生）
    VALIDATION_ERROR: {
        type: "VALIDATION_ERROR", 
        title: "入力値検証エラー",
        status: 400
    },
    
    // 一般エラー（Controller層での予期しないエラー）
    INTERNAL_SERVER_ERROR: {
        type: "INTERNAL_SERVER_ERROR",
        title: "内部サーバーエラー",
        status: 500
    }
};