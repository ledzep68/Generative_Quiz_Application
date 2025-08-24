/*********************************************

userdto.tsの機能: クライアント/サーバ間で授受されるデータ形式を定義する

*********************************************/
import { UUID } from "crypto";

export interface UserDTO {
    userId: UUID;
    userName: string;
    password: string;
    hashedPassword: string;
}