export interface DBError extends Error {
};

export class DBInternalError extends Error implements DBError {
    constructor( //初期値設定
        message: string, 
    ) { //各プロパティに初期値を設定
        super(message); //親クラスのコンストラクタを呼び出す
        this.name = "DBInternalError";
    }
};

export class DBConnectError extends Error implements DBError {
    constructor(
        message: string
    ) {
        super(message); 
        this.name = "DBConnectError";
    }
};

export class DBOperationError extends Error implements DBError {
    constructor(
        message: string
    ) {
        super(message);
        this.name = "DBOperationError";
    }
};