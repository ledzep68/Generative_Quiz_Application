/*********************************************

user.domeinobject.tsの機能: 

*********************************************/
import { UUID } from "crypto";

export interface UserData {
    userId: UUID;
    userName: string;
    password: string;
    hashedPassword: string;
}