/*********************************************

userdto.tsの機能: クライアント/サーバ間で授受されるデータ形式を定義する

*********************************************/
import { UUID } from "crypto";

export interface RegisterReqDTO {
    userName: string;
    password: string;
    invitationCode: string;
}

export interface LoginReqDTO {
    userName: string;
    password: string;
}