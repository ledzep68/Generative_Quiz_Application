/*********************************************

userdto.tsの機能: コントローラ、ビジネスロジック、モデルといったモジュール間で受け渡されるデータ構造を定義する

*********************************************/

export class UserDTO {
    constructor(userId: string, username?: string, password?: string, hashedpassword?: string) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.hashedpassword = hashedpassword
    };
    userId?: string;
    username?: string;
    password?: string;
    hashedpassword?: string
}