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

//controller層のレスポンス定義 音声配信
export const audioDeliveryControllerResponses = {
    // 成功レスポンス（実際のファイル配信なのでHTTPステータスのみ）
    AUDIO_DELIVERED: {
        type: "AUDIO_DELIVERED",
        title: "音声ファイル配信成功",
        status: 200
    },

    // エラーレスポンス
    AUDIO_NOT_FOUND: {
        type: "AUDIO_NOT_FOUND",
        title: "音声ファイルが見つかりません",
        status: 404
    },

    QUESTION_NOT_FOUND: {
        type: "QUESTION_NOT_FOUND", 
        title: "指定された問題が見つかりません",
        status: 404
    },

    AUDIO_FILE_ACCESS_ERROR: {
        type: "AUDIO_FILE_ACCESS_ERROR",
        title: "音声ファイルアクセスエラー",
        status: 500
    },

    INVALID_QUESTION_ID: {
        type: "INVALID_QUESTION_ID",
        title: "無効な問題IDです",
        status: 400
    },

    AUDIO_DELIVERY_ERROR: {
        type: "AUDIO_DELIVERY_ERROR",
        title: "音声配信エラー", 
        status: 500
    },

    UNAUTHORIZED_AUDIO_ACCESS: {
        type: "UNAUTHORIZED_AUDIO_ACCESS",
        title: "音声ファイルへの不正アクセス",
        status: 403
    },

    INTERNAL_SERVER_ERROR: {
        type: "INTERNAL_SERVER_ERROR",
        title: "内部サーバーエラー",
        status: 500
    }
};
