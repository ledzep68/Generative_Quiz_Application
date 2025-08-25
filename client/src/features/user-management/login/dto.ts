import {UUID} from "crypto";

//新規登録用DTO
export interface RegisterReqDTO {
    userName: string;
    password: string;
    invitationCode: string;
};

//ログイン用DTO
export interface LoginReqDTO {
    userName: string;
    password: string;
};
