//共通の状態管理パラメータ
interface stateManagementParameters {
    //ユーザ入力のバリデーション結果
    isValid?: boolean,
    validationErrors?: string[],
    //クイズリクエストの状態　UI制御用（二度押し禁止　など）
    requestStatus?: 'idle' | 'pending' | 'success' | 'failed',
    //タイムスタンプ
    submittedAt?: number
}

export interface UserInformation extends stateManagementParameters {
    userName: string,
    //ログイン状態
    isLoggedIn: boolean
};