export const UserResponses = {
    USER_REGISTER_SUCCESS: {
        type: "USER_REGISTER_SUCCESS",
        title: "新規登録成功",
        status: 200
    },
    /*USER_REGISTER_FAILED: {
        type: "USER_REGISTER_FAILED",
        title: "新規登録に失敗しました",
        status: 400
    },　登録失敗の原因はDBエラーかバリデーションエラーしかありえないので不要*/
    LOGIN_SUCCESS: {
        type: "LOGIN_SUCCESS",
        title: "ログイン成功",
        status: 200
    },
    LOGIN_FAILED: {
        type: "LOGIN_FAILED",
        title: "ログインに失敗しました　ユーザー名またはパスワードが正しくありません",
        status: 401 //unauthorized
    },
    VALIDATION_FAILED: {
        type: "VALIDATION_FAILED",
        title: "無効な入力形式です",
        status: 400
    },
    DB_INTERNAL_ERROR: {
        type: "DB_INTERNAL_ERROR",
        title: "DBサーバーエラーが発生しました",
        status: 500
    },
    DB_CONNECT_ERROR: {
        type: "DB_CONNECT_ERROR",
        title: "DB接続エラーが発生しました",
        status: 503
    },
    DB_OPERATION_ERROR: {
        type: "DB_OPERATION_ERROR",
        title: "DB操作エラーが発生しました",
        status: 500
    },
    UNKNOWN_SERVER_ERROR: {
        type: "UNKNOWN_SERVER_ERROR",
        title: "不明なサーバーエラーが発生しました",
        status: 500
    }
}